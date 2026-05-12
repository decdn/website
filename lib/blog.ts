import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

// Central guard against stored-XSS via slug interpolation. Also enforces
// canonical kebab-case (no empty, leading/trailing/consecutive hyphens).
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Branded slug: once a `Slug` is produced, callers can rely on
// SLUG_RE having held. `unique symbol` makes the brand unfakeable
// across modules — no external caller can write `"foo" as Slug`
// because they can't reference this module-local symbol.
declare const __slug: unique symbol;
export type Slug = string & { readonly [__slug]: true };

export const parseSlug = (s: unknown): Slug | null =>
  typeof s === "string" && SLUG_RE.test(s) ? (s as Slug) : null;

// IsoDate mirrors Slug — parseEntry validates against ISO_DATE_RE, and
// downstream consumers (RSS feed, archive page) can rely on the brand
// rather than re-testing the regex.
declare const __isoDate: unique symbol;
export type IsoDate = string & { readonly [__isoDate]: true };

const parseIsoDate = (s: string): IsoDate | null =>
  ISO_DATE_RE.test(s) ? (s as IsoDate) : null;

export type PostMeta = {
  slug: Slug;
  title: string;
  date: IsoDate;
  summary: string;
  bucket?: string;
  tags?: string[];
  /** Whitespace-delimited token count of the raw MDX source. */
  words: number;
  /** Estimated reading time in whole minutes (>= 1), at ~200 wpm. */
  readMin: number;
};

export type PostSource = PostMeta & { body: string };

// Reading estimate from the raw MDX: markdown punctuation (`##`, `**`,
// link syntax) counts toward the total, so this runs a touch high — the
// same trade-off every "N min read" widget makes. Exported for tests.
const WORDS_PER_MINUTE = 200;
export const countWords = (s: string): number => (s.match(/\S+/g) ?? []).length;
const readingMinutes = (words: number): number =>
  Math.max(1, Math.round(words / WORDS_PER_MINUTE));

// YAML auto-coerces `YYYY-MM-DD` into a Date — coerce back so consumers
// always get a stable `2026-05-11` string. Returns empty string on
// missing/unrecognised input so the validator surfaces it.
const formatDate = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return "";
};

// Filename → slug: drop optional leading-digits ordering prefix and
// `.mdx?` extension. Frontmatter `slug:` overrides when present.
const fileToSlug = (filename: string): string =>
  filename.replace(/^\d+-/, "").replace(/\.mdx?$/, "");

const parseEntry = (filename: string): PostSource | null => {
  const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
  let parsed;
  try {
    parsed = matter(raw);
  } catch (err) {
    // gray-matter / js-yaml errors carry "line N, column M" but no
    // filename. Re-throw with file context so an operator can find the
    // bad post without grepping.
    throw new Error(
      `[blog] ${filename}: failed to parse frontmatter — ${(err as Error).message}`,
      { cause: err },
    );
  }
  const { data, content } = parsed;

  if ("draft" in data && typeof data.draft !== "boolean") {
    throw new Error(
      `[blog] ${filename}: frontmatter \`draft\` must be a boolean (got ${typeof data.draft})`,
    );
  }
  if (data.draft === true) return null;

  if ("slug" in data && typeof data.slug !== "string") {
    throw new Error(
      `[blog] ${filename}: frontmatter \`slug\` must be a string when present`,
    );
  }
  const rawSlug =
    typeof data.slug === "string" ? data.slug : fileToSlug(filename);
  const slug = parseSlug(rawSlug);
  if (slug === null) {
    throw new Error(
      `[blog] ${filename}: slug "${rawSlug}" must match ${SLUG_RE} (lowercase letters, digits, single hyphens between segments)`,
    );
  }

  if (typeof data.title !== "string" || !data.title.trim()) {
    throw new Error(`[blog] ${filename}: frontmatter \`title\` is required`);
  }
  const title = data.title.trim();

  const date = parseIsoDate(formatDate(data.date));
  if (date === null) {
    throw new Error(
      data.date === undefined
        ? `[blog] ${filename}: frontmatter \`date\` is required`
        : `[blog] ${filename}: frontmatter \`date\` must be YYYY-MM-DD (got ${JSON.stringify(data.date)})`,
    );
  }

  if (typeof data.summary !== "string" || !data.summary.trim()) {
    throw new Error(
      `[blog] ${filename}: frontmatter \`summary\` is required (used in social previews)`,
    );
  }
  const summary = data.summary.trim();

  if ("bucket" in data && typeof data.bucket !== "string") {
    throw new Error(
      `[blog] ${filename}: frontmatter \`bucket\` must be a string when present`,
    );
  }
  const bucket = typeof data.bucket === "string" ? data.bucket : undefined;

  let tags: string[] | undefined;
  if ("tags" in data) {
    const raw: unknown = data.tags;
    if (
      !Array.isArray(raw) ||
      !raw.every((t): t is string => typeof t === "string" && t.trim() !== "")
    ) {
      throw new Error(
        `[blog] ${filename}: frontmatter \`tags\` must be an array of non-empty strings when present`,
      );
    }
    // An empty `tags: []` is treated as "no tags" — same as omitting the key.
    tags = raw.length > 0 ? raw.map((t) => t.trim()) : undefined;
  }

  const words = countWords(content);

  return {
    slug,
    title,
    date,
    summary,
    bucket,
    tags,
    words,
    readMin: readingMinutes(words),
    body: content,
  };
};

// Single-process build with immutable source files; cache lets every
// call site share one parse. Errors throw before assignment so a
// malformed post can't poison the cache with a partial result.
let cache: PostSource[] | undefined;

const readEntries = (): PostSource[] => {
  if (cache) return cache;
  // The directory's presence is part of the project's contract — every
  // statically wired blog route depends on it. Falling back to `[]`
  // would silently regress to "nothing yet." in prod. If you really
  // want zero posts, leave a `.gitkeep` in `content/blog/`.
  if (!fs.existsSync(POSTS_DIR)) {
    throw new Error(
      `[blog] posts directory not found at ${POSTS_DIR}. ` +
        `If you intentionally have zero posts, create the directory with a .gitkeep.`,
    );
  }
  cache = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map(parseEntry)
    .filter((e): e is PostSource => e !== null)
    .sort((a, b) => {
      // Newest first; tie-break on slug because readdir order isn't
      // portable across filesystems and stable sort would otherwise
      // flip same-date post order between machines.
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.slug.localeCompare(b.slug);
    });
  return cache;
};

const toMeta = (e: PostSource): PostMeta => ({
  slug: e.slug,
  title: e.title,
  date: e.date,
  summary: e.summary,
  bucket: e.bucket,
  tags: e.tags,
  words: e.words,
  readMin: e.readMin,
});

export function listPosts(): PostMeta[] {
  return readEntries().map(toMeta);
}

export function getPost(slug: string): PostSource | null {
  const valid = parseSlug(slug);
  if (valid === null) return null;
  return readEntries().find((e) => e.slug === valid) ?? null;
}

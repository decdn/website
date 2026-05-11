import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

// Constrain slug shape so file-system-sourced strings can never carry
// HTML or URL-significant characters into hrefs. This is the central
// guard against the stored-XSS class — see CodeQL js/stored-xss.
// Also rejects empty strings, leading/trailing hyphens, and consecutive
// hyphens so canonical kebab-case is enforced at the boundary.
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Branded slug: once a `Slug` is produced, callers can rely on
// SLUG_RE having held. The only constructor sites are this module's
// own `parseEntry` (throws on failure) and `parseSlug` (returns null).
export type Slug = string & { readonly __brand: "Slug" };

export const parseSlug = (s: unknown): Slug | null =>
  typeof s === "string" && SLUG_RE.test(s) ? (s as Slug) : null;

export type PostMeta = {
  slug: Slug;
  title: string;
  date: string;
  summary: string;
  bucket?: string;
};

export type PostSource = PostMeta & { body: string };

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

  const date = formatDate(data.date);
  if (!ISO_DATE_RE.test(date)) {
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

  return { slug, title, date, summary, bucket, body: content };
};

// Memoise: the build is single-process and source files are immutable
// mid-build. `readEntries` is hit from `listPosts` (BlogIndex + sitemap +
// generateStaticParams = 3 sites) and `getPost` (generateMetadata + the
// page render, 2× per slug), so without the cache we'd parse the
// directory 2N+3 times. Errors are thrown before `cache` is assigned,
// so a malformed post fails the build loud rather than poisoning the
// cache with a partial result.
let cache: PostSource[] | undefined;

const readEntries = (): PostSource[] => {
  if (cache) return cache;
  if (!fs.existsSync(POSTS_DIR)) {
    cache = [];
    return cache;
  }
  cache = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map(parseEntry)
    .filter((e): e is PostSource => e !== null)
    .sort((a, b) => {
      // Newest first; ISO-8601 dates compare lexically. Tie-break on
      // slug because `fs.readdirSync` order isn't portable across
      // filesystems (Linux returns inode order, macOS returns lex
      // order on APFS but not on case-insensitive HFS+). Without the
      // tie-break, ES stable sort would preserve readdir order for
      // same-date posts and output would flip between machines.
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
});

export function listPosts(): PostMeta[] {
  return readEntries().map(toMeta);
}

export function getPost(slug: string): PostSource | null {
  return readEntries().find((e) => e.slug === slug) ?? null;
}

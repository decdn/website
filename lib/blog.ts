import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

// Constrain slug shape so file-system-sourced strings can never carry
// HTML or URL-significant characters into hrefs. This is the central
// guard against the stored-XSS class — see CodeQL js/stored-xss.
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type PostMeta = {
  slug: string;
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

// Filename → slug: drop optional `NN-` ordering prefix and `.mdx?` extension.
// Frontmatter `slug:` overrides when present.
const fileToSlug = (filename: string): string =>
  filename.replace(/^\d+-/, "").replace(/\.mdx?$/, "");

const parseEntry = (filename: string): PostSource | null => {
  const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
  const { data, content } = matter(raw);

  if (data.draft === true) return null;

  const slug = typeof data.slug === "string" ? data.slug : fileToSlug(filename);
  if (!SLUG_RE.test(slug)) {
    throw new Error(
      `[blog] ${filename}: slug "${slug}" must match ${SLUG_RE} (lowercase letters, digits, hyphens; no leading/trailing hyphen)`,
    );
  }
  if (typeof data.title !== "string" || !data.title.trim()) {
    throw new Error(`[blog] ${filename}: frontmatter \`title\` is required`);
  }
  const date = formatDate(data.date);
  if (!ISO_DATE_RE.test(date)) {
    throw new Error(
      `[blog] ${filename}: frontmatter \`date\` is required and must be YYYY-MM-DD`,
    );
  }

  return {
    slug,
    title: data.title,
    date,
    summary: typeof data.summary === "string" ? data.summary : "",
    bucket: typeof data.bucket === "string" ? data.bucket : undefined,
    body: content,
  };
};

// Memoise: the build is single-process and source files don't change
// mid-build. `readEntries` is hit from `generateStaticParams`, each
// per-slug page render, and the sitemap route — caching avoids parsing
// the directory N+2 times.
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
      // Newest first. ISO-8601 dates compare lexically. Slug is the
      // tie-break so the order is deterministic when two posts share a
      // date (otherwise the comparator violates its contract for
      // equal keys and ordering becomes engine-dependent).
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

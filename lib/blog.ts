import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  bucket?: string;
};

export type PostSource = PostMeta & { body: string };

// YAML auto-coerces `YYYY-MM-DD` into a Date — coerce back so consumers
// always get a stable `2026-05-07` string regardless of how authors quote.
const formatDate = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
};

// Filename → slug: drop optional `NN-` ordering prefix and `.mdx?` extension.
// Frontmatter `slug:` overrides when present.
const fileToSlug = (filename: string): string =>
  filename.replace(/^\d+-/, "").replace(/\.mdx?$/, "");

type Entry = PostSource & { draft: boolean };

const readEntries = (): Entry[] => {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((filename): Entry => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
      const { data, content } = matter(raw);
      const slug =
        typeof data.slug === "string" ? data.slug : fileToSlug(filename);
      return {
        slug,
        title: String(data.title ?? slug),
        date: formatDate(data.date),
        summary: String(data.summary ?? ""),
        bucket: typeof data.bucket === "string" ? data.bucket : undefined,
        body: content,
        draft: data.draft === true,
      };
    })
    .filter((e) => !e.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
};

const toMeta = (e: Entry): PostMeta => ({
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
  const found = readEntries().find((e) => e.slug === slug);
  return found ? { ...toMeta(found), body: found.body } : null;
}

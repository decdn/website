import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { BLOG_URL, ORG_ID, SITE_URL } from "./links";

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
  /** Sticks the post to the top of the index, above the date sort, with a
   *  pin marker on its row. Multiple pinned posts keep newest-first order
   *  among themselves. Defaults to false. */
  pinned: boolean;
  /** Optional per-post override for the OG/JSON-LD image. When set,
   *  consumed as-is for `og:image`, `twitter:image`, and
   *  `BlogPosting.image` — bypasses the generated
   *  `app/blog/[slug]/opengraph-image.tsx` card. Site-relative paths
   *  (leading `/`, e.g. `/blog-cards/foo.png`) are resolved against
   *  `SITE_URL` at parse time. Validated by `parseImage`: anything on our own
   *  origin — written either way — must name a real file under `public/` or
   *  the build fails. */
  image?: string;
  /** 1-based place in the series, oldest = 1. Assigned after the
   *  newest-first sort (see `readEntries`) so the index `#` column and
   *  the post page `§ NN` always agree. */
  seriesNumber: number;
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
export const readingMinutes = (words: number): number =>
  Math.max(1, Math.round(words / WORDS_PER_MINUTE));

// --- display formatters (shared by the index list and the post page) ---

// `2026-05-11` → `2026·05·11`. The machine-readable value stays in
// `<time dateTime>`; only the rendered string gets the middle dots.
export const dottedDate = (iso: string): string => iso.replaceAll("-", "·");

const pad2 = (n: number): string => String(n).padStart(2, "0");

/** `8` → `08 min`. Receives `PostMeta.readMin` (integer ≥ 1). */
export const readLabel = (min: number): string => `${pad2(min)} min`;

/** `2` → `02`. Receives `PostMeta.seriesNumber`. */
export const seriesLabel = (n: number): string => pad2(n);

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

// Frontmatter `tags`: optional array of non-empty strings. Returned
// trimmed and de-duplicated in source order; an empty `[]` is treated as
// "no tags" — same as omitting the key. Throws (with file context) on
// any other shape. Exported for tests.
export const parseTags = (
  value: unknown,
  filename: string,
): string[] | undefined => {
  if (value === undefined) return undefined;
  if (
    !Array.isArray(value) ||
    !value.every((t): t is string => typeof t === "string" && t.trim() !== "")
  ) {
    throw new Error(
      `[blog] ${filename}: frontmatter \`tags\` must be an array of non-empty strings when present`,
    );
  }
  const tags = [...new Set(value.map((t) => t.trim()))];
  return tags.length > 0 ? tags : undefined;
};

// Frontmatter `image`: optional override for the generated OG card.
// Accepts a site-relative path (leading `/` followed by a non-`/` char,
// e.g. `/blog-cards/foo.png`) — resolved against `SITE_URL`, and required
// to exist under `public/` — or an absolute http/https URL. Anything else
// (relative without `/`, protocol-relative `//`, `data:`/`mailto:`/`ftp:`
// schemes, non-string, or a site-relative path with no file on disk)
// throws with file context. Exported for tests.
//
// The non-`/` next-char constraint on the site-relative regex is what
// rejects protocol-relative `//host/path` here rather than via a
// separate guard.
const ABSOLUTE_HTTP_URL_RE = /^https?:\/\//i;
const SITE_RELATIVE_PATH_RE = /^\/[^/]/;

/** Require an image URL on our own origin to name a real file under `public/`.
 *
 *  Shared by both accepted spellings, because `/blog-cards/x.png` and
 *  `https://decdn.org/blog-cards/x.png` name the same file: checking only the
 *  site-relative form would let the copy-a-URL-from-the-browser form ship a
 *  404 with a green build.
 *
 *  `urlPath` must be a `URL.pathname` — query and fragment already gone, and
 *  `..` collapsed the way a crawler collapses it. That matters twice over: a
 *  cache-buster (`/d_logo.png?v=2`) must not be mistaken for part of the
 *  filename, and a leading `..` is *dropped* by URL normalization, so
 *  `/../public/d_logo.png` means `/public/d_logo.png` — resolving it as a
 *  filesystem path instead would re-enter `public/` and wrongly accept a URL
 *  that 404s.
 *
 *  Containment is still checked after decoding: `%2e%2e` survives URL
 *  normalization and becomes `..` only here. `realpathSync` closes the same
 *  hole for a symlink inside `public/` pointing out of it — `statSync` follows
 *  symlinks, so a lexical check alone would pass one. */
const requireShipped = (urlPath: string, raw: string, filename: string) => {
  const publicDir = path.resolve(process.cwd(), "public");
  const reject = () => {
    throw new Error(
      `[blog] ${filename}: frontmatter \`image\` "${raw}" does not resolve to a file under public/ — ` +
        `og:image, twitter:image, and the BlogPosting JSON-LD would all 404`,
    );
  };

  let decoded: string;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    reject();
    return;
  }

  const local = path.resolve(publicDir, `.${decoded}`);
  if (!local.startsWith(publicDir + path.sep)) reject();
  if (!fs.statSync(local, { throwIfNoEntry: false })?.isFile()) reject();
  if (!fs.realpathSync(local).startsWith(fs.realpathSync(publicDir) + path.sep))
    reject();
};

export const parseImage = (
  value: unknown,
  filename: string,
): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (SITE_RELATIVE_PATH_RE.test(trimmed)) {
      // A site-relative override resolves against our own origin, so we can
      // check it actually ships. `public/<path>` is copied verbatim into the
      // static export; a typo here would 404 og:image, twitter:image, AND the
      // BlogPosting JSON-LD `image` (a schema.org field Google fetches) — all
      // with a green build. A bare directory (`/presskit`) would pass a plain
      // `existsSync` yet 404 as a URL, so `requireShipped` insists on a
      // regular file inside `public/`.
      //
      // `new URL(rel, base)` handles the trailing-slash join correctly whether
      // or not SITE_URL ends in `/`, so we don't depend on that invariant. The
      // result is a fully resolved absolute URL, and its `pathname` is what a
      // crawler would actually fetch.
      const resolved = new URL(trimmed, SITE_URL);
      requireShipped(resolved.pathname, trimmed, filename);
      return resolved.toString();
    }
    if (ABSOLUTE_HTTP_URL_RE.test(trimmed)) {
      // The regex only screens for an http(s) scheme — `new URL` is the
      // real validator. It throws on syntactically invalid inputs (e.g.
      // `https://exa mple.com/foo`, `http://[::1`) and surfaces a parsed
      // hostname we can check separately to catch host-less inputs like
      // `http://` / `https://` that would otherwise parse-but-mean-
      // nothing. Distinguish the two failure modes in the message so
      // authors see the actual reason their URL was rejected.
      let parsed: URL;
      try {
        parsed = new URL(trimmed);
      } catch (err) {
        throw new Error(
          `[blog] ${filename}: frontmatter \`image\` "${trimmed}" is not a valid URL — ${(err as Error).message}`,
          { cause: err },
        );
      }
      if (parsed.hostname.length === 0) {
        throw new Error(
          `[blog] ${filename}: frontmatter \`image\` "${trimmed}" is missing a hostname`,
        );
      }
      // An absolute URL on our own origin names a file we ship, so hold it to
      // the same standard as the site-relative spelling. Off-site URLs are
      // exempt — that server's disk isn't ours to inspect.
      if (parsed.origin === new URL(SITE_URL).origin) {
        requireShipped(parsed.pathname, trimmed, filename);
      }
      // Returned verbatim (not `parsed.toString()`) so authors keep
      // control over the exact bytes that hit og:image / JSON-LD —
      // case-sensitive paths, query-string order, etc.
      return trimmed;
    }
  }
  throw new Error(
    `[blog] ${filename}: frontmatter \`image\` must be a site-relative path (leading \`/\`) or an absolute http(s) URL when present`,
  );
};

// Everything `parseEntry` can produce on its own — `seriesNumber` depends
// on the post's position in the sorted list and is filled in by `readEntries`.
type RawPost = Omit<PostSource, "seriesNumber">;

const parseEntry = (filename: string): RawPost | null => {
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

  if ("pinned" in data && typeof data.pinned !== "boolean") {
    throw new Error(
      `[blog] ${filename}: frontmatter \`pinned\` must be a boolean (got ${typeof data.pinned})`,
    );
  }
  const pinned = data.pinned === true;

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
  const tags = parseTags(data.tags, filename);
  const image = parseImage(data.image, filename);
  const words = countWords(content);

  return {
    slug,
    title,
    date,
    summary,
    bucket,
    tags,
    image,
    pinned,
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
    .filter((e): e is RawPost => e !== null)
    .sort((a, b) => {
      // Newest first; tie-break on slug because readdir order isn't
      // portable across filesystems and stable sort would otherwise
      // flip same-date post order between machines.
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.slug.localeCompare(b.slug);
    })
    // Number the series after the sort: newest gets the highest number,
    // oldest gets 1. Both the index `#` column and the post page `§ NN`
    // read this, so they can't disagree.
    .map((e, i, arr): PostSource => ({ ...e, seriesNumber: arr.length - i }));
  return cache;
};

const toMeta = (e: PostSource): PostMeta => ({
  slug: e.slug,
  title: e.title,
  date: e.date,
  summary: e.summary,
  bucket: e.bucket,
  tags: e.tags,
  image: e.image,
  pinned: e.pinned,
  seriesNumber: e.seriesNumber,
  words: e.words,
  readMin: e.readMin,
});

export function listPosts(): PostMeta[] {
  return readEntries().map(toMeta);
}

// Blog-index display order: pinned posts first, then `listPosts()`'s
// newest-first date order (stable sort holds that within each group).
// Deliberately separate from `listPosts()` so its date-sorted contract —
// relied on by the sitemap `lastmod`, OG cards, and generateStaticParams —
// is never perturbed by pinning. `seriesNumber` is assigned before pinning
// (see `readEntries`), so a pinned older post keeps its real series number.
export function listIndexPosts(): PostMeta[] {
  return [...listPosts()].sort((a, b) => Number(b.pinned) - Number(a.pinned));
}

export function getPost(slug: string): PostSource | null {
  const valid = parseSlug(slug);
  if (valid === null) return null;
  return readEntries().find((e) => e.slug === valid) ?? null;
}

// --- pure metadata builders (single-sourced so app/blog/page.tsx,
// app/blog/[slug]/page.tsx and app/blog/[slug]/opengraph-image.tsx share the
// same shapes). Each is a tiny function on plain data, deliberately decoupled
// from `next`, React, and the route handlers so the contract is unit-testable
// here.

/** Canonical URL of a post — the one place the shared JSON-LD node's URL, and
 *  the trailing slash `output: "export"` + `trailingSlash: true` require, are
 *  pinned. A dropped slash would corrupt every url-derived field of that node:
 *  `image` becomes `…/why-nowopengraph-image` (via `postImageUrl`), and the
 *  `@id` no longer matches the page the index links to.
 *
 *  Note this is not the only place the URL is built sitewide — `generateMetadata`
 *  and the prev/next links in `app/blog/[slug]/page.tsx` need a *relative* path
 *  (`metadataBase` resolves those), and `app/sitemap-pages.xml/route.ts` builds
 *  its own from `SITE_URL`. */
export const postUrl = (slug: Slug): string => `${BLOG_URL}${slug}/`;

/** OG / Twitter `images` array when the post has a frontmatter `image:`
 *  override; `undefined` when absent so the file-convention card wins.
 *  The override alt mirrors the post title because the override image
 *  doesn't carry the title visually the way the generated card does. */
export const buildOgImages = (
  post: PostMeta,
): { url: string; alt: string }[] | undefined =>
  post.image ? [{ url: post.image, alt: post.title }] : undefined;

/** BlogPosting JSON-LD `image` URL. Frontmatter override wins, otherwise
 *  the extensionless file-convention card URL — extensionless because
 *  that's how Next writes the route to `out/blog/<slug>/opengraph-image`
 *  (no `.png`). The og:image meta gets a cache-busting `?<hash>` from
 *  Next that JSON-LD doesn't have; Cloudflare ignores the query on
 *  static assets so both resolve to the same file.
 *
 *  Derives the base from `postUrl(post.slug)` rather than taking it as an
 *  argument: a caller passing a slash-less URL was the one remaining way to
 *  produce `…/why-nowopengraph-image`, the corruption #199 was about. */
export const postImageUrl = (post: PostMeta): string =>
  post.image ?? `${postUrl(post.slug)}opengraph-image`;

/** Slugs that should get a generated OG card — i.e., posts WITHOUT a
 *  frontmatter `image:` override. Filtering here means the static export
 *  doesn't emit a card PNG that no <meta> tag references. */
export const ogCardSlugs = (posts: PostMeta[]): { slug: Slug }[] =>
  posts.filter((p) => !p.image).map((p) => ({ slug: p.slug }));

/** The concrete shape of a `BlogPosting` node, narrower than the loose
 *  `Schema` both call sites accept: naming every field here turns a typo in the
 *  single builder literal (`headnline:`, `keywrds:`) into a compile error
 *  instead of a schema.org field that silently vanishes at runtime.
 *
 *  Deliberately *not* `Schema & {…}`: `Schema`'s `Record<string, unknown>`
 *  index signature suppresses excess-property checking, which let a typo on an
 *  optional field through. A closed object alias still satisfies `Schema` at
 *  the `<JsonLd data={…}>` boundary, so nothing is lost. */
type BlogPostingNode = {
  "@context": "https://schema.org";
  "@id": string;
  "@type": "BlogPosting";
  headline: string;
  description: string;
  url: string;
  mainEntityOfPage: string;
  image: string;
  keywords?: string;
  wordCount: number;
  datePublished: IsoDate;
  dateModified: IsoDate;
  author: { "@id": string };
  publisher: { "@id": string };
};

/** The shared `BlogPosting` JSON-LD node. The blog index nests it inside
 *  its `Blog` graph and the post page emits it top-level; both must agree
 *  on every field under the same `@id`, so it is assembled once here rather
 *  than twice in `app/`. Returns a full node (with `@context`/`@id`) so the
 *  post page can pass it straight to `<JsonLd>`; the index's nested copy
 *  carries a redundant-but-inert `@context`. */
export const blogPostingNode = (post: PostMeta): BlogPostingNode => {
  const url = postUrl(post.slug);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#post`,
    headline: post.title,
    description: post.summary,
    url,
    mainEntityOfPage: url,
    // Override-vs-fallback selection, and the cache-buster mismatch with the
    // og:image meta, are both explained in `postImageUrl`'s JSDoc.
    image: postImageUrl(post),
    keywords: post.tags?.join(", "),
    wordCount: post.words,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
};

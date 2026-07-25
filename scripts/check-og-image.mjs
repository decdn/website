// @ts-check
//
// Post-build guard for the social-card contract (#195, hardened for #196-200).
//
// Asserts, over every `*.html` in the static export:
//
//   1. the page declares `twitter:card=summary_large_image`, and never a
//      second, conflicting `twitter:card` value;
//   2. every `og:image` it declares is usable;
//   3. it declares a `twitter:image`, all occurrences agree on one value,
//      and that value is usable;
//   4. every URL the sitemap advertises has a file behind it in the export.
//
// "Usable" means:
//   - an absolute URL on our own origin whose path is a real regular file
//     inside the export — query string and fragment ignored, percent-escapes
//     decoded, `..` normalized the way a crawler would (a leading `..` is
//     dropped, not followed);
//   - an absolute URL on some other origin — accepted on shape alone, since
//     we cannot see that server's disk;
//   - a relative path meeting the same on-disk requirement, resolved against
//     the page's own URL. Crawlers do not reliably resolve relative values, so
//     this is tolerated only because it proves the asset shipped.
//
// Verifying same-origin URLs against disk is the point of the whole script.
// `metadataBase` is live (see AGENTS.md), so Next renders every image URL in
// this export as `https://<origin>/…` — a check that stopped at "looks like a
// URL" would pass a build with every card asset deleted. The origin is learned
// from the pages' own `rel="canonical"` rather than hardcoded, so it cannot
// drift away from `lib/links.ts`.
//
// Why *every* page and not just the ones that declare a card: Next merges
// `openGraph`/`twitter` shallowly, so a route that restates `twitter` can drop
// the object wholesale. Such a page emits no `twitter:card` at all — which,
// under a check that only inspected declarers, filtered it out of the check
// entirely and passed. Every page in this export ends up emitting all three
// tags by one route or another (root layout, the per-post `opengraph-image`
// file convention, or `inheritedOgImages(parent)` threaded explicitly — see
// `lib/metadata.ts`), so a page missing them has regressed.
//
// `og:image` and `twitter:image` are graded differently on purpose. The Open
// Graph protocol reads repeated `og:image` as an ordered preference list, so
// several distinct values are legal — every one of them must be usable, but
// they need not agree. X reads a single `twitter:image`, so two disagreeing
// values there are a coin flip and fail.
//
// Four conditions make the check refuse to pass rather than print a cheerful
// green over a guard that measured nothing — the exact failure mode #195 was
// about: an empty export, a matcher that recognizes zero pages (attribute
// order or spacing drifted in Next's HTML), an origin that cannot be
// established, and zero URLs actually verified against disk.
//
// Runs against `out/` after `pnpm build`, wired as `postbuild` so it also
// covers builders that never invoke our CI (Cloudflare Pages runs its own
// `pnpm build`). It cannot be a vitest test: CI runs `pnpm test` before
// `pnpm build`, so `out/` does not exist yet. `scripts/check-og-image.test.ts`
// covers it the other way round, spawning this file against fixture exports
// via `CHECK_OG_OUT_DIR`.
//
// Node built-ins only by design; no HTML-parsing dependency is pulled in. The
// directory walk is hand-rolled rather than `fs.globSync` so the file list —
// and therefore every failure report — is ordered deterministically across
// machines, which glob does not promise.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

// Overridable so `scripts/check-og-image.test.ts` can spawn this file against
// fixture exports. Unset in every normal invocation.
const OUT_DIR = process.env.CHECK_OG_OUT_DIR ?? "out";
const OUT_ROOT = resolve(OUT_DIR);
const SITEMAP = "sitemap-pages.xml";
const LARGE_CARD = "summary_large_image";

// The quote right after `card`/`image` keeps `twitter:image:alt`, `:width`,
// `og:image:type`, … from being counted as the image itself. Next emits
// attributes in `name|property … content` order, and Open Graph tags use
// `property=`, not `name=`, so `og:image` needs its own matcher.
//
// All three are global: a page can emit any of these tags more than once, and
// seeing every occurrence is the point. `String.match` would grade the page on
// whichever happened to come first.
const CARD = /name="twitter:card"\s+content="([^"]*)"/g;
const OG_IMAGE = /property="og:image"\s+content="([^"]*)"/g;
const TWITTER_IMAGE = /name="twitter:image"\s+content="([^"]*)"/g;
// Next renders the canonical as `<link rel="canonical" href="…"/>`. Captures
// scheme + host only.
const CANONICAL_ORIGIN = /rel="canonical"\s+href="(https?:\/\/[^/"]+)/;
const SITEMAP_LOC = /<loc>([^<]*)<\/loc>/g;

/**
 * A tag's verdict. `ok` is the only one that passes; `missing` is kept
 * distinct because the matcher-drift guard needs "did the matcher see this tag
 * at all" separately from "is the value any good". One discriminated union
 * means there is no way to spell a state like "no problem, but not declared".
 *
 * @typedef {{ kind: "ok" }
 *   | { kind: "missing" }
 *   | { kind: "conflict", detail: string }
 *   | { kind: "unusable", detail: string }} TagOutcome
 */

// `*.html`, not just `index.html`: `trailingSlash: true` routes are
// `<path>/index.html`, but the export also emits a bare `out/404.html` that
// inherits the card and would otherwise escape the check. Entries are sorted
// so the walk order — and every report built from it — is stable. Symlinks are
// neither followed nor collected: the export has none, an unfollowed cycle
// would blow the stack, and a symlinked page would be silently skipped, so if
// one ever appears we would rather see it reported as a missing page.
/** @param {string} dir @returns {string[]} */
function htmlFilesUnder(dir) {
  /** @type {string[]} */
  const found = [];
  const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...htmlFilesUnder(full));
    else if (entry.isFile() && entry.name.endsWith(".html")) found.push(full);
  }
  return found;
}

// React's `escapeTextForBrowser` escapes `&`, `<`, `>`, `"` and `'` in
// attribute values. Only `&amp;` is reversed here: a path segment is the one
// place we compare a decoded value against the filesystem, and `&` is the only
// one of the five that realistically appears in an asset path. The others would
// surface as a "file missing on disk" report naming the escaped value — ugly,
// but not a false pass.
/** @param {string} value */
const decodeAmp = (value) => value.replace(/&amp;/g, "&");

// How many same-origin URLs were actually stat'ed. Zero means the check
// measured nothing; see the guard at the bottom.
let verifiedOnDisk = 0;

/**
 * Require a URL path to be a real regular file inside the export. `urlPath`
 * must already be URL-normalized (no query, no fragment, `..` collapsed by
 * `new URL`) so what we stat is what a crawler would fetch.
 *
 * @param {string} urlPath
 * @param {string} rawValue the original value, for the message
 * @returns {string | null} why it isn't there, or null if it is
 */
function onDiskProblem(urlPath, rawValue) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch (err) {
    return `URL path is not decodable — "${rawValue}" (${/** @type {Error} */ (err).message})`;
  }

  // Leading slashes stripped first: `resolve(root, "/x")` would ignore the
  // root and hand back `/x` on the real filesystem. `new URL` has already
  // dropped any `..` that would climb above the origin, so this cannot escape
  // — the containment check is belt-and-braces against a future edit that
  // stops normalizing first.
  const target = resolve(OUT_ROOT, decoded.replace(/^\/+/, ""));
  if (target !== OUT_ROOT && !target.startsWith(OUT_ROOT + sep))
    return `resolves outside ${OUT_DIR}/ — "${rawValue}"`;

  const where = relative(process.cwd(), target);
  const stats = statSync(target, { throwIfNoEntry: false });
  if (!stats)
    return `file missing on disk — "${rawValue}" (looked for ${where})`;
  if (!stats.isFile()) return `not a regular file — "${rawValue}" (${where})`;
  verifiedOnDisk += 1;
  return null;
}

/**
 * @param {string} rawValue the tag's `content` attribute, verbatim
 * @param {string} pageUrl the page's own URL, for resolving relative values
 * @param {string} siteOrigin `https://host`, learned from the export
 * @returns {string | null} why the value is unusable, or null if it's fine
 */
function imageProblem(rawValue, pageUrl, siteOrigin) {
  if (rawValue === "") return "empty content attribute";
  if (rawValue.trim() === "") return "whitespace-only content attribute";

  const value = decodeAmp(rawValue.trim());
  // `data:`, `file:`, `mailto:` … are not fetchable by a crawler from a link.
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^https?:/i.test(value))
    return `not an http(s) URL — "${value}"`;
  if (value.startsWith("//"))
    return `protocol-relative URL — "${value}" (needs an explicit scheme)`;

  let parsed;
  try {
    // Relative values resolve against the page's own URL exactly as a crawler
    // would, so `..` and percent-escapes behave identically for both shapes
    // and only one code path ever stats the disk.
    parsed = new URL(value, pageUrl);
  } catch (err) {
    return `not a valid URL — "${value}" (${/** @type {Error} */ (err).message})`;
  }
  if (parsed.hostname.length === 0)
    return `URL is missing a hostname — "${value}"`;

  // Another origin's disk is not ours to inspect; shape is all we can check.
  if (parsed.origin !== siteOrigin) return null;
  return onDiskProblem(parsed.pathname, value);
}

/**
 * Grade one tag across all of its occurrences on a page.
 *
 * @param {string[]} values every `content` value found, in document order
 * @param {(v: string) => string | null} problemOf
 * @param {{ conflictFails: boolean }} opts `false` for `og:image`: the Open
 *   Graph protocol reads repeated tags as an ordered preference list, so
 *   distinct values are legal and each is graded on its own merits.
 * @returns {TagOutcome}
 */
function auditTag(values, problemOf, { conflictFails }) {
  if (values.length === 0) return { kind: "missing" };

  // Decode before comparing so one URL written two ways (`&` vs `&amp;`) isn't
  // mistaken for two different values.
  const distinct = [...new Set(values.map((v) => decodeAmp(v).trim()))];
  if (conflictFails && distinct.length > 1)
    return {
      kind: "conflict",
      detail: `declared ${values.length}× with conflicting values — ${distinct
        .map((v) => `"${v}"`)
        .join(", ")}`,
    };

  // Every occurrence must be usable. For `og:image` that is what lets a
  // legitimate second image pass while an empty duplicate still fails: a
  // crawler may follow either one.
  for (const value of values) {
    const problem = problemOf(value);
    if (problem !== null) return { kind: "unusable", detail: problem };
  }
  return { kind: "ok" };
}

/** @param {string} html @param {RegExp} pattern @returns {string[]} */
const valuesOf = (html, pattern) =>
  [...html.matchAll(pattern)].map((m) => m[1]);

/** The page's own URL, so relative image values resolve against it. */
/** @param {string} file @param {string} siteOrigin */
const pageUrlFor = (file, siteOrigin) =>
  new URL(
    `/${relative(OUT_ROOT, resolve(file)).split(sep).join("/")}`,
    siteOrigin,
  ).toString();

let files;
try {
  files = htmlFilesUnder(OUT_ROOT);
} catch (err) {
  const { code } = /** @type {NodeJS.ErrnoException} */ (err);
  // ENOTDIR (`out` exists as a file) and EACCES are as fatal as a missing
  // directory and want the same hint, not a raw scandir stack trace.
  if (code !== "ENOENT" && code !== "ENOTDIR" && code !== "EACCES") throw err;
  console.error(
    `[check:og-image] cannot read ${OUT_DIR}/ (${code}) — run \`pnpm build\` first`,
  );
  process.exit(1);
}

if (files.length === 0) {
  console.error(
    `[check:og-image] no ${OUT_DIR}/**/*.html found — run \`pnpm build\` first`,
  );
  process.exit(1);
}

// Read every page up front: one unreadable file becomes an offender rather
// than an exception that discards the report for all the others.
/** @type {{ file: string, problem: string }[]} */
const unreadable = [];
const sources = [];
for (const file of files) {
  const name = relative(process.cwd(), file);
  try {
    sources.push({ file, name, html: readFileSync(file, "utf8") });
  } catch (err) {
    const { code } = /** @type {NodeJS.ErrnoException} */ (err);
    unreadable.push({ file: name, problem: `unreadable — ${code}` });
  }
}

// Collect the raw tag values before grading any of them: whether a matcher saw
// a tag at all is knowable without the site origin, and it gives the better
// diagnosis when an export turns out to hold no pages.
const tagged = sources.map((source) => ({
  ...source,
  cards: valuesOf(source.html, CARD),
  ogValues: valuesOf(source.html, OG_IMAGE),
  twitterValues: valuesOf(source.html, TWITTER_IMAGE),
}));

const declarerCounts = /** @type {[string, number][]} */ ([
  ["twitter:card", tagged.filter((p) => p.cards.length > 0).length],
  ["og:image", tagged.filter((p) => p.ogValues.length > 0).length],
  ["twitter:image", tagged.filter((p) => p.twitterValues.length > 0).length],
]);
const blind = declarerCounts.filter(([, count]) => count === 0);

// All three matchers blind => these files aren't pages at all, which is a
// different diagnosis from Next's HTML drifting under one matcher.
if (blind.length === declarerCounts.length) {
  console.error(
    `[check:og-image] none of the ${tagged.length} HTML files under ${OUT_DIR}/ carry any of ` +
      "twitter:card, og:image or twitter:image — this export contains no pages. " +
      "Refusing to pass a no-op check.",
  );
  process.exit(1);
}

// Every page here emits all three tags, so recognizing zero of any one of them
// means that matcher drifted against Next's HTML and that part of the check has
// silently become a no-op. Refuse to pass rather than print a cheerful green
// over a guard that validated nothing. Runs before the per-page reports so
// drift can't masquerade as "every page regressed at once".
if (blind.length > 0) {
  for (const [tag] of blind) {
    console.error(
      `[check:og-image] recognized 0 ${tag} tags across ${tagged.length} built pages — ` +
        "the matcher almost certainly drifted against Next's HTML output. " +
        "Refusing to pass a no-op check.",
    );
  }
  process.exit(1);
}

// The origin comes from the export's own canonical tags, so it tracks
// `lib/links.ts` automatically. Anything other than exactly one means we have
// no basis for deciding which URLs we own and could verify.
const origins = [
  ...new Set(
    sources
      .map((s) => s.html.match(CANONICAL_ORIGIN)?.[1])
      .filter((o) => o !== undefined),
  ),
];
if (origins.length !== 1) {
  console.error(
    `[check:og-image] could not establish a single site origin from rel="canonical" across ` +
      `${sources.length} pages (found ${origins.length === 0 ? "none" : origins.join(", ")}). ` +
      "Same-origin image URLs could not be verified against the export, so the check would " +
      "prove nothing. Refusing to pass a no-op check.",
  );
  process.exit(1);
}
const SITE_ORIGIN = origins[0];

const pages = tagged.map(({ file, name, cards, ogValues, twitterValues }) => {
  const pageUrl = pageUrlFor(file, SITE_ORIGIN);
  /** @param {string} v */
  const problemOf = (v) => imageProblem(v, pageUrl, SITE_ORIGIN);
  return {
    file: name,
    // The card is a fixed token, not a URL: it only has to be present, be
    // `summary_large_image`, and not contradict itself.
    card: auditTag(
      cards,
      (v) =>
        v.trim() === LARGE_CARD ? null : `declares "${v}", not ${LARGE_CARD}`,
      { conflictFails: true },
    ),
    og: auditTag(ogValues, problemOf, { conflictFails: false }),
    twitter: auditTag(twitterValues, problemOf, { conflictFails: true }),
  };
});

// Every URL the sitemap advertises must have a file behind it. The sitemap is
// generated from `content/blog/`, the closed `LEGAL_SLUGS` list and the
// hand-maintained page list, so it is the export's own inventory — without
// this, an export that lost every blog post (a `generateStaticParams` that
// returns `[]` still builds successfully) would pass on the survivors.
/** @type {{ file: string, problem: string }[]} */
const missingFromExport = [];
const sitemapPath = resolve(OUT_ROOT, SITEMAP);
const sitemapXml = statSync(sitemapPath, { throwIfNoEntry: false })?.isFile()
  ? readFileSync(sitemapPath, "utf8")
  : null;
if (sitemapXml === null) {
  console.error(
    `[check:og-image] ${OUT_DIR}/${SITEMAP} is missing — that file is the export's own page ` +
      "inventory. Refusing to pass a check that cannot tell which pages should exist.",
  );
  process.exit(1);
}
for (const [, loc] of sitemapXml.matchAll(SITEMAP_LOC)) {
  let parsed;
  try {
    parsed = new URL(loc);
  } catch {
    missingFromExport.push({ file: loc, problem: "not a valid URL" });
    continue;
  }
  // Off-origin entries (the docs sitemap) belong to a different deployment.
  if (parsed.origin !== SITE_ORIGIN) continue;
  // `trailingSlash: true` writes routes as `<path>/index.html`; a `<loc>` with
  // a file extension is a static asset served as-is.
  const urlPath = parsed.pathname.endsWith("/")
    ? `${parsed.pathname}index.html`
    : parsed.pathname;
  const problem = onDiskProblem(urlPath, loc);
  if (problem !== null) missingFromExport.push({ file: loc, problem });
}

let failed = false;

/**
 * @param {string} headline
 * @param {{ file: string, problem?: string }[]} offenders
 * @param {string} hint
 */
const report = (headline, offenders, hint) => {
  if (offenders.length === 0) return;
  failed = true;
  console.error(`[check:og-image] ${headline}`);
  for (const { file, problem } of offenders) {
    console.error(problem ? `  - ${file} — ${problem}` : `  - ${file}`);
  }
  console.error(`\n${hint}\n`);
};

/** @param {"card" | "og" | "twitter"} tag @param {TagOutcome["kind"][]} kinds */
const offendersOf = (tag, ...kinds) =>
  pages
    .filter((p) => kinds.includes(p[tag].kind))
    .map((p) => ({
      file: p.file,
      problem:
        p[tag].kind === "missing"
          ? "tag missing"
          : /** @type {any} */ (p[tag]).detail,
    }));

report(
  "pages could not be read:",
  unreadable,
  "Every other page was still checked. Fix the permissions or the truncated file and re-run.",
);

report(
  `pages do not declare twitter:card=${LARGE_CARD}:`,
  offendersOf("card", "missing", "unusable"),
  "Every page inherits the card from the root layout, so a page missing it lost the whole " +
    "`twitter` object — Next merges `openGraph`/`twitter` shallowly, so a route that restates " +
    "`twitter` must re-thread card and image (see lib/metadata.ts).",
);

report(
  "pages declare conflicting twitter:card values:",
  offendersOf("card", "conflict"),
  "Which one X honours is unspecified. Emit exactly one card type per page.",
);

report(
  "pages ship an unusable og:image:",
  offendersOf("og", "missing", "unusable"),
  "Slack, Discord, WhatsApp and LinkedIn read og:image — each of these renders a blank " +
    "unfurl. Repeated og:image tags are a legal preference list, but every one has to " +
    "resolve, and a same-origin URL must point at a file that actually shipped.",
);

report(
  "pages ship an unusable twitter:image:",
  offendersOf("twitter", "missing", "unusable"),
  "Each would render a blank social card. Thread an image URL through the page's twitter " +
    "metadata (see lib/metadata.ts); a same-origin URL must point at a file that shipped.",
);

report(
  "pages declare conflicting twitter:image values:",
  offendersOf("twitter", "conflict"),
  "X reads a single twitter:image and which duplicate it picks is unspecified. Emit one.",
);

report(
  `URLs in ${SITEMAP} with nothing behind them in the export:`,
  missingFromExport,
  "The sitemap is generated from content/blog/, LEGAL_SLUGS and the page list, so each of " +
    "these is a page or asset that should have been written to the export and wasn't. " +
    "Google would crawl straight into a 404.",
);

if (failed) process.exit(1);

// Nothing stat'ed => every value took the off-origin fast path and the check
// proved only that tags exist. Same reasoning as the drift guard: refuse.
if (verifiedOnDisk === 0) {
  console.error(
    `[check:og-image] verified 0 URLs against ${OUT_DIR}/ on disk — every value pointed ` +
      `off-origin, so nothing was proven to have shipped (expected ${SITE_ORIGIN} URLs). ` +
      "Refusing to pass a no-op check.",
  );
  process.exit(1);
}

console.log(
  `[check:og-image] ${pages.length} built pages all declare twitter:card=${LARGE_CARD} with a ` +
    `usable og:image and twitter:image; ${verifiedOnDisk} same-origin URLs (images + ${SITEMAP} ` +
    `entries) verified against ${OUT_DIR}/ on disk.`,
);

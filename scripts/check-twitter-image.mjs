// Post-build guard for the social-card contract (#195, hardened for #196-199).
//
// Asserts, over every `*.html` in the static export:
//
//   1. the page declares `twitter:card=summary_large_image`;
//   2. it declares at least one `og:image` whose value is usable;
//   3. it declares at least one `twitter:image` whose value is usable;
//   4. it never declares the same tag twice with conflicting values.
//
// "Usable" means an absolute `http(s)://` URL, or — for a relative path —
// a real file at that path inside the export (query string and fragment
// ignored, `..` escapes rejected, must be a regular file). Crawlers don't
// resolve site-relative paths against the page, so a relative value is only
// tolerated because it at least proves the asset shipped.
//
// Why *every* page and not just the ones that declare a card: Next merges
// `openGraph`/`twitter` shallowly, so a route that restates `twitter` can drop
// the object wholesale. Such a page emits no `twitter:card` at all — which,
// under a check that only inspected declarers, filtered it out of the check
// entirely and passed. The tags are inherited from the root layout, so every
// page in this export is required to carry them; a page that lost them
// regressed. `og:image` gets the same treatment because Slack, Discord,
// WhatsApp and LinkedIn read `og:image`, not `twitter:*`.
//
// The image reaches these pages via four different mechanisms (root file
// convention, the blog index, the per-post `opengraph-image`, threaded legal
// images), so this HTML-level assertion over the export is the only single
// place that covers all of them at once.
//
// Recognizing zero pages for any of the three matchers means the matcher
// drifted against Next's HTML and the check silently became a no-op; that is
// reported as its own failure rather than as "every page is broken".
//
// Runs against `out/` after `pnpm build` (a vitest test can't — CI runs
// `pnpm test` before `pnpm build`, so `out/` doesn't exist yet). Uses only
// Node built-ins by design; no HTML-parsing dependency is pulled in, and the
// directory walk is hand-rolled so the script carries no Node version floor
// of its own (`fs.globSync` would require >= 22).

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

const OUT_DIR = "out";
const OUT_ROOT = resolve(OUT_DIR);

// The quote right after `card`/`image` keeps `twitter:image:alt`, `:width`,
// `og:image:type`, … from being counted as the image itself. Next emits
// attributes in `name|property … content` order, and Open Graph tags use
// `property=`, not `name=`, so `og:image` needs its own matcher.
const DECLARES_LARGE_IMAGE =
  /name="twitter:card"\s+content="summary_large_image"/;
// Global: a page can emit the tag more than once (e.g. an empty one from the
// layout plus a real one from the route). `matchAll` sees all of them —
// `String.match` would judge the page on whichever came first.
const OG_IMAGE = /property="og:image"\s+content="([^"]*)"/g;
const TWITTER_IMAGE = /name="twitter:image"\s+content="([^"]*)"/g;

// `*.html`, not just `index.html`: `trailingSlash: true` routes are
// `<path>/index.html`, but the export also emits a bare `out/404.html` that
// inherits `summary_large_image` and would otherwise escape the check.
// Symlinks are deliberately not followed (the export has none, and a cycle
// would hang the walk).
function htmlFilesUnder(dir) {
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

// React escapes `&` in attribute values; a path or query can legitimately
// contain one, and we compare the path against the filesystem.
const decodeAmp = (value) => value.replace(/&amp;/g, "&");

// Returns a human-readable reason the value is unusable, or null if it's fine.
function imageProblem(rawValue, pageDir) {
  if (rawValue === "") return "empty content attribute";
  if (rawValue.trim() === "") return "whitespace-only content attribute";

  const value = decodeAmp(rawValue.trim());
  // Absolute http(s) with a non-empty host: the only form every crawler
  // resolves. Anything else with a scheme (`data:`, `file:`) or a
  // protocol-relative `//host/...` is not fetchable from a shared link.
  if (/^https?:\/\/[^/\s]/i.test(value)) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith("//"))
    return `not an absolute http(s) URL — "${value}"`;

  const pathOnly = value.split(/[?#]/)[0];
  if (pathOnly === "") return `URL with no path — "${value}"`;

  let decoded;
  try {
    decoded = decodeURIComponent(pathOnly);
  } catch {
    return `URL path is not decodable — "${value}"`;
  }

  // Leading slashes stripped first: `resolve(root, "/x")` would ignore the
  // root and hand back `/x` on the real filesystem.
  const target = decoded.startsWith("/")
    ? resolve(OUT_ROOT, decoded.replace(/^\/+/, ""))
    : resolve(pageDir, decoded);
  if (target !== OUT_ROOT && !target.startsWith(OUT_ROOT + sep))
    return `resolves outside ${OUT_DIR}/ — "${value}"`;

  const where = relative(process.cwd(), target);
  const stats = statSync(target, { throwIfNoEntry: false });
  if (!stats) return `file missing on disk — "${value}" (looked for ${where})`;
  if (!stats.isFile()) return `not a regular file — "${value}" (${where})`;
  return null;
}

// A page passes if it declares the tag at least once, every occurrence agrees
// on a value, and at least one occurrence is usable. Conflicting duplicates
// fail even when one of them is valid: which one a crawler picks is
// unspecified, so the card is a coin flip.
function auditTag(html, pattern, pageDir) {
  const values = [...html.matchAll(pattern)].map((m) => m[1]);
  if (values.length === 0) return { declared: false, problem: "tag missing" };

  const distinct = [...new Set(values.map((v) => v.trim()))];
  if (distinct.length > 1)
    return {
      declared: true,
      problem: `declared ${values.length}× with conflicting values — ${distinct
        .map((v) => `"${v}"`)
        .join(", ")}`,
    };

  const problems = values.map((v) => imageProblem(v, pageDir));
  if (problems.some((p) => p === null)) return { declared: true };
  return { declared: true, problem: problems[0] };
}

let files;
try {
  files = htmlFilesUnder(OUT_ROOT);
} catch (err) {
  if (err.code !== "ENOENT") throw err;
  files = [];
}

if (files.length === 0) {
  console.error(
    `[check:og-image] no ${OUT_DIR}/**/*.html found — run \`pnpm build\` first`,
  );
  process.exit(1);
}

const pages = files.map((file) => {
  const html = readFileSync(file, "utf8");
  const pageDir = dirname(resolve(file));
  return {
    file: relative(process.cwd(), file),
    declaresLargeImage: DECLARES_LARGE_IMAGE.test(html),
    og: auditTag(html, OG_IMAGE, pageDir),
    twitter: auditTag(html, TWITTER_IMAGE, pageDir),
  };
});

// Every page here inherits all three tags from the root layout, so recognizing
// zero of any one of them means that matcher drifted against Next's HTML (an
// attribute-order or spacing change) and that part of the check has silently
// become a no-op. Refuse to pass rather than print a cheerful green over a
// guard that validated nothing — the exact failure mode #195 was about. These
// run before the per-page reports so matcher drift doesn't masquerade as
// "every page in the export regressed at once".
const drift = [
  [
    "twitter:card=summary_large_image",
    pages.filter((p) => p.declaresLargeImage),
  ],
  ["og:image", pages.filter((p) => p.og.declared)],
  ["twitter:image", pages.filter((p) => p.twitter.declared)],
].filter(([, recognized]) => recognized.length === 0);

if (drift.length > 0) {
  for (const [tag] of drift) {
    console.error(
      `[check:og-image] recognized 0 ${tag} tags across ${files.length} built pages — ` +
        "the matcher almost certainly drifted against Next's HTML output. " +
        "Refusing to pass a no-op check.",
    );
  }
  process.exit(1);
}

let failed = false;

const report = (headline, offenders, hint) => {
  if (offenders.length === 0) return;
  failed = true;
  console.error(`[check:og-image] ${headline}`);
  for (const { file, problem } of offenders) {
    console.error(problem ? `  - ${file} — ${problem}` : `  - ${file}`);
  }
  console.error(`\n${hint}\n`);
};

report(
  "pages do not declare twitter:card=summary_large_image:",
  pages.filter((p) => !p.declaresLargeImage),
  "Every page inherits it from the root layout, so a page missing it lost the whole " +
    "`twitter` object — Next merges `openGraph`/`twitter` shallowly, so a route that " +
    "restates `twitter` must re-thread card and image (see lib/metadata.ts).",
);

report(
  "pages ship no usable og:image:",
  pages.filter((p) => p.og.problem).map((p) => ({ ...p, ...p.og })),
  "Slack, Discord, WhatsApp and LinkedIn read og:image — each of these renders a " +
    "blank unfurl. Thread an absolute image URL through the page's openGraph metadata.",
);

report(
  "pages ship no usable twitter:image:",
  pages.filter((p) => p.twitter.problem).map((p) => ({ ...p, ...p.twitter })),
  "Each would render a blank social card. Thread an absolute image URL through the " +
    "page's twitter metadata (see lib/metadata.ts).",
);

if (failed) process.exit(1);

console.log(
  `[check:og-image] ${files.length} built pages all declare summary_large_image — ` +
    `${pages.filter((p) => !p.og.problem).length} carry a valid og:image, ` +
    `${pages.filter((p) => !p.twitter.problem).length} a valid twitter:image.`,
);

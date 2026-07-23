// Post-build guard for the end-to-end contract #195 fixed by hand:
//
//   every page that declares `twitter:card=summary_large_image`
//   must also declare a non-empty `twitter:image`.
//
// Next merges `openGraph`/`twitter` shallowly, so a route that restates
// `twitter` without re-threading the image ships a blank social card with
// a green build and no signal anywhere. The image reaches these pages via
// four different mechanisms (root file convention, the blog index, the
// per-post `opengraph-image`, threaded legal images), so this HTML-level
// assertion over the static export is the only single place that covers
// all of them at once.
//
// Runs against `out/` after `pnpm build` (a vitest test can't — CI runs
// `pnpm test` before `pnpm build`, so `out/` doesn't exist yet). Uses only
// Node built-ins by design; no HTML-parsing dependency is pulled in.

import { globSync, readFileSync } from "node:fs";

const OUT_DIR = "out";

// `name="twitter:image"` (quote right after `image`) so we don't count
// `twitter:image:alt`/`:width`/… as the image itself; content must be
// non-empty. Next emits attributes in `name … content` order.
const DECLARES_LARGE_IMAGE =
  /name="twitter:card"\s+content="summary_large_image"/;
// Capture the content so a whitespace-only value (`content="   "`) counts as
// no image — a non-empty match alone wouldn't render a usable card.
const IMAGE_CONTENT = /name="twitter:image"\s+content="([^"]*)"/;

// `*.html`, not just `index.html`: `trailingSlash: true` routes are
// `<path>/index.html`, but the export also emits a bare `out/404.html` that
// inherits `summary_large_image` and would otherwise escape the check.
const files = globSync(`${OUT_DIR}/**/*.html`);

if (files.length === 0) {
  console.error(
    `[check:og-image] no ${OUT_DIR}/**/*.html found — run \`pnpm build\` first`,
  );
  process.exit(1);
}

const pages = files.map((file) => {
  const html = readFileSync(file, "utf8");
  return {
    file,
    declaresLargeImage: DECLARES_LARGE_IMAGE.test(html),
    image: html.match(IMAGE_CONTENT)?.[1] ?? "",
  };
});

// Every page here inherits `summary_large_image` from the root layout, so
// recognizing zero declarers means the matcher drifted against Next's HTML
// (an attribute-order or spacing change) and the whole check has silently
// become a no-op. Refuse to pass rather than print a cheerful green over a
// guard that validated nothing — the exact failure mode #195 was about.
const declarers = pages.filter((p) => p.declaresLargeImage);
if (declarers.length === 0) {
  console.error(
    `[check:og-image] recognized 0 summary_large_image pages across ${files.length} built pages — ` +
      "the twitter:card matcher almost certainly drifted against Next's HTML output. " +
      "Refusing to pass a no-op check.",
  );
  process.exit(1);
}

const offenders = declarers.filter((p) => p.image.trim() === "");

if (offenders.length > 0) {
  console.error(
    "[check:og-image] pages declare twitter:card=summary_large_image but ship no twitter:image:",
  );
  for (const { file } of offenders) console.error(`  - ${file}`);
  console.error(
    "\nEach would render a blank social card. Thread an image through the page's " +
      "openGraph/twitter metadata (see lib/metadata.ts).",
  );
  process.exit(1);
}

console.log(
  `[check:og-image] ${declarers.length} of ${files.length} pages declare summary_large_image — all carry a non-empty image.`,
);

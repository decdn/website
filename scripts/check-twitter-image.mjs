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
const HAS_IMAGE = /name="twitter:image"\s+content="[^"]+"/;

const files = globSync(`${OUT_DIR}/**/index.html`);

if (files.length === 0) {
  console.error(
    `[check:og-image] no ${OUT_DIR}/**/index.html found — run \`pnpm build\` first`,
  );
  process.exit(1);
}

const offenders = files.filter((file) => {
  const html = readFileSync(file, "utf8");
  return DECLARES_LARGE_IMAGE.test(html) && !HAS_IMAGE.test(html);
});

if (offenders.length > 0) {
  console.error(
    "[check:og-image] pages declare twitter:card=summary_large_image but ship no twitter:image:",
  );
  for (const file of offenders) console.error(`  - ${file}`);
  console.error(
    "\nEach would render a blank social card. Thread an image through the page's " +
      "openGraph/twitter metadata (see lib/metadata.ts).",
  );
  process.exit(1);
}

console.log(
  `[check:og-image] ${files.length} pages checked — every summary_large_image page carries an image.`,
);

// Post-build assertions against ./out — the things only a real build can show.
//
// `pnpm test` runs against modules, so it can prove that llms.txt lists a post
// and that the sitemap lists llms.txt, but not that either file exists once
// `output: "export"` has run. These failures live in exactly that gap:
//
//   1. A <loc> or a curated-index entry pointing at a route the build stopped
//      emitting. The sitemap's two llms entries are string literals with no
//      reference to the route handlers, so deleting app/llms.txt/route.ts is
//      invisible to every unit test.
//   2. A dotted route segment losing its dot and landing as
//      `out/llms.txt/index.html` instead of `out/llms.txt` — the one thing
//      making these real files under `trailingSlash: true`.
//   3. HeroTerminal dropping its disclaimer caption. It is a client component
//      that the tree walker cannot invoke, so the built HTML is the only place
//      its caption can be observed.
//   4. The mobile menu toggle leaving the prerendered HTML. MobileMenu is a
//      client component too; if it is ever gated behind hydration again (the
//      cause of #322), the hamburger pops in late on phones, and only the
//      built HTML can show it is missing.
//   5. The toggle moving back inside the Primary <nav>. The nav is a stacking
//      context, so a nested toggle sits under the drawer panel and the close
//      × is hidden; Chrome is a hooks client component, so again only the
//      built HTML can show where it landed.
//   6. An inline <svg> without width/height attributes. Its size lives in a
//      Tailwind class, so a paint before the stylesheet applies draws it at
//      its container's full width — on reload in Firefox (Linux) the hero's
//      litepaper glyph showed as a container-wide blue block for ~250ms. Why
//      Firefox painted early is unconfirmed (a script forcing layout mid-load
//      is its documented trigger; headless runs did not reproduce it). TryIt's
//      chevron sits in a hooks client component, so only the built HTML shows
//      its prerendered markup.
//
// The numbered checks below are assertions, not the failure classes above.
//
// Exits non-zero with the specific failures listed. Run by `pnpm build`.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out");
const ORIGIN = "https://decdn.org";

const failures = [];
const fail = (message) => failures.push(message);

const read = (relative) => {
  const file = path.join(OUT, relative);
  if (!existsSync(file)) {
    fail(`${relative}: not emitted`);
    return null;
  }
  return readFileSync(file, "utf8");
};

/** True when the URL is on this origin.
 *
 *  Compares the *parsed* origin rather than a string prefix: `ORIGIN` is a
 *  prefix of `https://decdn.org.example.test/x`, which is a different host
 *  entirely, so `startsWith(ORIGIN)` would hand an off-origin URL to
 *  `assertResolves` and check its path against our own out/. Unparseable
 *  input is not same-origin, which makes callers report it rather than throw. */
const isSameOrigin = (url) => {
  try {
    return new URL(url).origin === ORIGIN;
  } catch {
    return false;
  }
};

/** Map a same-origin URL to the file the static export should have written.
 *  `trailingSlash: true` means a directory route is `<path>/index.html`; a
 *  dotted final segment (llms.txt, sitemap.xml, the PDF) is a real file. */
const fileFor = (url) => {
  const { pathname } = new URL(url);
  return pathname.endsWith("/") ? `${pathname}index.html` : pathname;
};

const assertResolves = (url, source) => {
  const relative = fileFor(url).replace(/^\//, "");
  if (!existsSync(path.join(OUT, relative))) {
    fail(`${source}: ${url} → out/${relative} does not exist`);
  }
};

// 1. Every <loc> in the page sitemap resolves.
const sitemap = read("sitemap-pages.xml");
if (sitemap) {
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (locs.length === 0) fail("sitemap-pages.xml: no <loc> entries");
  for (const loc of locs) {
    if (!isSameOrigin(loc)) {
      fail(`sitemap-pages.xml: <loc> is not on ${ORIGIN}: ${loc}`);
      continue;
    }
    assertResolves(loc, "sitemap-pages.xml");
  }
}

// 2. Every same-origin URL either llms surface advertises resolves. Off-origin
//    entries (docs.decdn.org, built by Mintlify; the GitHub source repos) are
//    out of reach from here.
for (const surface of ["llms.txt", "llms-full.txt"]) {
  const text = read(surface);
  if (!text) continue;
  const urls = [...text.matchAll(/https:\/\/[^\s)<>"']+/g)]
    .map((m) => m[0].replace(/[.,]$/, ""))
    .filter(isSameOrigin);
  const unique = [...new Set(urls)];
  if (unique.length === 0) fail(`${surface}: advertises no same-origin URL`);
  for (const url of unique) assertResolves(url, surface);
}

// 3. Both panel captions survive into the rendered homepage. They are the
//    only text-extractor-visible statement of what the aria-hidden live
//    figures are.
const home = read("index.html");
if (home) {
  const captions = {
    "HeroTerminal (settlement feed)": "Live deCDN settlement feed.",
    "FleetStatus (fleet panel)": "Live deCDN fleet panel.",
  };
  for (const [name, caption] of Object.entries(captions)) {
    if (!home.includes(caption)) {
      fail(`index.html: ${name} caption missing — live figures ship bare`);
    }
  }

  // 4. The site-level JSON-LD graph. app/layout.tsx cannot be unit-tested
  //    (next/font/google only resolves under Next's build transform), so its
  //    three nodes are asserted here alongside the homepage's FAQPage.
  for (const id of ["#organization", "#website", "#service", "#faq"]) {
    if (!home.includes(`${ORIGIN}/${id}`)) {
      fail(`index.html: JSON-LD node ${id} missing from the graph`);
    }
  }

  // 5. The llms.txt alternate link the root layout advertises.
  if (!home.includes(`href="${ORIGIN}/llms.txt"`)) {
    fail('index.html: <link rel="alternate" ... llms.txt> missing');
  }

  // 6. The mobile menu toggle and the panel its aria-controls names are in
  //    the static HTML, so the hamburger is in the first paint (#322).
  for (const marker of ['aria-controls="mm-panel"', 'id="mm-panel"']) {
    if (!home.includes(marker)) {
      fail(`index.html: ${marker} not prerendered — the toggle pops in late`);
    }
  }

  // 7. The toggle is a sibling of the Primary nav, not inside it: the nav's
  //    fixed z-50 is a stacking context and the toggle must clear the panel.
  //    Navs never nest, so the lazy match ends at the Primary nav's own close.
  const nav = home.match(/<nav[^>]*aria-label="Primary"[^>]*>[\s\S]*?<\/nav>/);
  if (!nav) {
    fail('index.html: <nav aria-label="Primary"> not found');
  } else if (nav[0].includes('aria-controls="mm-panel"')) {
    fail(
      "index.html: mobile menu toggle is inside <nav> — it sits under the drawer panel",
    );
  }
}

// 8. Every prerendered inline <svg> carries non-empty width and height, so a
//    paint before the stylesheet applies draws it at that size, not at full
//    container width. An <svg> mounted after hydration (SelectMenu's check
//    mark) is not in out/ and does not need to be — the CSS has applied by
//    then; SelectMenu.test.ts covers it. The homepage must yield at least
//    one, or the scan would pass on nothing.
let homeSvgs = 0;
const htmlFiles = readdirSync(OUT, { recursive: true })
  .filter((relative) => relative.endsWith(".html"))
  .sort();
for (const relative of htmlFiles) {
  const html = readFileSync(path.join(OUT, relative), "utf8");
  for (const [tag] of html.matchAll(/<svg\b[^>]*>/g)) {
    if (relative === "index.html") homeSvgs++;
    if (!/\swidth="[^"]+"/.test(tag) || !/\sheight="[^"]+"/.test(tag)) {
      const label = tag.match(/\sclass="([^"]*)"/)?.[1] ?? tag.slice(0, 80);
      fail(
        `${relative}: <svg class="${label}"> without width/height — an unstyled paint draws it at full container width`,
      );
    }
  }
}
if (homeSvgs === 0)
  fail("index.html: no inline <svg> found — check 8 scanned nothing");

if (failures.length > 0) {
  console.error(`check-out: ${failures.length} failure(s)\n`);
  for (const message of failures) console.error(`  ✗ ${message}`);
  process.exit(1);
}

console.log("check-out: out/ is consistent with what the routes advertise");

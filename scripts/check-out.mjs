// Post-build assertions against ./out — the things only a real build can show.
//
// `pnpm test` runs against modules, so it can prove that llms.txt lists a post
// and that the sitemap lists llms.txt, but not that either file exists once
// `output: "export"` has run. Three failures live in exactly that gap:
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
//
// Exits non-zero with the specific failures listed. Run by `pnpm build`.

import { readFileSync, existsSync } from "node:fs";
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

// 2. Every same-origin URL the curated index advertises resolves. Off-origin
//    entries (docs.decdn.org, built by Mintlify) are out of reach from here.
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

// 3. Both demo captions survive into the rendered homepage. FleetStatus is
//    covered by a unit test; HeroTerminal is only observable here.
const home = read("index.html");
if (home) {
  const captions = {
    "HeroTerminal (fetch session)": "Illustrative deCDN fetch session.",
    "FleetStatus (fleet dashboard)": "Illustrative deCDN fleet dashboard.",
  };
  for (const [name, caption] of Object.entries(captions)) {
    if (!home.includes(caption)) {
      fail(`index.html: ${name} caption missing — invented figures ship bare`);
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
}

if (failures.length > 0) {
  console.error(`check-out: ${failures.length} failure(s)\n`);
  for (const message of failures) console.error(`  ✗ ${message}`);
  process.exit(1);
}

console.log("check-out: out/ is consistent with what the routes advertise");

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

// `scripts/check-og-image.mjs` runs against `out/` after `pnpm build`, which a
// vitest test can never see (CI runs `pnpm test` first). So instead of
// importing it — it exits on import by design — each case builds a tiny fake
// export in a temp dir and spawns the real script against it via
// `CHECK_OG_OUT_DIR`. That covers the exit-code wiring too, which is the
// script's actual contract: a refactor that broke the `failed` flag would turn
// the whole guard into a permanent silent pass, and nothing else would notice.

const SCRIPT = path.resolve(import.meta.dirname, "check-og-image.mjs");
const ORIGIN = "https://decdn.org";

const tmpRoots: string[] = [];
afterAll(() => {
  for (const dir of tmpRoots) fs.rmSync(dir, { recursive: true, force: true });
});

type Page = {
  /** Route path, e.g. `/` or `/blog/why-now/`. `404.html` for the bare file. */
  at: string;
  canonical?: string | null;
  cards?: string[] | null;
  og?: string[] | null;
  twitter?: string[] | null;
  /** Raw HTML, bypassing the tag builders — for matcher-drift fixtures. */
  raw?: string;
};

type Export = {
  pages: Page[];
  /** Files to create (empty) inside the export, e.g. `opengraph-image.png`. */
  assets?: string[];
  /** Sitemap `<loc>` values. `null` omits the sitemap entirely. */
  sitemap?: string[] | null;
};

const html = (p: Page): string => {
  if (p.raw !== undefined) return p.raw;
  const canonical =
    p.canonical === null
      ? ""
      : `<link rel="canonical" href="${p.canonical ?? `${ORIGIN}${p.at}`}"/>`;
  const tags = [
    ...(p.cards ?? ["summary_large_image"]).map(
      (v) => `<meta name="twitter:card" content="${v}"/>`,
    ),
    ...(p.og ?? [`${ORIGIN}/card.png`]).map(
      (v) => `<meta property="og:image" content="${v}"/>`,
    ),
    ...(p.twitter ?? [`${ORIGIN}/card.png`]).map(
      (v) => `<meta name="twitter:image" content="${v}"/>`,
    ),
  ];
  return `<html><head>${canonical}${tags.join("")}</head><body/></html>`;
};

const makeExport = ({ pages, assets = ["card.png"], sitemap }: Export) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "og-check-"));
  tmpRoots.push(root);
  const out = path.join(root, "out");

  for (const page of pages) {
    const file = page.at.endsWith("/")
      ? path.join(out, page.at, "index.html")
      : path.join(out, page.at);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html(page));
  }
  for (const asset of assets) {
    const file = path.join(out, asset);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, "");
  }
  const locs =
    sitemap === undefined
      ? pages.filter((p) => p.at.endsWith("/")).map((p) => `${ORIGIN}${p.at}`)
      : sitemap;
  if (locs !== null) {
    fs.writeFileSync(
      path.join(out, "sitemap-pages.xml"),
      `<?xml version="1.0" encoding="UTF-8"?><urlset>${locs
        .map((loc) => `<url><loc>${loc}</loc></url>`)
        .join("")}</urlset>`,
    );
  }
  return out;
};

const run = (outDir: string) => {
  const res = spawnSync(process.execPath, [SCRIPT], {
    encoding: "utf8",
    env: { ...process.env, CHECK_OG_OUT_DIR: outDir },
    // vitest cannot interrupt a synchronous call, so a child that hangs would
    // stall the whole suite rather than fail it. On timeout `status` is null,
    // which matches no `expect(code).toBe(…)` and surfaces as a test failure.
    timeout: 30_000,
  });
  return { code: res.status, output: `${res.stdout}${res.stderr}` };
};

const check = (spec: Export) => run(makeExport(spec));

const HOME: Page = { at: "/" };

describe("check-og-image: passing exports", () => {
  it("passes a well-formed export and reports what it verified on disk", () => {
    const { code, output } = check({ pages: [HOME, { at: "/blog/" }] });
    expect(code).toBe(0);
    expect(output).toContain("2 built pages all declare");
    // 2 pages × (og + twitter) + 2 sitemap entries.
    expect(output).toContain("6 same-origin URLs");
  });

  it("accepts several distinct og:image values as an ordered preference list", () => {
    const { code, output } = check({
      pages: [{ ...HOME, og: [`${ORIGIN}/card.png`, `${ORIGIN}/alt.png`] }],
      assets: ["card.png", "alt.png"],
    });
    expect(code).toBe(0);
    expect(output).toContain("built pages all declare");
  });

  it("accepts a relative image resolved against the page's own URL", () => {
    const { code } = check({
      pages: [
        { at: "/blog/", og: ["../card.png"], twitter: ["../card.png"] },
        HOME,
      ],
    });
    expect(code).toBe(0);
  });

  it("accepts an off-origin absolute URL on shape alone", () => {
    const { code } = check({
      pages: [{ ...HOME, og: ["https://cdn.example/x.png"] }],
    });
    expect(code).toBe(0);
  });

  it("ignores query strings, fragments and percent-escapes when hitting disk", () => {
    const { code } = check({
      pages: [
        {
          ...HOME,
          og: [`${ORIGIN}/a%20b.png?v=2#frag`],
          twitter: [`${ORIGIN}/a%20b.png?v=2`],
        },
      ],
      assets: ["a b.png"],
    });
    expect(code).toBe(0);
  });
});

describe("check-og-image: image URLs are verified against the export", () => {
  // The regression that motivated this suite: every value in the real export
  // is an absolute same-origin URL, so a check that stopped at "looks like a
  // URL" passed a build with every card asset deleted.
  it("fails when a same-origin og:image has no file behind it", () => {
    const { code, output } = check({ pages: [HOME], assets: [] });
    expect(code).toBe(1);
    expect(output).toContain("pages ship an unusable og:image");
    expect(output).toContain("file missing on disk");
  });

  it("fails when a same-origin twitter:image has no file behind it", () => {
    const { code, output } = check({
      pages: [{ ...HOME, twitter: [`${ORIGIN}/gone.png`] }],
    });
    expect(code).toBe(1);
    expect(output).toContain("pages ship an unusable twitter:image");
  });

  it("fails when the URL points at a directory rather than a file", () => {
    const { code, output } = check({
      pages: [{ ...HOME, og: [`${ORIGIN}/sub/`] }],
      assets: ["sub/x.png", "card.png"],
    });
    expect(code).toBe(1);
    expect(output).toContain("not a regular file");
  });

  it.each([
    ["an empty value", "", "empty content attribute"],
    ["a whitespace-only value", "   ", "whitespace-only content attribute"],
    ["a data: URL", "data:image/png;base64,iVBOR", "not an http(s) URL"],
    ["a protocol-relative URL", "//cdn.example/x.png", "protocol-relative URL"],
  ])("fails on %s", (_label, value, reason) => {
    const { code, output } = check({ pages: [{ ...HOME, og: [value] }] });
    expect(code).toBe(1);
    expect(output).toContain(reason);
  });

  // A leading `..` is dropped by URL normalization, so `/../x.png` means
  // `/x.png` to a crawler. Resolving it as a filesystem path instead would
  // re-enter the export and wrongly report the file as present.
  it("normalizes `..` the way a crawler does rather than as a path", () => {
    const { code, output } = check({
      pages: [{ ...HOME, og: [`${ORIGIN}/../out/card.png`] }],
    });
    expect(code).toBe(1);
    expect(output).toContain("looked for");
    expect(output).toContain("out/card.png");
  });

  it("fails an empty duplicate even when a real og:image is also present", () => {
    const { code, output } = check({
      pages: [{ ...HOME, og: ["", `${ORIGIN}/card.png`] }],
    });
    expect(code).toBe(1);
    expect(output).toContain("empty content attribute");
  });
});

describe("check-og-image: tag presence and conflicts", () => {
  it("fails a page that declares no twitter:card at all", () => {
    const { code, output } = check({
      pages: [HOME, { at: "/orphan/", cards: [] }],
    });
    expect(code).toBe(1);
    expect(output).toContain("do not declare twitter:card=summary_large_image");
    expect(output).toContain("orphan");
  });

  it("fails a page whose card is not summary_large_image", () => {
    const { code, output } = check({
      pages: [HOME, { at: "/small/", cards: ["summary"] }],
    });
    expect(code).toBe(1);
    expect(output).toContain('declares "summary", not summary_large_image');
  });

  it("fails two conflicting twitter:card declarations", () => {
    const { code, output } = check({
      pages: [{ ...HOME, cards: ["summary", "summary_large_image"] }],
    });
    expect(code).toBe(1);
    expect(output).toContain("conflicting twitter:card values");
  });

  it("fails two conflicting twitter:image declarations", () => {
    const { code, output } = check({
      pages: [
        { ...HOME, twitter: [`${ORIGIN}/card.png`, `${ORIGIN}/alt.png`] },
      ],
      assets: ["card.png", "alt.png"],
    });
    expect(code).toBe(1);
    expect(output).toContain("conflicting twitter:image values");
  });

  it("does not treat &amp; and & as conflicting values", () => {
    const { code } = check({
      pages: [
        {
          ...HOME,
          twitter: [
            `${ORIGIN}/card.png?a=1&amp;b=2`,
            `${ORIGIN}/card.png?a=1&b=2`,
          ],
        },
      ],
    });
    expect(code).toBe(0);
  });

  it("fails a page missing og:image entirely", () => {
    const { code, output } = check({ pages: [HOME, { at: "/bare/", og: [] }] });
    expect(code).toBe(1);
    expect(output).toContain("tag missing");
  });
});

describe("check-og-image: the export inventory", () => {
  it("fails when a sitemap URL has nothing behind it", () => {
    const { code, output } = check({
      pages: [HOME],
      sitemap: [`${ORIGIN}/`, `${ORIGIN}/blog/vanished/`],
    });
    expect(code).toBe(1);
    expect(output).toContain("with nothing behind them in the export");
    expect(output).toContain("vanished");
  });

  it("verifies non-HTML sitemap entries such as the litepaper PDF", () => {
    const missing = check({
      pages: [HOME],
      sitemap: [`${ORIGIN}/`, `${ORIGIN}/paper.pdf`],
    });
    expect(missing.code).toBe(1);
    const present = check({
      pages: [HOME],
      assets: ["card.png", "paper.pdf"],
      sitemap: [`${ORIGIN}/`, `${ORIGIN}/paper.pdf`],
    });
    expect(present.code).toBe(0);
  });

  it("ignores off-origin sitemap entries", () => {
    const { code } = check({
      pages: [HOME],
      sitemap: [`${ORIGIN}/`, "https://docs.decdn.org/sitemap.xml"],
    });
    expect(code).toBe(0);
  });

  it("refuses to run without the sitemap it derives the inventory from", () => {
    const { code, output } = check({ pages: [HOME], sitemap: null });
    expect(code).toBe(1);
    expect(output).toContain("sitemap-pages.xml is missing");
  });
});

describe("check-og-image: refuses to pass a no-op check", () => {
  it("refuses when a matcher recognizes zero pages", () => {
    // `property="og-image"` stands in for Next changing its attribute output.
    const { code, output } = check({
      pages: [
        {
          at: "/",
          raw:
            `<link rel="canonical" href="${ORIGIN}/"/>` +
            `<meta name="twitter:card" content="summary_large_image"/>` +
            `<meta property="og-image" content="${ORIGIN}/card.png"/>` +
            `<meta name="twitter:image" content="${ORIGIN}/card.png"/>`,
        },
      ],
    });
    expect(code).toBe(1);
    expect(output).toContain("recognized 0 og:image tags");
    expect(output).toContain("Refusing to pass a no-op check");
  });

  it("distinguishes an export with no pages from matcher drift", () => {
    const { code, output } = check({
      pages: [{ at: "/", raw: "<html><body>fragment</body></html>" }],
    });
    expect(code).toBe(1);
    expect(output).toContain("this export contains no pages");
    expect(output).not.toContain("matcher almost certainly drifted");
  });

  it("refuses when no same-origin URL was verified against disk", () => {
    const { code, output } = check({
      pages: [
        {
          at: "/",
          canonical: "https://decdn.org/",
          og: ["https://cdn.example/x.png"],
          twitter: ["https://cdn.example/x.png"],
        },
      ],
      sitemap: [],
    });
    expect(code).toBe(1);
    expect(output).toContain("verified 0 URLs");
  });

  it("refuses when the canonical origin is ambiguous", () => {
    const { code, output } = check({
      pages: [
        HOME,
        { at: "/other/", canonical: "https://example.test/other/" },
      ],
    });
    expect(code).toBe(1);
    expect(output).toContain("could not establish a single site origin");
  });

  it("refuses when no page carries a canonical", () => {
    const { code, output } = check({ pages: [{ ...HOME, canonical: null }] });
    expect(code).toBe(1);
    expect(output).toContain("found none");
  });
});

describe("check-og-image: unreadable inputs", () => {
  it("reports a missing export with the build hint", () => {
    const { code, output } = run(path.join(os.tmpdir(), "og-check-absent-dir"));
    expect(code).toBe(1);
    expect(output).toContain("run `pnpm build` first");
  });

  it("reports an export that exists as a file, not a directory", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "og-check-"));
    tmpRoots.push(root);
    const asFile = path.join(root, "out");
    fs.writeFileSync(asFile, "");
    const { code, output } = run(asFile);
    expect(code).toBe(1);
    expect(output).toContain("ENOTDIR");
    expect(output).toContain("run `pnpm build` first");
  });

  it("reports an export with no HTML at all", () => {
    const out = makeExport({ pages: [], sitemap: [] });
    const { code, output } = run(out);
    expect(code).toBe(1);
    expect(output).toMatch(/no .*\*\*\/\*\.html found/);
  });

  // An unreadable page must not abort the audit — the other pages' findings
  // are exactly what you need in the same run.
  it.skipIf(process.getuid?.() === 0)(
    "reports an unreadable page as an offender and still checks the rest",
    () => {
      const out = makeExport({
        pages: [HOME, { at: "/locked/" }, { at: "/broken/", og: [""] }],
      });
      const locked = path.join(out, "locked", "index.html");
      fs.chmodSync(locked, 0o000);
      try {
        const { code, output } = run(out);
        expect(code).toBe(1);
        expect(output).toContain("pages could not be read");
        expect(output).toContain("EACCES");
        // The other page's real problem still surfaced.
        expect(output).toContain("empty content attribute");
      } finally {
        fs.chmodSync(locked, 0o644);
      }
    },
  );

  // When *every* page is unreadable the refusal guards see an export that
  // declares nothing, and "this export contains no pages" is a true sentence
  // about the wrong thing. The exit code was already 1; what was missing was
  // any mention of the EACCES that caused it.
  it.skipIf(process.getuid?.() === 0)(
    "names the read failures when no page could be read at all",
    () => {
      const out = makeExport({ pages: [HOME] });
      const locked = path.join(out, "index.html");
      fs.chmodSync(locked, 0o000);
      try {
        const { code, output } = run(out);
        expect(code).toBe(1);
        expect(output).toContain("pages could not be read");
        expect(output).toContain("EACCES");
      } finally {
        fs.chmodSync(locked, 0o644);
      }
    },
  );
});

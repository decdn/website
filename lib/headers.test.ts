import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// public/_headers ships verbatim to Cloudflare Pages, so nothing in the build
// reads it. The pages.dev noindex rules are the one place a small edit is
// expensive both ways: drop a rule and the *.pages.dev copies get indexed
// again in place of decdn.org; move `X-Robots-Tag: noindex` under a path-only
// rule such as `/*` and it applies on decdn.org too, de-indexing the site.

type Rule = { match: string; headers: string[] };

// Cloudflare's format: a URL or path pattern at column 0, then its headers
// indented beneath it. `#` lines are comments and blank lines separate rules.
function parseHeaders(text: string): Rule[] {
  const rules: Rule[] = [];
  for (const line of text.split("\n")) {
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;
    if (/^\s/.test(line)) rules.at(-1)?.headers.push(line.trim());
    else rules.push({ match: line.trim(), headers: [] });
  }
  return rules;
}

const rules = parseHeaders(
  readFileSync(join(process.cwd(), "public", "_headers"), "utf8"),
);
const robotsRules = rules.filter((r) =>
  r.headers.some((h) => /^x-robots-tag:/i.test(h)),
);

describe("public/_headers", () => {
  it("parses into rules", () => {
    expect(rules.length).toBeGreaterThan(0);
  });

  it("noindexes exactly the pages.dev production and preview hosts", () => {
    expect(robotsRules.map((r) => r.match)).toEqual([
      "https://:project.pages.dev/*",
      "https://:version.:project.pages.dev/*",
    ]);
    for (const rule of robotsRules) {
      expect(rule.headers).toContain("X-Robots-Tag: noindex");
    }
  });

  it("sends no X-Robots-Tag from a path-only rule, which would match decdn.org", () => {
    const pathOnly = robotsRules.filter((r) => !r.match.startsWith("https://"));
    expect(pathOnly).toEqual([]);
  });
});

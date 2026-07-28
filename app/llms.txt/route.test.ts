import { describe, expect, it } from "vitest";
import { assertMarkdownSafe, GET } from "./route";
import { listPosts } from "@/lib/blog";
import { LEGAL_SLUGS } from "@/lib/legal";

const response = GET();
const body = await response.text();
const lines = body.split("\n");
const headings = lines.filter((line) => /^#+ /.test(line));

// The llms.txt shape a consumer parses: `- [name](url): notes`, absolute
// https URLs only, one per line.
const ENTRY_RE = /^- \[[^\]]+\]\(https:\/\/[^\s)]+\)(: .+)?$/;

describe("llms.txt shape", () => {
  it("serves plain text", () => {
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
  });

  it("opens with the H1 and a blockquote summary", () => {
    expect(lines[0]).toBe("# deCDN");
    expect(lines[1]).toBe("");
    expect(lines[2].startsWith("> ")).toBe(true);
  });

  it("uses exactly one H1 and nothing deeper than H2", () => {
    expect(headings.filter((h) => h.startsWith("# "))).toHaveLength(1);
    for (const heading of headings) {
      expect(heading).toMatch(/^#{1,2} /);
    }
  });

  // The spec lets a consumer short on context skip everything under
  // `## Optional`, so it has to come last and nothing load-bearing may sit
  // under it.
  it("ends its sections with Optional", () => {
    const sections = headings.filter((h) => h.startsWith("## "));
    expect(sections.at(-1)).toBe("## Optional");
  });

  it("formats every list line as a link entry", () => {
    const entries = lines.filter((line) => line.startsWith("- "));
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(entry).toMatch(ENTRY_RE);
    }
  });

  // Interpolating an authored string that came back undefined would still
  // produce a shape-valid entry, so check for the giveaway text too.
  it("interpolates no placeholders", () => {
    expect(body).not.toContain("undefined");
    expect(body).not.toContain("[object Object]");
  });
});

describe("llms.txt contents", () => {
  // Every entry derives from the same loader the HTML routes use, so the file
  // cannot advertise a post the build did not emit.
  it.each(listPosts())("lists $slug exactly once", (post) => {
    const entry = `- [${post.title}](https://decdn.org/blog/${post.slug}/): ${post.summary}`;
    expect(lines.filter((line) => line === entry)).toHaveLength(1);
  });

  it.each([
    "https://decdn.org/",
    "https://decdn.org/blog/",
    "https://decdn.org/llms-full.txt",
    "https://decdn.org/decdn_litepaper.pdf",
    "https://docs.decdn.org/llms.txt",
    "https://docs.decdn.org/llms-full.txt",
  ])("points at %s", (url) => {
    expect(body).toContain(`(${url})`);
  });

  it.each(LEGAL_SLUGS)("lists /legal/%s/", (slug) => {
    expect(body).toContain(`(https://decdn.org/legal/${slug}/)`);
  });

  // The hedge travels with the figure everywhere else on the site; an index an
  // agent may read *instead of* the site is the last place to drop it.
  it("carries the target-rate hedge", () => {
    expect(body).toContain(
      "The $0.01/GB figure quoted across this site is a public target rate, not a protocol-enforced price.",
    );
  });
});

describe("assertMarkdownSafe", () => {
  it("returns a safe value unchanged", () => {
    expect(
      assertMarkdownSafe("The Road to Testnet: decdn in 2026", "title"),
    ).toBe("The Road to Testnet: decdn in 2026");
  });

  // Each of these truncates the entry silently rather than failing the build:
  // `]` closes the link label early, a line break ends the list item.
  it.each([
    { name: "a closing bracket", value: "brackets [like] this" },
    { name: "a newline", value: "line one\nline two" },
    { name: "a carriage return", value: "line one\rline two" },
  ])("throws with field context on $name", ({ value }) => {
    expect(() =>
      assertMarkdownSafe(value, "post road-to-testnet label"),
    ).toThrow(/post road-to-testnet label/);
  });
});

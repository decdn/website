import { describe, expect, it } from "vitest";
import {
  countWords,
  dottedDate,
  getPost,
  listPosts,
  parseImage,
  parseSlug,
  parseTags,
  readingMinutes,
  readLabel,
  seriesLabel,
} from "./blog";
import { SITE_URL } from "./links";

describe("parseSlug", () => {
  it.each(["a", "a-b", "a-b-c", "abc123", "a1-b2"])("accepts %j", (input) => {
    expect(parseSlug(input)).not.toBeNull();
  });

  it.each(["", "-a", "a-", "a--b", "A", "a_b", "a b", "a.b", "<script>"])(
    "rejects %j",
    (input) => {
      expect(parseSlug(input)).toBeNull();
    },
  );

  it("rejects non-string input", () => {
    expect(parseSlug(42)).toBeNull();
    expect(parseSlug(null)).toBeNull();
    expect(parseSlug(undefined)).toBeNull();
    expect(parseSlug({})).toBeNull();
    expect(parseSlug([])).toBeNull();
  });
});

describe("getPost", () => {
  // Invalid slugs short-circuit on parseSlug before readEntries runs,
  // so these assertions also exercise the "no filesystem read" path.
  it.each(["A", "a--b", "-a", "a-", "", "a_b", "<script>"])(
    "returns null for invalid slug %j without touching the filesystem",
    (input) => {
      expect(getPost(input)).toBeNull();
    },
  );
});

describe("countWords", () => {
  it("counts whitespace-delimited tokens", () => {
    expect(countWords("one two three")).toBe(3);
    expect(countWords("  leading\tand\ntrailing  ")).toBe(3);
  });

  it("is 0 for blank input", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   \n\t ")).toBe(0);
  });

  it("counts markdown punctuation as tokens (the documented over-estimate)", () => {
    // `##` (ATX heading) and `[link](url)` are each one token.
    expect(countWords("## Heading and a [link](url)")).toBe(5);
  });
});

describe("readingMinutes", () => {
  // 200 wpm with Math.round → the half-up boundary lands at 300 words.
  it.each([
    [0, 1],
    [1, 1],
    [100, 1],
    [299, 1],
    [300, 2],
    [400, 2],
    [500, 3],
    [1000, 5],
  ])("%d words → %d min", (words, min) => {
    expect(readingMinutes(words)).toBe(min);
  });
});

describe("display formatters", () => {
  it("dottedDate swaps hyphens for middle dots", () => {
    expect(dottedDate("2026-05-11")).toBe("2026·05·11");
  });

  it("readLabel zero-pads to two digits", () => {
    expect(readLabel(8)).toBe("08 min");
    expect(readLabel(12)).toBe("12 min");
  });

  it("seriesLabel zero-pads to two digits", () => {
    expect(seriesLabel(2)).toBe("02");
    expect(seriesLabel(11)).toBe("11");
  });
});

describe("parseTags", () => {
  it("returns undefined when absent or an empty array", () => {
    expect(parseTags(undefined, "x.mdx")).toBeUndefined();
    expect(parseTags([], "x.mdx")).toBeUndefined();
  });

  it("trims and de-duplicates, preserving source order", () => {
    expect(
      parseTags(["  transport ", "transport", "settlement"], "x.mdx"),
    ).toEqual(["transport", "settlement"]);
  });

  it.each<[string, unknown]>([
    ["a bare string", "primer"],
    ["a non-string element", ["primer", 1]],
    ["an empty-string element", ["primer", ""]],
    ["a whitespace-only element", ["primer", "   "]],
  ])("throws (with file context) on %s", (_label, input) => {
    expect(() => parseTags(input, "bad.mdx")).toThrow(/bad\.mdx.*tags/s);
  });
});

describe("parseImage", () => {
  it("returns undefined when absent", () => {
    expect(parseImage(undefined, "x.mdx")).toBeUndefined();
  });

  it.each<[string, string, string]>([
    [
      "site-relative path",
      "/blog-cards/foo.png",
      `${SITE_URL}blog-cards/foo.png`,
    ],
    ["nested site-relative path", "/a/b/c.png", `${SITE_URL}a/b/c.png`],
    [
      "absolute https URL",
      "https://example.test/foo.png",
      "https://example.test/foo.png",
    ],
    [
      "absolute http URL",
      "http://example.test/foo.png",
      "http://example.test/foo.png",
    ],
    [
      "surrounding whitespace",
      "  https://example.test/foo.png  ",
      "https://example.test/foo.png",
    ],
  ])("accepts %s", (_label, input, expected) => {
    expect(parseImage(input, "x.mdx")).toBe(expected);
  });

  it.each<[string, unknown]>([
    ["a number", 42],
    ["null", null],
    ["an array", ["/foo.png"]],
    ["an object", {}],
    ["an empty string", ""],
    ["a whitespace-only string", "   "],
    ["a bare relative path", "foo.png"],
    ["a dot-prefixed relative path", "./foo.png"],
    ["a protocol-relative URL", "//example.test/foo.png"],
    ["a single slash", "/"],
    ["a host-less http URL", "http://"],
    ["a host-less https URL", "https://"],
    ["a data URL", "data:image/png;base64,AAA"],
    ["an ftp URL", "ftp://example.test/foo.png"],
    ["a mailto URL", "mailto:x@y.z"],
  ])("throws (with file context) on %s", (_label, input) => {
    expect(() => parseImage(input, "bad.mdx")).toThrow(/bad\.mdx.*image/s);
  });
});

describe("listPosts metadata", () => {
  const posts = listPosts();

  it("derives a positive word count and reading time per post", () => {
    expect(posts.length).toBeGreaterThan(0);
    for (const p of posts) {
      expect(p.words).toBeGreaterThan(0);
      expect(p.readMin).toBeGreaterThanOrEqual(1);
      expect(p.readMin).toBe(Math.max(1, Math.round(p.words / 200)));
    }
  });

  it("exposes tags as a non-empty string array when present", () => {
    for (const p of posts) {
      if (p.tags === undefined) continue;
      expect(p.tags.length).toBeGreaterThan(0);
      for (const t of p.tags) {
        expect(typeof t).toBe("string");
        expect(t).toBe(t.trim());
        expect(t).not.toBe("");
      }
    }
  });

  it("numbers the series 1..N (oldest = 1), newest first in the list", () => {
    const numbers = posts.map((p) => p.seriesNumber).sort((a, b) => a - b);
    expect(numbers).toEqual(
      Array.from({ length: posts.length }, (_, i) => i + 1),
    );
    expect(posts[0]?.seriesNumber).toBe(posts.length);
  });
});

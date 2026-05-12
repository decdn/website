import { describe, expect, it } from "vitest";
import {
  countWords,
  dottedDate,
  getPost,
  listPosts,
  parseSlug,
  parseTags,
  readingMinutes,
  readLabel,
  seriesLabel,
} from "./blog";

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

import { describe, expect, it } from "vitest";
import { countWords, getPost, listPosts, parseSlug } from "./blog";

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
});

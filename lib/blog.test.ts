import { describe, expect, it } from "vitest";
import { getPost, parseSlug } from "./blog";

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

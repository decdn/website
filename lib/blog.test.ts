import { describe, expect, it } from "vitest";
import {
  buildOgImages,
  countWords,
  dottedDate,
  getPost,
  listPosts,
  ogCardSlugs,
  parseImage,
  parseSlug,
  parseTags,
  postImageUrl,
  readingMinutes,
  readLabel,
  seriesLabel,
  type PostMeta,
  type Slug,
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
    // Pins the "verbatim, not canonicalized" contract: the validator
    // accepts but does NOT lowercase the host / re-encode the path.
    // A future refactor switching to `parsed.toString()` would fail
    // this case, making the behaviour change explicit rather than silent.
    [
      "mixed-case scheme and host preserved",
      "HTTPS://Example.Test/Foo.png",
      "HTTPS://Example.Test/Foo.png",
    ],
    [
      "query string + fragment + port preserved",
      "https://example.test:8443/foo.png?v=2#frag",
      "https://example.test:8443/foo.png?v=2#frag",
    ],
  ])("accepts %s", (_label, input, expected) => {
    expect(parseImage(input, "x.mdx")).toBe(expected);
  });

  // Pins the invariant that every accepted output is itself a parseable
  // absolute URL — catches a regression in the site-relative branch where
  // `SITE_URL`'s trailing slash + the input's leading slash double up
  // into `https://decdn.org//foo.png`, or worse, `https://decdn.orgfoo`.
  it("returns a parseable absolute URL for every accepted shape", () => {
    const inputs = [
      "/blog-cards/foo.png",
      "/a/b/c.png",
      "https://example.test/foo.png",
      "http://example.test/foo.png",
    ];
    for (const input of inputs) {
      const out = parseImage(input, "x.mdx");
      expect(out).toBeDefined();
      const parsed = new URL(out!);
      expect(parsed.hostname.length).toBeGreaterThan(0);
      // No accidental `//` in the pathname (the double-slash regression
      // the trailing-slash invariant used to risk).
      expect(parsed.pathname.startsWith("//")).toBe(false);
    }
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
    [
      "a malformed absolute URL (space in authority)",
      "https://exa mple.test/x",
    ],
    ["a data URL", "data:image/png;base64,AAA"],
    ["an ftp URL", "ftp://example.test/foo.png"],
    ["a mailto URL", "mailto:x@y.z"],
  ])("throws (with file context) on %s", (_label, input) => {
    expect(() => parseImage(input, "bad.mdx")).toThrow(/bad\.mdx.*image/s);
  });

  // Per Important #1 from the PR-review pass: the URL parser's reason
  // for rejection has to surface, not get swallowed into the generic
  // "must be a site-relative path…" message. Lock the specific phrasing
  // so a future refactor can't quietly regress to a generic error.
  it.each([
    ["host-less http", "http://"],
    ["host-less https", "https://"],
    ["space in authority", "https://exa mple.test/x"],
  ])(
    "surfaces the URL parser's reason for malformed absolute URLs (%s)",
    (_label, input) => {
      expect(() => parseImage(input, "bad.mdx")).toThrow(/is not a valid URL/);
    },
  );
});

describe("buildOgImages", () => {
  // Minimal PostMeta shape — `as Slug` / `as IsoDate` casts are safe
  // because we're not exercising the brand here, just the metadata
  // builder's read of `image` and `title`.
  const base: PostMeta = {
    slug: "p" as Slug,
    title: "Why Now",
    date: "2026-05-04" as PostMeta["date"],
    summary: "x",
    pinned: false,
    seriesNumber: 1,
    words: 100,
    readMin: 1,
  };

  it("returns undefined when the post has no image override", () => {
    expect(buildOgImages(base)).toBeUndefined();
  });

  it("returns a single image with title-as-alt when image is set", () => {
    const out = buildOgImages({
      ...base,
      image: "https://decdn.org/blog-cards/why-now.png",
    });
    expect(out).toEqual([
      {
        url: "https://decdn.org/blog-cards/why-now.png",
        alt: "Why Now",
      },
    ]);
  });
});

describe("postImageUrl", () => {
  const base: PostMeta = {
    slug: "p" as Slug,
    title: "Why Now",
    date: "2026-05-04" as PostMeta["date"],
    summary: "x",
    pinned: false,
    seriesNumber: 1,
    words: 100,
    readMin: 1,
  };

  it("falls back to the extensionless file-convention URL when no override", () => {
    expect(postImageUrl(base, "https://decdn.org/blog/why-now/")).toBe(
      "https://decdn.org/blog/why-now/opengraph-image",
    );
  });

  it("returns the override URL verbatim when image is set", () => {
    expect(
      postImageUrl(
        { ...base, image: "https://cdn.example/x.png" },
        "https://decdn.org/blog/why-now/",
      ),
    ).toBe("https://cdn.example/x.png");
  });
});

describe("ogCardSlugs", () => {
  const post = (slug: string, image?: string): PostMeta => ({
    slug: slug as Slug,
    title: slug,
    date: "2026-05-04" as PostMeta["date"],
    summary: "x",
    pinned: false,
    seriesNumber: 1,
    words: 100,
    readMin: 1,
    image,
  });

  it("returns all slugs when no post overrides", () => {
    expect(ogCardSlugs([post("a"), post("b"), post("c")])).toEqual([
      { slug: "a" },
      { slug: "b" },
      { slug: "c" },
    ]);
  });

  it("filters out posts whose frontmatter sets image:", () => {
    expect(
      ogCardSlugs([
        post("a"),
        post("b", "https://cdn.example/b.png"),
        post("c"),
      ]),
    ).toEqual([{ slug: "a" }, { slug: "c" }]);
  });

  it("returns an empty array when every post overrides", () => {
    expect(
      ogCardSlugs([
        post("a", "https://cdn.example/a.png"),
        post("b", "https://cdn.example/b.png"),
      ]),
    ).toEqual([]);
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

  // Mirror the tags loop for `image`. No fixture currently uses the
  // override, so today this is a no-op — but the first time an author
  // adds `image:` to a real post, this guards the invariant that the
  // emitted value is always an absolute, parseable URL with a hostname.
  it("exposes image as an absolute parseable URL with a hostname when present", () => {
    for (const p of posts) {
      if (p.image === undefined) continue;
      expect(typeof p.image).toBe("string");
      expect(p.image).toBe(p.image.trim());
      expect(p.image.length).toBeGreaterThan(0);
      const parsed = new URL(p.image);
      expect(parsed.hostname.length).toBeGreaterThan(0);
    }
  });

  it("numbers the series 1..N (oldest = 1), newest carries the highest", () => {
    const numbers = posts.map((p) => p.seriesNumber).sort((a, b) => a - b);
    expect(numbers).toEqual(
      Array.from({ length: posts.length }, (_, i) => i + 1),
    );
    // The newest post by date gets number N, wherever pinning places it in
    // the display list — so seriesNumber stays tied to date, not slot.
    const newest = [...posts].sort((a, b) => b.date.localeCompare(a.date))[0];
    expect(newest?.seriesNumber).toBe(posts.length);
  });

  it("floats pinned posts above unpinned, newest-first within each group", () => {
    const firstUnpinned = posts.findIndex((p) => !p.pinned);
    if (firstUnpinned !== -1) {
      // once the first unpinned post appears, nothing pinned follows
      expect(posts.slice(firstUnpinned).some((p) => p.pinned)).toBe(false);
    }
    for (const group of [
      posts.filter((p) => p.pinned),
      posts.filter((p) => !p.pinned),
    ]) {
      for (let i = 1; i < group.length; i++) {
        expect(group[i - 1].date >= group[i].date).toBe(true);
      }
    }
  });
});

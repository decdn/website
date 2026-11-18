import { describe, expect, it } from "vitest";
import { getPost, longDate } from "./blog";
import { FAQ_ITEMS } from "./faq";

// FAQ_ITEMS is consumed three ways — rendered as <dt>/<dd> by
// components/home/faq/FaqItem.tsx (mapped in FaqList.tsx), restated as
// Question/Answer nodes by `faqPageNode`, and serialised under `#### `
// headings by app/llms-full.txt/route.ts. lib/copy.ts's strings are screened
// for the whitespace and delimiter hazards that creates; these were not,
// despite going through the same three consumers.

const FIELDS: readonly [string, string][] = FAQ_ITEMS.flatMap(
  ({ q, a }, i): [string, string][] => [
    [`FAQ_ITEMS[${i}].q`, q],
    ...a.map((p, j): [string, string] => [`FAQ_ITEMS[${i}].a[${j}]`, p]),
  ],
);

describe("FAQ_ITEMS", () => {
  it.each(FIELDS)("%s is a trimmed, single-line, non-empty string", (_n, v) => {
    expect(v).not.toBe("");
    expect(v).toBe(v.trim());
    expect(v).not.toMatch(/[\n\r\t]/);
    expect(v).not.toMatch(/ {2}/);
  });

  // Google rejects a FAQPage whose entries don't match visible content, and a
  // duplicate question is the easiest way to get there.
  it("asks each question once", () => {
    const questions = FAQ_ITEMS.map((f) => f.q);
    expect(new Set(questions).size).toBe(questions.length);
  });

  // A question opening with `#` would collide with the `#### ` the mirror
  // prefixes it with, producing a heading a level shallower than intended.
  it.each(FAQ_ITEMS)("does not open $q with a hash", ({ q }) => {
    expect(q.startsWith("#")).toBe(false);
  });

  it.each(FAQ_ITEMS)("answers $q in at least one paragraph", ({ a }) => {
    expect(a.length).toBeGreaterThan(0);
  });
});

// The "Is deCDN live?" answer states the testnet launch date in prose. It
// can't interpolate it from the post the way it does TARGET_RATE: FaqList is
// a client component, and lib/blog.ts reads the filesystem. So this holds the
// hand-written date to the post's frontmatter instead, since the answer also
// ships as FAQPage structured data.
describe("Is deCDN live?", () => {
  it("dates the testnet to the launch post", () => {
    const post = getPost("testnet-is-live");
    expect(post).not.toBeNull();
    const live = FAQ_ITEMS.find((f) => f.q === "Is deCDN live?");
    expect(live?.a.join(" ")).toContain(longDate(post!.date));
  });
});

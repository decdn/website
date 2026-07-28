import { describe, expect, it } from "vitest";
import { FAQ_ITEMS } from "./faq";

// FAQ_ITEMS is consumed three ways — rendered as <dt>/<dd> by components/site/
// Faq.tsx, restated as Question/Answer nodes by `faqPageNode`, and serialised
// under `#### ` headings by app/llms-full.txt/route.ts. lib/copy.ts's strings
// are screened for the whitespace and delimiter hazards that creates; these
// were not, despite going through the same three consumers.

const FIELDS: readonly [string, string][] = FAQ_ITEMS.flatMap(
  ({ q, a }, i): [string, string][] => [
    [`FAQ_ITEMS[${i}].q`, q],
    [`FAQ_ITEMS[${i}].a`, a],
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
});

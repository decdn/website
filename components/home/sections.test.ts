import { describe, expect, it } from "vitest";
import { Compare } from "./Compare";
import { Contact } from "./Contact";
import { Faq } from "./Faq";
import { Hero } from "./Hero";
import { Method } from "./Method";
import { Try } from "./Try";
import { DARK_SECTIONS, SECTION_IDS } from "./chrome-active";
import { asElement, attrs } from "@/test-utils/react-tree";

// The nav picks its tone from DARK_SECTIONS, a hand copy of each section's
// <Frame tone>. A miss leaves the nav text the colour of the section behind
// it — invisible, and nothing else in the build notices. All six are server
// components, so calling them never runs a hook.
const SECTIONS = {
  intro: Hero,
  compare: Compare,
  method: Method,
  faq: Faq,
  try: Try,
  contact: Contact,
} satisfies Record<(typeof SECTION_IDS)[number], () => unknown>;

describe("homepage sections", () => {
  it("covers every id the nav observes, in page order", () => {
    expect(Object.keys(SECTIONS)).toEqual([...SECTION_IDS]);
  });

  it.each(SECTION_IDS)("#%s: nav tone matches its Frame", (id) => {
    const section = asElement(SECTIONS[id]());
    expect(attrs(section).id).toBe(id);
    expect(attrs(section).tone === "ink").toBe(DARK_SECTIONS.has(id));
  });
});

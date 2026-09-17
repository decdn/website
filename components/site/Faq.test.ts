import { describe, expect, it } from "vitest";
import { Faq } from "./Faq";
import { FaqList } from "./FaqList";
import { Frame } from "@/components/ui/Frame";
import { asElement, attrs, childElements } from "@/test-utils/react-tree";

// FaqList is a client component that calls useState, so this test walks the
// tree with childElements (which never calls components) rather than textOf
// or findOne. The interactive pair itself is covered by FaqItem.test.ts.
describe("Faq", () => {
  const section = asElement(Faq());

  it("stays the ink-toned #faq section the nav and schema point at", () => {
    expect(section.type).toBe(Frame);
    expect(attrs(section).id).toBe("faq");
    expect(attrs(section).tone).toBe("ink");
  });

  it("keeps the heading Frame labels the section by", () => {
    const [, body] = childElements(section);
    const [h2, list] = childElements(body);
    expect(h2.type).toBe("h2");
    expect(attrs(h2).id).toBe(`${attrs(section).id}-h`);
    expect(list.type).toBe(FaqList);
  });

  it("hands the list the same section number the header shows", () => {
    const [header, body] = childElements(section);
    const [, list] = childElements(body);
    expect(attrs(list).section).toBe(attrs(header).index);
  });
});

import { describe, expect, it } from "vitest";
import { FaqItem } from "./FaqItem";
import {
  asElement,
  attrs,
  childElements,
  textOf,
} from "@/test-utils/react-tree";

const Q = "Why does the network need a token?";
const A = "TOKEN secures the network. deCDN settles in USDC.";

describe("FaqItem", () => {
  // Faq.tsx already wrapped these in a <dl>; without dt/dd the list bound
  // nothing, and the Q↔A pairing survived only in the FAQPage JSON-LD that
  // app/page.tsx emits separately.
  it("pairs the question and answer as dt and dd", () => {
    const item = asElement(FaqItem({ q: Q, a: A }));
    expect(childElements(item).map((c) => c.type)).toEqual(["dt", "dd"]);
    const [dt, dd] = childElements(item);
    expect(dt.props.children).toBe(Q);
    expect(textOf(dd)).toBe(A);
  });

  // The UA gives <dd> a 40px inline-start margin; preflight zeroes it, but the
  // class is what keeps the answer flush if that reset ever changes.
  it("zeroes the dd's inline-start margin explicitly", () => {
    const [, dd] = childElements(FaqItem({ q: Q, a: A }));
    expect(attrs(dd).className).toContain("ms-0");
  });

  it("styles the brand inside the answer", () => {
    const [, dd] = childElements(FaqItem({ q: Q, a: A }));
    const brand = childElements(dd).filter((c) => c.type === "span");
    expect(brand).toHaveLength(1);
    expect(brand[0].props.children).toBe("deCDN");
  });
});

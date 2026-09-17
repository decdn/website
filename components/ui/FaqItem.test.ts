import { describe, expect, it } from "vitest";
import { FaqItem } from "./FaqItem";
import {
  asElement,
  attrs,
  childElements,
  findOne,
  textOf,
} from "@/test-utils/react-tree";

const Q = "Why does the network need a token?";
const A = "TOKEN secures the network. deCDN settles in USDC.";

const render = (selected: boolean) =>
  asElement(
    FaqItem({
      q: Q,
      a: A,
      index: 3,
      ordinal: "04.4",
      selected,
      onSelect: () => {},
    }),
  );

describe("FaqItem", () => {
  // The <dl> in FaqList binds nothing on its own; dt/dd is what pairs the
  // question with its answer the way the FAQPage JSON-LD restates them.
  it("pairs the question and answer as dt and dd", () => {
    const item = render(false);
    expect(childElements(item).map((c) => c.type)).toEqual(["dt", "dd"]);
    const [dt, dd] = childElements(item);
    expect(textOf(dt)).toBe(`04.4${Q}`);
    expect(textOf(findOne(dd, "p"))).toBe(A);
  });

  // Every answer stays in the DOM (only CSS hides it) so the visible content
  // still matches the structured data; the button is what a reader uses to
  // bring one into the card.
  it("wires the question button to its answer as a disclosure", () => {
    const [dt, dd] = childElements(render(true));
    const button = findOne(dt, "button");
    expect(attrs(button).type).toBe("button");
    expect(attrs(button)["aria-expanded"]).toBe(true);
    expect(attrs(button)["aria-controls"]).toBe(attrs(dd).id);
    expect(attrs(dd).id).toBe("faq-a-3");
  });

  it("marks the selected pair for the stylesheet, and only the selected pair", () => {
    for (const selected of [true, false]) {
      const [dt, dd] = childElements(render(selected));
      const expected = selected ? "true" : undefined;
      expect(attrs(dt)["data-selected"]).toBe(expected);
      expect(attrs(dd)["data-selected"]).toBe(expected);
      expect(attrs(findOne(dt, "button"))["aria-expanded"]).toBe(selected);
    }
  });

  it("reports its index when clicked", () => {
    const calls: number[] = [];
    const item = asElement(
      FaqItem({
        q: Q,
        a: A,
        index: 3,
        ordinal: "04.4",
        selected: false,
        onSelect: (i) => calls.push(i),
      }),
    );
    const onClick = attrs(findOne(item, "button")).onClick as () => void;
    onClick();
    expect(calls).toEqual([3]);
  });

  // The UA gives <dd> a 40px inline-start margin; preflight zeroes it, but the
  // class is what keeps the answer flush if that reset ever changes.
  it("zeroes the dd's inline-start margin explicitly", () => {
    const [, dd] = childElements(render(false));
    expect(attrs(dd).className).toContain("ms-0");
  });

  it("styles the brand inside the answer", () => {
    const [, dd] = childElements(render(false));
    const brand = childElements(findOne(dd, "p")).filter(
      (c) => c.type === "span",
    );
    expect(brand).toHaveLength(1);
    expect(brand[0].props.children).toBe("deCDN");
  });

  // The ghost ordinal is a visual tether to the row, not content: it must
  // not read as part of the answer.
  it("hides the ghost ordinal from assistive tech", () => {
    const [, dd] = childElements(render(true));
    const ghost = childElements(dd).find((c) => c.type === "span");
    expect(ghost).toBeDefined();
    expect(attrs(ghost!)["aria-hidden"]).toBe(true);
    expect(textOf(ghost!)).toBe("04.4");
  });
});

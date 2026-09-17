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
    expect(textOf(findOne(dd, "p"))).toBe(A);
    // The ordinal is hidden from assistive tech so the button's accessible
    // name is the question alone, not "zero four point four Why does…".
    const [ordinal, question] = childElements(findOne(dt, "button"));
    expect(attrs(ordinal)["aria-hidden"]).toBe(true);
    expect(textOf(ordinal)).toBe("04.4");
    expect(attrs(question)["aria-hidden"]).toBeUndefined();
    expect(textOf(question)).toBe(Q);
  });

  // Every answer stays in the DOM (only CSS hides it) so the page content
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

  it("marks the selected pair for the stylesheet", () => {
    for (const selected of [true, false]) {
      const [dt, dd] = childElements(render(selected));
      const expected = selected ? "true" : undefined;
      expect(attrs(dt)["data-selected"]).toBe(expected);
      expect(attrs(dd)["data-selected"]).toBe(expected);
      expect(attrs(findOne(dt, "button"))["aria-expanded"]).toBe(selected);
    }
  });

  // One answer is always open, so the open button can't collapse anything:
  // it says so with aria-disabled and its handler is a no-op.
  it("disables the already-open button without removing it from the tab order", () => {
    const calls: number[] = [];
    const open = asElement(
      FaqItem({
        q: Q,
        a: A,
        index: 3,
        ordinal: "04.4",
        selected: true,
        onSelect: (i) => calls.push(i),
      }),
    );
    const button = findOne(open, "button");
    expect(attrs(button)["aria-disabled"]).toBe(true);
    expect(attrs(button).disabled).toBeUndefined();
    (attrs(button).onClick as () => void)();
    expect(calls).toEqual([]);

    const closed = findOne(render(false), "button");
    expect(attrs(closed)["aria-disabled"]).toBeUndefined();
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

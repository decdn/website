import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { SectionHeader } from "./SectionHeader";
import { attrs, findAll, textOf } from "@/test-utils/react-tree";

// The row's right-hand end is a timestamp or a slot (the hero's launch
// banner), never both. These pin which element each case renders, so the
// slot's responsive classes and the timestamp's styling can't swap silently.

const classesOf = (
  tree: ReturnType<typeof SectionHeader>,
  tag: "div" | "span",
) => findAll(tree, tag).map((el) => String(attrs(el).className ?? ""));

describe("SectionHeader", () => {
  it("renders the timestamp and no slot when given a timestamp", () => {
    const tree = SectionHeader({ index: "02", label: "Side", timestamp: "t0" });
    expect(textOf(tree)).toContain("t0");
    expect(classesOf(tree, "span")).toContain("tabular-nums opacity-60");
    expect(classesOf(tree, "div").some((c) => c.includes("basis-full"))).toBe(
      false,
    );
  });

  it("renders the slot in place of the timestamp when given children", () => {
    const tree = SectionHeader({
      index: "01",
      label: "Hero",
      children: createElement("p", null, "banner"),
    });
    expect(textOf(tree)).toContain("banner");
    const slot = classesOf(tree, "div").find((c) => c.includes("basis-full"));
    expect(slot).toContain("@5xl:basis-auto");
    expect(classesOf(tree, "span")).not.toContain("tabular-nums opacity-60");
  });

  it("rejects a timestamp and a slot together at the type level", () => {
    const both = () =>
      // @ts-expect-error — the right-hand end holds one or the other.
      SectionHeader({ index: "01", label: "x", timestamp: "t", children: "c" });
    expect(both).toBeTypeOf("function");
  });
});

import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { SectionHeader } from "./SectionHeader";
import { attrs, findAll, textOf } from "@/test-utils/react-tree";

// The row's right-hand end is a timestamp or a badge (the hero's testnet
// badge), never both. These pin which one each case renders.

const STAMP = "tabular-nums opacity-60";

const classesOf = (tree: ReturnType<typeof SectionHeader>) =>
  findAll(tree, "span").map((el) => String(attrs(el).className ?? ""));

describe("SectionHeader", () => {
  it("renders the timestamp when given one", () => {
    const tree = SectionHeader({ index: "02", label: "Side", timestamp: "t0" });
    expect(textOf(tree)).toContain("t0");
    expect(classesOf(tree)).toContain(STAMP);
  });

  it("renders the badge in place of the timestamp", () => {
    const tree = SectionHeader({
      index: "01",
      label: "Hero",
      badge: createElement("i", null, "testnet"),
    });
    expect(textOf(tree)).toMatch(/testnet$/);
    expect(classesOf(tree)).not.toContain(STAMP);
  });

  it("rejects a timestamp and a badge together at the type level", () => {
    const both = () =>
      // @ts-expect-error — the right-hand end holds one or the other.
      SectionHeader({
        index: "01",
        label: "x",
        timestamp: "t",
        badge: createElement("i"),
      });
    expect(both).toBeTypeOf("function");
  });

  it("rejects an empty badge at the type level", () => {
    const empty = () =>
      // @ts-expect-error — a nullish badge would render an empty timestamp.
      SectionHeader({ index: "01", label: "x", badge: null });
    expect(empty).toBeTypeOf("function");
  });
});

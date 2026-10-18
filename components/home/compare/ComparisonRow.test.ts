import { describe, expect, it } from "vitest";
import { ComparisonRow } from "./ComparisonRow";
import type { CompareRow } from "@/lib/copy";
import {
  asElement,
  attrs,
  childElements,
  hasTag,
  textOf,
} from "@/test-utils/react-tree";

const PLAIN: CompareRow = {
  axis: "delivery",
  traditional: "fixed provisioning",
  decdn: "demand-shaped mesh",
};

const PRICE: CompareRow = {
  axis: "price",
  traditional: "$0.04–$0.20 /GB",
  decdn: "$0.01 /GB",
  emphasis: true,
};

const BOTH = [
  { name: "a plain row", row: PLAIN },
  { name: "the price row", row: PRICE },
] as const;

describe("ComparisonRow", () => {
  it.each(BOTH)("returns a tr of th, td, td for $name", ({ row }) => {
    const tr = asElement(ComparisonRow({ row }));
    expect(tr.type).toBe("tr");
    expect(childElements(tr).map((c) => c.type)).toEqual(["th", "td", "td"]);
  });

  it.each(BOTH)("scopes the axis to its row for $name", ({ row }) => {
    const [th] = childElements(ComparisonRow({ row }));
    expect(attrs(th).scope).toBe("row");
    expect(th.props.children).toBe(row.axis);
  });

  // Column order is the whole point: without it a consumer has to infer which
  // value belongs to which CDN from word order.
  it.each(BOTH)(
    "orders the cells traditional then decdn for $name",
    ({ row }) => {
      const [, traditional, decdn] = childElements(ComparisonRow({ row }));
      expect(textOf(traditional)).toContain(
        row.traditional.replace(" /GB", ""),
      );
      expect(textOf(decdn)).toContain(row.decdn.replace(" /GB", ""));
    },
  );

  // The strike is drawn by an aria-hidden bar, so <s> is the only thing in the
  // extracted text marking this as the *legacy* rate rather than one of ours.
  it("strikes the legacy rate on the price row", () => {
    const [, traditional] = childElements(ComparisonRow({ row: PRICE }));
    expect(hasTag(traditional, "s")).toBe(true);
    expect(textOf(traditional)).toContain("$0.04–$0.20");
  });

  it("leaves the deCDN rate unstruck on the price row", () => {
    const [, , decdn] = childElements(ComparisonRow({ row: PRICE }));
    expect(hasTag(decdn, "s")).toBe(false);
    expect(textOf(decdn)).toContain("$0.01");
  });

  it("strikes nothing on a plain row", () => {
    expect(hasTag(ComparisonRow({ row: PLAIN }), "s")).toBe(false);
  });

  // The unit is peeled off the stored string rather than hardcoded, so a row
  // priced in something other than /GB still renders its own unit.
  it("keeps each rate's unit beside its figure", () => {
    const [, traditional, decdn] = childElements(ComparisonRow({ row: PRICE }));
    expect(textOf(traditional)).toBe("$0.04–$0.20/GB");
    expect(textOf(decdn)).toBe("$0.01/GB");
  });

  it("renders a unit-less value verbatim", () => {
    const [, traditional] = childElements(
      ComparisonRow({
        row: {
          axis: "price",
          traditional: "free",
          decdn: "free",
          emphasis: true,
        },
      }),
    );
    expect(textOf(traditional)).toBe("free");
  });

  it("applies the delay as a reveal custom property", () => {
    const tr = asElement(ComparisonRow({ row: PLAIN, delay: 480 }));
    expect(attrs(tr).style).toEqual({ "--reveal-delay": "480ms" });
  });
});

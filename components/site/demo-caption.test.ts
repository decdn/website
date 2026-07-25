import { describe, expect, it } from "vitest";
import { FleetStatus } from "./FleetStatus";
import {
  asElement,
  attrs,
  findAll,
  findOne,
  textOf,
} from "@/test-utils/react-tree";

// HeroTerminal is "use client" and calls useState, so it cannot be invoked as
// a plain function here — its caption is covered by the build-output check in
// #205's acceptance steps instead. FleetStatus is a server component and can
// be walked directly.

const tree = FleetStatus({ className: "block w-full" });

describe("FleetStatus", () => {
  it("wraps the panel in a figure", () => {
    const figure = asElement(tree);
    expect(figure.type).toBe("figure");
    expect(attrs(figure).className).toBe("block w-full");
  });

  // The whole point of the caption: aria-hidden hides the numbers from
  // assistive tech but not from text extractors, so the hedge has to sit
  // outside the hidden subtree to travel with them.
  it("captions the panel from outside the aria-hidden subtree", () => {
    const caption = findOne(tree, "figcaption");
    expect(attrs(caption)["aria-hidden"]).toBeUndefined();
    const hidden = findAll(tree, "div").filter(
      (el) => attrs(el)["aria-hidden"] === true,
    );
    expect(hidden).toHaveLength(1);
    expect(findAll(hidden[0], "figcaption")).toHaveLength(0);
  });

  it("says the figures are illustrative, not telemetry", () => {
    const caption = textOf(findOne(tree, "figcaption")).toLowerCase();
    expect(caption).toContain("illustrative");
    expect(caption).toContain("not live network telemetry");
    expect(caption).toContain("/legal/disclaimer/");
  });

  // The numbers themselves stay — they are part of the design, and they stay
  // hidden from assistive tech. Only the framing is new.
  it("keeps the invented aggregates inside the hidden panel", () => {
    const [panel] = findAll(tree, "div").filter(
      (el) => attrs(el)["aria-hidden"] === true,
    );
    const text = textOf(panel);
    expect(text).toContain("15.1 GB/s");
    expect(text).toContain("$0.151 /s");
  });
});

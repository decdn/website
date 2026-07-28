import { describe, expect, it } from "vitest";
import { FleetStatus } from "./FleetStatus";
import { DEMO_CAPTIONS } from "@/lib/copy";
import { attrs, findAll, findOne, textOf } from "@/test-utils/react-tree";

// Both demo widgets delegate the <figure>/<figcaption> structure to
// components/ui/DemoFigure, whose own test asserts that the caption sits
// outside the aria-hidden subtree. What is left to check here is that each
// widget actually composes it, with the right caption.
//
// FleetStatus is a server component and can be walked. HeroTerminal is
// "use client" and calls useState, so it cannot be invoked as a plain
// function — scripts/check-out.mjs greps the built HTML for both captions,
// which is the only check that sees HeroTerminal render.

const tree = FleetStatus({ className: "block w-full" });

describe("FleetStatus", () => {
  it("renders through DemoFigure", () => {
    const figure = findOne(tree, "figure");
    expect(attrs(figure).className).toBe("block w-full");
    const panels = findAll(tree, "div").filter(
      (el) => attrs(el)["aria-hidden"] === true,
    );
    expect(panels).toHaveLength(1);
    expect(attrs(panels[0]).className).toBe("fleet");
  });

  it("captions the panel with the fleet hedge", () => {
    expect(textOf(findOne(tree, "figcaption"))).toBe(DEMO_CAPTIONS.fleet);
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

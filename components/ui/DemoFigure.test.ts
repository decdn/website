import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { DemoFigure } from "./DemoFigure";
import {
  asElement,
  attrs,
  findAll,
  findOne,
  textOf,
} from "@/test-utils/react-tree";

const CAPTION = "Illustrative deCDN thing. Sample values, not telemetry.";

const tree = DemoFigure({
  panelClassName: "fleet",
  caption: CAPTION,
  className: "block w-full",
  children: createElement("div", { className: "inner" }, "15.1 GB/s"),
});

describe("DemoFigure", () => {
  it("wraps the panel in a figure carrying the caller's className", () => {
    const figure = asElement(tree);
    expect(figure.type).toBe("figure");
    expect(attrs(figure).className).toBe("block w-full");
  });

  it("puts the caller's panel class on the hidden panel, not the figure", () => {
    const panel = findAll(tree, "div").filter(
      (el) => attrs(el)["aria-hidden"] === true,
    );
    expect(panel).toHaveLength(1);
    expect(attrs(panel[0]).className).toBe("fleet");
  });

  // The entire reason this component exists. aria-hidden hides the invented
  // numbers from assistive tech but not from text extractors, so the hedge has
  // to sit outside the hidden subtree to travel with them. Getting this wrong
  // is a one-line mistake in either widget and invisible in review.
  it("captions the panel from outside the aria-hidden subtree", () => {
    const caption = findOne(tree, "figcaption");
    expect(attrs(caption)["aria-hidden"]).toBeUndefined();
    expect(textOf(caption)).toBe(CAPTION);

    const [panel] = findAll(tree, "div").filter(
      (el) => attrs(el)["aria-hidden"] === true,
    );
    expect(findAll(panel, "figcaption")).toHaveLength(0);
  });

  it("keeps the children inside the hidden panel", () => {
    const [panel] = findAll(tree, "div").filter(
      (el) => attrs(el)["aria-hidden"] === true,
    );
    expect(textOf(panel)).toContain("15.1 GB/s");
  });
});

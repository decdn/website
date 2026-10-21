import { describe, expect, it } from "vitest";
import * as icons from "./icons";
import { asElement, attrs } from "@/test-utils/react-tree";

// Each glyph's size class applies only once the stylesheet has loaded; the
// width/height attributes are what an earlier, unstyled paint uses, and the
// class overrides them after. Why, and the build check that covers every
// other prerendered <svg>: scripts/check-out.mjs, failure class 6.

describe("icons", () => {
  const entries = Object.entries(icons);

  it("exports glyphs to check", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)(
    "%s repeats its size class as width and height",
    (_, Icon) => {
      const props = attrs(asElement(Icon()));
      expect(props.width).toMatch(/\S/);
      expect(props.height).toBe(props.width);
      expect(String(props.className).split(/\s+/)).toContain(
        `size-[${String(props.width)}]`,
      );
    },
  );
});

import fs from "node:fs";
import path from "node:path";
import { createElement, isValidElement } from "react";
import { describe, expect, it } from "vitest";
import { Frame } from "./Frame";
import { highlightBrand } from "@/components/brand";
import { asElement, attrs } from "@/test-utils/react-tree";

// The paper-contrast fix is a string contract across three files: Frame sets
// --whisper-text on paper, highlightBrand reads it through `text-whisper-text`,
// and globals.css declares the tokens that utility resolves against. A typo
// in any one of them makes Tailwind emit nothing or the variable fall back to
// raw --whisper (~3.5:1 on white) — lint, typecheck and build all stay green.
// These pin the names; the rendered colour itself is outside vitest's reach.

const PAPER_SWAP = "[--whisper-text:var(--whisper-deep)]";

const sectionClass = (tone: "ink" | "paper") =>
  String(
    attrs(
      asElement(
        Frame({ id: "t", tone, children: createElement("p", null, "x") }),
      ),
    ).className,
  );

describe("brand-text contrast wiring", () => {
  it("points --whisper-text at the deep whisper on paper only", () => {
    expect(sectionClass("paper")).toContain(PAPER_SWAP);
    expect(sectionClass("ink")).not.toContain(PAPER_SWAP);
  });

  it("colours the brand span through --whisper-text", () => {
    const spans = highlightBrand("run deCDN").filter(isValidElement);
    expect(spans).toHaveLength(1);
    expect(attrs(asElement(spans[0])).className).toBe("text-whisper-text");
  });

  it("declares the tokens the utility and the swap resolve against", () => {
    const css = fs.readFileSync(
      path.join(process.cwd(), "app", "globals.css"),
      "utf8",
    );
    expect(css).toMatch(/--whisper-deep:/);
    expect(css).toMatch(/--whisper-text:/);
    expect(css).toMatch(/--color-whisper-text:\s*var\(--whisper-text\)/);
  });
});

describe("Frame attributes", () => {
  const section = (props: { navDark?: boolean; unnamed?: boolean } = {}) =>
    attrs(
      asElement(
        Frame({
          id: "t",
          tone: "ink",
          ...props,
          children: createElement("p", null, "x"),
        }),
      ),
    );

  // Chrome finds the band with `[data-nav-dark]`. React would write a false
  // value as the string "false", which still matches — so off must mean the
  // attribute is absent, not false.
  it("omits data-nav-dark unless navDark is set", () => {
    expect(section()["data-nav-dark"]).toBeUndefined();
    expect(section({ navDark: false })["data-nav-dark"]).toBeUndefined();
    expect(section({ navDark: true })["data-nav-dark"]).toBe(true);
  });

  it("is named by its ${id}-h heading unless unnamed", () => {
    expect(section()["aria-labelledby"]).toBe("t-h");
    expect(section({ unnamed: true })["aria-labelledby"]).toBeUndefined();
  });
});

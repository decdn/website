import { describe, expect, it } from "vitest";
import { Hero } from "./Hero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { HERO_BADGE } from "@/lib/copy";
import { attrs, childElements, findAll, textOf } from "@/test-utils/react-tree";

// Walking all of Hero() would call HeroTerminal, a client component whose
// hooks throw outside React, so pick the header element out of the Frame's
// direct children and render just that.
const headerEl = childElements(Hero()).find((el) => el.type === SectionHeader);
const header = SectionHeader(
  headerEl?.props as Parameters<typeof SectionHeader>[0],
);
const spans = findAll(header, "span");

describe("hero section header", () => {
  it("ends with the testnet badge in place of a timestamp", () => {
    expect(headerEl).toBeDefined();
    expect(textOf(header)).toMatch(new RegExp(`${HERO_BADGE}$`));
    expect(spans.map((s) => attrs(s).className)).not.toContain(
      "tabular-nums opacity-60",
    );
  });

  it("hides the badge's status dot from screen readers", () => {
    const dot = spans.find((s) => attrs(s).className === "status-live");
    expect(dot && attrs(dot)["aria-hidden"]).toBe(true);
  });
});

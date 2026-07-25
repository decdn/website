import { describe, expect, it } from "vitest";
import {
  COMPARE_HEADLINE,
  COMPARE_LEAD,
  COMPARE_ROWS,
  CONTACT_LEAD,
  HERO_HEADLINE,
  HERO_LEAD,
  METHOD_STEPS,
  SITE_DESCRIPTION,
  SITE_TITLE,
} from "./copy";

// Every string in the module, labelled by where it lives. These are rendered
// into JSX *and* serialised into markdown, and the two disagree about
// whitespace: JSX collapses a newline inside a string literal, markdown does
// not. So a stray newline would be invisible on the page and would break the
// mirror's list items and table cells.
const ALL_STRINGS: readonly [string, string][] = [
  ["SITE_TITLE", SITE_TITLE],
  ["SITE_DESCRIPTION", SITE_DESCRIPTION],
  ...HERO_HEADLINE.map((s, i): [string, string] => [`HERO_HEADLINE[${i}]`, s]),
  ["HERO_LEAD", HERO_LEAD],
  ...COMPARE_HEADLINE.map((s, i): [string, string] => [
    `COMPARE_HEADLINE[${i}]`,
    s,
  ]),
  ["COMPARE_LEAD", COMPARE_LEAD],
  ...COMPARE_ROWS.flatMap((r): [string, string][] => [
    [`COMPARE_ROWS.${r.axis}.axis`, r.axis],
    [`COMPARE_ROWS.${r.axis}.traditional`, r.traditional],
    [`COMPARE_ROWS.${r.axis}.decdn`, r.decdn],
  ]),
  ...METHOD_STEPS.flatMap((s): [string, string][] => [
    [`METHOD_STEPS.${s.n}.n`, s.n],
    [`METHOD_STEPS.${s.n}.word`, s.word],
    [`METHOD_STEPS.${s.n}.body`, s.body],
  ]),
  ["CONTACT_LEAD", CONTACT_LEAD],
];

describe("homepage copy strings", () => {
  it.each(ALL_STRINGS)(
    "%s is a trimmed, single-line, non-empty string",
    (_name, value) => {
      expect(value).not.toBe("");
      expect(value).toBe(value.trim());
      expect(value).not.toMatch(/[\n\r\t]/);
      expect(value).not.toMatch(/ {2}/);
    },
  );
});

describe("COMPARE_ROWS", () => {
  // Hardcoded, not `COMPARE_ROWS.length`: the section header says "seven
  // axes" in prose (components/site/Compare.tsx), so the count is a published
  // claim rather than an implementation detail.
  it("has exactly seven axes", () => {
    expect(COMPARE_ROWS).toHaveLength(7);
  });

  it("names each axis once", () => {
    const axes = COMPARE_ROWS.map((r) => r.axis);
    expect(new Set(axes).size).toBe(axes.length);
  });

  // Two emphasised rows would render two display-size rows; zero would
  // silently downgrade the price row to a normal one.
  it("emphasises exactly one row, and it is price", () => {
    const emphasised = COMPARE_ROWS.filter((r) => r.emphasis);
    expect(emphasised).toHaveLength(1);
    expect(emphasised[0].axis).toBe("price");
  });

  it("keeps the price row's two rates", () => {
    const price = COMPARE_ROWS.find((r) => r.axis === "price");
    expect(price?.traditional).toBe("$0.04–$0.20 /GB");
    expect(price?.decdn).toBe("$0.01 /GB");
  });
});

describe("METHOD_STEPS", () => {
  it("numbers the steps 01–03", () => {
    expect(METHOD_STEPS.map((s) => s.n)).toEqual(["01", "02", "03"]);
  });

  it("names the steps probe, swarm, settle", () => {
    expect(METHOD_STEPS.map((s) => s.word)).toEqual([
      "probe",
      "swarm",
      "settle",
    ]);
  });
});

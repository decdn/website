import { describe, expect, it } from "vitest";
import {
  COMPARE_HEADLINE,
  COMPARE_LEAD,
  COMPARE_ROWS,
  CONTACT_LEAD,
  type CompareRow,
  DEMO_CAPTIONS,
  HERO_FIGURES,
  HERO_HEADLINE,
  HERO_LEAD,
  METHOD_FIGURES,
  METHOD_STEPS,
  SITE_DESCRIPTION,
  SITE_TITLE,
  STACK,
  statusBlock,
  TARGET_RATE,
} from "./copy";

// COMPARE_ROWS is `as const`, so each element has its own literal type and the
// optional `emphasis` is absent from six of the seven. Widening to the
// declared type is what lets a test reason about the rows uniformly; the
// narrow types are for consumers that index a specific row.
const ROWS: readonly CompareRow[] = COMPARE_ROWS;

// Every string in the module, labelled by where it lives. These are rendered
// into JSX *and* serialised into markdown, and the two disagree about
// whitespace: JSX collapses a newline inside a string literal, markdown does
// not. So a stray newline would be invisible on the page and would break the
// mirror's list items and table cells. `|` is screened for the same reason —
// the mirror's comparison table is pipe-delimited.
const ALL_STRINGS: readonly [string, string][] = [
  ["SITE_TITLE", SITE_TITLE],
  ["SITE_DESCRIPTION", SITE_DESCRIPTION],
  ...HERO_HEADLINE.map((s, i): [string, string] => [`HERO_HEADLINE[${i}]`, s]),
  ["HERO_LEAD", HERO_LEAD],
  ...HERO_FIGURES.flatMap((f): [string, string][] => [
    [`HERO_FIGURES.${f.label}.label`, f.label],
    [`HERO_FIGURES.${f.label}.value`, f.value],
  ]),
  ...COMPARE_HEADLINE.map((s, i): [string, string] => [
    `COMPARE_HEADLINE[${i}]`,
    s,
  ]),
  ["COMPARE_LEAD", COMPARE_LEAD],
  ...ROWS.flatMap((r): [string, string][] => [
    [`COMPARE_ROWS.${r.axis}.axis`, r.axis],
    [`COMPARE_ROWS.${r.axis}.traditional`, r.traditional],
    [`COMPARE_ROWS.${r.axis}.decdn`, r.decdn],
  ]),
  ...METHOD_STEPS.flatMap((s): [string, string][] => [
    [`METHOD_STEPS.${s.n}.n`, s.n],
    [`METHOD_STEPS.${s.n}.word`, s.word],
    [`METHOD_STEPS.${s.n}.body`, s.body],
  ]),
  ...STACK.map((s, i): [string, string] => [`STACK[${i}]`, s]),
  ...METHOD_FIGURES.flatMap((f): [string, string][] => [
    [`METHOD_FIGURES.${f.label}.label`, f.label],
    [`METHOD_FIGURES.${f.label}.value`, f.value],
  ]),
  ["DEMO_CAPTIONS.terminal", DEMO_CAPTIONS.terminal],
  ["DEMO_CAPTIONS.fleet", DEMO_CAPTIONS.fleet],
  ["CONTACT_LEAD", CONTACT_LEAD],
];

describe("copy strings", () => {
  it.each(ALL_STRINGS)(
    "%s is a trimmed, single-line, non-empty string",
    (_name, value) => {
      expect(value).not.toBe("");
      expect(value).toBe(value.trim());
      expect(value).not.toMatch(/[\n\r\t]/);
      expect(value).not.toMatch(/ {2}/);
      expect(value).not.toContain("|");
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
    const axes = ROWS.map((r) => r.axis);
    expect(new Set(axes).size).toBe(axes.length);
  });

  // Two emphasised rows would render two display-size rows; zero would
  // silently downgrade the price row to a normal one. It has to be *first*
  // because components/site/Compare.tsx keys the reveal cascade on array
  // position — reordering the rows would break the cascade with nothing else
  // to catch it.
  it("emphasises exactly one row, it is price, and it leads", () => {
    const emphasised = ROWS.filter((r) => r.emphasis);
    expect(emphasised).toHaveLength(1);
    expect(emphasised[0].axis).toBe("price");
    expect(ROWS[0].axis).toBe("price");
  });

  it("keeps the price row's two rates", () => {
    const price = ROWS.find((r) => r.axis === "price");
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

describe("statusBlock", () => {
  // The hedge is the reason the $0.01/GB figure can be published as an Offer
  // in lib/schema.ts at all; dropping it leaves a target rate reading as a
  // committed price on the two surfaces an agent is most likely to ingest.
  it("quotes the target rate and hedges it", () => {
    const block = statusBlock("across this site");
    expect(block).toContain(TARGET_RATE);
    expect(block).toContain(
      "public target rate, not a protocol-enforced price",
    );
    expect(block).toContain("testnet v0");
  });

  it("places the scope phrase in the sentence", () => {
    expect(statusBlock("throughout")).toContain(
      "quoted throughout is a public",
    );
  });
});

describe("DEMO_CAPTIONS", () => {
  // Both captions hedge invented figures, so both have to say so and point at
  // the disclaimer. HeroTerminal is a client component the tree walker can't
  // invoke, which is why its caption is asserted here and its *rendering* is
  // asserted by scripts/check-out.mjs against the built HTML.
  it.each(Object.entries(DEMO_CAPTIONS))(
    "%s names the figures as illustrative and links the disclaimer",
    (_name, caption) => {
      expect(caption).toMatch(/^Illustrative deCDN /);
      expect(caption).toContain("not live network telemetry");
      expect(caption).toContain("/legal/disclaimer/");
    },
  );
});

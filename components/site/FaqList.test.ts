import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FaqList, INITIAL_FAQ_STATE, nextFaqState } from "./FaqList";
import { FAQ_ITEMS } from "@/lib/faq";

// FaqList owns a useState, so test-utils/react-tree's walkers would throw on
// it (no dispatcher outside a render). The server string renderer runs the
// hook at its initial value and is what produces the static export, so its
// output is exactly the HTML that ships before hydration.
const html = renderToStaticMarkup(createElement(FaqList, { section: "04" }));

const ordinals = [
  ...html.matchAll(/class="faq-ordinal[^"]*"[^>]*>([^<]+)</g),
].map((m) => m[1]);
const controls = [...html.matchAll(/aria-controls="([^"]+)"/g)].map(
  (m) => m[1],
);

describe("FaqList", () => {
  // The card on the right has to show something; index 0 on both server and
  // client, in both layouts, is the hydration contract.
  it("ships with the first answer open, and only the first", () => {
    expect(html.match(/aria-expanded="true"/g)).toHaveLength(1);
    expect(html.match(/data-selected="true"/g)).toHaveLength(2); // dt + dd
    expect(html).toMatch(/aria-expanded="true"[^>]*aria-controls="faq-a-0"/);
  });

  // lib/schema.test.ts guards the FAQPage side of "structured data must
  // match page content"; this guards the page side — every entry, in order.
  it("renders every entry in order, numbered from 1 under the section", () => {
    expect(ordinals).toEqual(FAQ_ITEMS.map((_, i) => `04.${i + 1}`));
    expect(controls).toEqual(FAQ_ITEMS.map((_, i) => `faq-a-${i}`));
    for (const id of controls) expect(html).toContain(`id="${id}"`);
  });

  // .faq-grid's row template is repeat(var(--faq-n), auto) plus a sink row;
  // if the count and the rows drift, the last question lands in the sink.
  it("tells the grid how many question rows it has", () => {
    expect(html).toContain(`style="--faq-n:${FAQ_ITEMS.length}"`);
    expect(html.match(/<dt /g)).toHaveLength(FAQ_ITEMS.length);
  });
});

describe("nextFaqState", () => {
  const state = (selected: number, open: number[]) => ({
    selected,
    open: new Set(open),
  });

  // Closing another answer would move the tapped question or the page, so
  // at phone width a tap only ever changes its own answer.
  it("opens a phone answer without closing the others", () => {
    const next = nextFaqState(state(0, [0]), 3, true);
    expect([...next.open].sort()).toEqual([0, 3]);
    expect(next.selected).toBe(3);
  });

  it("closes an open phone answer on a second tap, leaving the card", () => {
    const next = nextFaqState(state(3, [0, 3]), 3, true);
    expect([...next.open]).toEqual([0]);
    expect(next.selected).toBe(3);
  });

  it("selects on desktop and shows the same answer if the window narrows", () => {
    const next = nextFaqState(state(0, [0, 2, 5]), 4, false);
    expect(next.selected).toBe(4);
    expect([...next.open]).toEqual([4]);
  });

  it("does not mutate the previous state", () => {
    nextFaqState(INITIAL_FAQ_STATE, 2, true);
    expect([...INITIAL_FAQ_STATE.open]).toEqual([0]);
  });
});

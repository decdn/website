import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FaqList } from "./FaqList";
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
  // The card on the right has to show something, and the phone accordion
  // has to open something; index 0 on both server and client is the
  // hydration contract.
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

import { COMPARE_HEADLINE, COMPARE_LEAD, COMPARE_ROWS } from "@/lib/copy";
import { highlightBrand } from "@/components/ui/brand";
import { ComparisonRow } from "@/components/ui/ComparisonRow";
import { Frame } from "@/components/ui/Frame";
import { SectionHeader } from "@/components/ui/SectionHeader";

// The <caption> a screen reader announces and a text extractor reads before
// the cells. The axis list is derived rather than written out so it can't
// drift from the rows below it; "seven" stays literal because the section
// header promises it in prose, and lib/copy.test.ts pins the count.
const AXES = COMPARE_ROWS.map((row) => row.axis);
const CAPTION = `Traditional CDN compared with deCDN across seven axes: ${AXES.slice(
  0,
  -1,
).join(", ")}, and ${AXES[AXES.length - 1]}.`;

export function Compare() {
  return (
    <Frame id="compare" tone="ink">
      <SectionHeader
        index="02"
        label="Side by side"
        timestamp="traditional vs decdn · seven axes"
      />

      <div className="mt-14 flex flex-col gap-10">
        <h2
          data-reveal
          id="compare-h"
          className="hug flex flex-col text-h2 leading-[0.92] font-semibold tracking-[-0.04em]"
        >
          <span>{COMPARE_HEADLINE[0]}</span>
          <span className="pl-[3vw] opacity-60">{COMPARE_HEADLINE[1]}</span>
        </h2>

        <p
          data-reveal
          style={{ "--reveal-delay": "120ms" }}
          className="max-w-[62ch] text-body leading-[1.7] text-paper/75"
        >
          {highlightBrand(COMPARE_LEAD)}
        </p>
      </div>

      <table
        role="table"
        aria-labelledby="compare-caption"
        className="mt-auto flex flex-col pt-12"
      >
        <caption id="compare-caption" className="sr-only">
          {CAPTION}
        </caption>
        <thead role="rowgroup" className="contents">
          <tr
            role="row"
            data-reveal
            style={{ "--reveal-delay": "260ms" }}
            className="grid grid-cols-2 gap-x-4 gap-y-2 pb-3 @xl:grid-cols-12 @xl:gap-8"
          >
            {/* Deliberately invisible: the column exists to align the axis
                labels below it and the design has no room for a visible header
                over them. `opacity-0` keeps the word in the DOM for text
                extractors and in the a11y tree for the rowheaders' scope,
                where `hidden` would drop both. */}
            <th
              role="columnheader"
              scope="col"
              className="meta col-span-2 text-left font-normal opacity-0 @xl:col-span-2"
            >
              axis
            </th>
            <th
              role="columnheader"
              scope="col"
              className="meta text-left font-normal opacity-55 @xl:col-span-5"
            >
              traditional cdn
            </th>
            <th
              role="columnheader"
              scope="col"
              className="meta text-left font-normal @xl:col-span-5"
            >
              decdn
              <span className="ml-2 opacity-60">/ decentralized</span>
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup" className="contents">
          {COMPARE_ROWS.map((row, i) => (
            // Reproduces the previous hand-written cascade: the price row led
            // at 340ms and each row after it stepped by 60ms from 420ms.
            <ComparisonRow
              key={row.axis}
              row={row}
              delay={i === 0 ? 340 : 360 + i * 60}
            />
          ))}
        </tbody>
      </table>
    </Frame>
  );
}

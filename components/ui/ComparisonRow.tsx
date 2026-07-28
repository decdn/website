import type { CompareRow } from "@/lib/copy";

// "$0.04–$0.20 /GB" → ["$0.04–$0.20", "/GB"]. COMPARE_ROWS stores each rate as
// one string so the markdown mirror emits it whole; the emphasis branch peels
// the unit back off to render it at meta size beside the display-size figure.
// A value with no trailing unit comes back unsplit.
const splitUnit = (value: string): [string, string | null] => {
  const match = /^(.*) (\/.+)$/.exec(value);
  return match ? [match[1], match[2]] : [value, null];
};

function Rate({ value, strike }: { value: string; strike?: true }) {
  const [figure, unit] = splitUnit(value);
  const body = (
    <>
      {figure}
      {unit && (
        <span className="meta ml-1 align-baseline opacity-70">{unit}</span>
      )}
    </>
  );

  if (!strike) {
    return (
      <div className="hug text-price leading-[0.96] font-semibold tracking-[-0.04em]">
        {body}
      </div>
    );
  }

  return (
    <div className="hug relative inline-flex text-price leading-[0.96] font-semibold tracking-[-0.04em]">
      {/* <s> is the semantics — it is what marks this as the *legacy* rate in
          extracted text, where the bar below is invisible. Native line-through
          would render hairline-thin and at the text's own 55% opacity, so
          `no-underline` suppresses it and the aria-hidden bar draws the
          2px/4px paper-coloured strike instead. */}
      <s className="no-underline opacity-55">{body}</s>
      <span
        aria-hidden
        className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-paper @xl:h-[4px]"
      />
    </div>
  );
}

/**
 * One axis of the traditional-vs-deCDN matrix, as a real `<tr>`: the axis name
 * is a `<th scope="row">` and the two values are `<td>`s in traditional-then-
 * deCDN order, so a text extractor can bind each value to its column instead
 * of inferring it from word order.
 *
 * Overriding `display` on table elements strips the table role from the
 * accessibility tree in every engine, and the grid here is what produces both
 * the mobile "axis above, values side by side" stacking and the 2/5/5
 * twelve-column split at `@xl` — so every role is re-declared explicitly. The
 * tags still matter independently: extractors read `<tr>`/`<th>`/`<td>`, not
 * ARIA.
 */
// The two visual variants, side by side rather than as four separate ternaries
// down the JSX. `axis` spans both columns of the mobile grid and two of the
// twelve at @xl — one utility, both jobs; `text-left font-normal` stops the
// UA's bold, centred <th> defaults leaking through the .meta type.
const EMPHASIS_STYLES = {
  row: "grid grid-cols-2 gap-x-4 gap-y-3 border-t border-current/25 py-5 @xl:grid-cols-12 @xl:gap-8 @xl:py-8",
  axis: "meta col-span-2 text-left font-normal opacity-60 @xl:col-span-2 @xl:pt-2",
  traditional: "@xl:col-span-5",
  decdn: "@xl:col-span-5",
} as const;

const PLAIN_STYLES = {
  row: "grid grid-cols-2 gap-x-4 gap-y-2 border-t border-current/20 py-4 text-body @xl:grid-cols-12 @xl:gap-8 @xl:py-5",
  axis: "meta col-span-2 text-left font-normal opacity-60 @xl:col-span-2",
  traditional: "opacity-55 @xl:col-span-5",
  decdn: "font-semibold tracking-[-0.01em] @xl:col-span-5",
} as const;

export function ComparisonRow({
  row,
  delay = 0,
}: {
  row: CompareRow;
  delay?: number;
}) {
  const emphasis = row.emphasis === true;
  const style = emphasis ? EMPHASIS_STYLES : PLAIN_STYLES;
  return (
    <tr
      role="row"
      data-reveal
      style={{ "--reveal-delay": `${delay}ms` }}
      className={style.row}
    >
      <th role="rowheader" scope="row" className={style.axis}>
        {row.axis}
      </th>
      <td role="cell" className={style.traditional}>
        {emphasis ? <Rate value={row.traditional} strike /> : row.traditional}
      </td>
      <td role="cell" className={style.decdn}>
        {emphasis ? <Rate value={row.decdn} /> : row.decdn}
      </td>
    </tr>
  );
}

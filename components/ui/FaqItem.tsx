import { highlightBrand } from "@/components/ui/brand";

export function FaqItem({
  q,
  a,
  index,
  ordinal,
  selected,
  onSelect,
  delay = 0,
}: {
  q: string;
  a: string;
  index: number;
  /** Document-style number shown on the row and ghosted on the card, e.g. "04.1". */
  ordinal: string;
  selected: boolean;
  onSelect: (index: number) => void;
  delay?: number;
}) {
  const answerId = `faq-a-${index}`;
  return (
    // The wrapping div stays: HTML5 explicitly permits a div inside a <dl>
    // grouping one <dt> with its <dd>, and the pairing is what the FAQPage
    // JSON-LD restates. `contents` lifts dt and dd into the <dl>'s grid so
    // the questions can stack in one column while every answer shares the
    // card cell in the other (see .faq-grid in globals.css).
    <div className="contents">
      <dt
        data-reveal
        data-selected={selected ? "true" : undefined}
        style={{ "--reveal-delay": `${delay}ms` }}
        className="faq-row"
      >
        {/* Disclosure, not tabs: a native button keeps Tab/Enter/Space for
            free and lets the dt/dd pairing survive without ARIA overrides. */}
        <button
          type="button"
          className="faq-q"
          aria-expanded={selected}
          aria-controls={answerId}
          onClick={() => onSelect(index)}
        >
          <span
            aria-hidden
            className="faq-ordinal meta w-[3.5rem] shrink-0 tabular-nums"
          >
            {ordinal}
          </span>
          <span className="text-lead leading-[1.3] font-medium tracking-[-0.01em]">
            {q}
          </span>
        </button>
      </dt>
      {/* <dd> carries a UA margin-inline-start: 40px. Preflight zeroes it, but
          ms-0 says so at the call site rather than depending on preflight's
          reset list surviving a Tailwind upgrade. */}
      <dd
        id={answerId}
        data-reveal
        data-selected={selected ? "true" : undefined}
        style={{ "--reveal-delay": "120ms" }}
        className="faq-card ms-0"
      >
        <p className="faq-answer max-w-[60ch] text-body leading-[1.7] text-paper/85">
          {highlightBrand(a)}
        </p>
        {/* Ties the card back to its row when the selected question sits far
            below the card's top edge. Hidden at phone width, where the card
            renders directly under its question. */}
        <span aria-hidden className="faq-ghost hug">
          {ordinal}
        </span>
      </dd>
    </div>
  );
}

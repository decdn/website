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
    // dt and dd are direct children of the <dl> — the canonical form, and
    // the pairing is what the FAQPage JSON-LD restates. No wrapper, so both
    // are grid items of .faq-grid as-is (questions stack in one column,
    // every answer shares the card cell in the other) and `dt:last-of-type`
    // means the last question rather than every question.
    <>
      <dt
        data-reveal
        data-selected={selected ? "true" : undefined}
        style={{ "--reveal-delay": `${delay}ms` }}
        className="faq-row"
      >
        {/* Disclosure, not tabs: a native button keeps Tab/Enter/Space for
            free and lets the dt/dd pairing survive without ARIA overrides.
            One answer is always open, so the open one can't be collapsed:
            aria-disabled (not disabled) says so while keeping the button
            reachable, per the APG accordion pattern. */}
        <button
          type="button"
          className="faq-q"
          aria-expanded={selected}
          aria-disabled={selected || undefined}
          aria-controls={answerId}
          onClick={() => {
            if (!selected) onSelect(index);
          }}
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
      {/* No data-reveal here: at phone width the card toggles display, and a
          view()-timeline reveal created mid-scroll would leave a freshly
          opened answer dim until the reader scrolls. The .faq-answer rise
          is the card's entrance instead. */}
      <dd
        id={answerId}
        data-selected={selected ? "true" : undefined}
        className="faq-card"
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
    </>
  );
}

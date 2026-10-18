import { highlightBrand } from "@/components/home/brand";

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
  /** The answer's paragraphs, each rendered as its own <p>. */
  a: readonly string[];
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
      {/* No data-reveal here: at phone width the card opens and closes as
          the reader taps, and a view()-timeline reveal created mid-scroll
          would leave a freshly opened answer dim until the reader scrolls.
          The height slide and the .faq-answer rise are its entrance instead.
          See .faq-card in globals.css for what the dd, .faq-clip and
          .faq-panel each do. */}
      <dd
        id={answerId}
        data-selected={selected ? "true" : undefined}
        className="faq-card"
      >
        <div className="faq-clip">
          <div className="faq-panel">
            <div className="faq-answer flex max-w-[60ch] flex-col gap-[1em] text-body leading-[1.7] text-paper/85">
              {a.map((paragraph) => (
                <p key={paragraph}>{highlightBrand(paragraph)}</p>
              ))}
            </div>
            {/* Ties the card back to its row when the selected question
                sits far below the card's top edge. Hidden at phone width,
                where the card renders directly under its question. */}
            <span aria-hidden className="faq-ghost hug">
              {ordinal}
            </span>
          </div>
        </div>
      </dd>
    </>
  );
}

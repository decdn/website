import type { ReactNode } from "react";

/**
 * A decorative demo panel, captioned as illustrative.
 *
 * The panel is `aria-hidden` because its animated figures are noise for a
 * screen reader. Text extractors ignore `aria-hidden` entirely, though, and
 * every value in both panels is invented — so the caption has to sit *outside*
 * the hidden subtree, where a crawler reads it next to the figures it
 * qualifies.
 *
 * That placement is the whole reason this component exists rather than each
 * widget writing its own `<figure>`: it is a one-line mistake to make in
 * either of them, HeroTerminal is a client component that unit tests can't
 * walk, and components/ui/DemoFigure.test.ts asserts the structure once for
 * both. The captions themselves live in `DEMO_CAPTIONS` (lib/copy.ts), and
 * scripts/check-out.mjs greps the built HTML for them.
 *
 * `className` lands on the `<figure>` rather than the panel; both call sites
 * pass "block w-full", which behaves identically there (preflight zeroes
 * figure margin).
 */
export function DemoFigure({
  panelClassName,
  caption,
  className,
  children,
}: {
  panelClassName: string;
  caption: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <figure className={className}>
      <div aria-hidden className={panelClassName}>
        {children}
      </div>
      {/* Names /legal/disclaimer/ as plain text rather than an anchor: an
          sr-only link is focusable but invisible, which is its own a11y
          problem, and the footer already links the page. */}
      <figcaption className="sr-only">{caption}</figcaption>
    </figure>
  );
}

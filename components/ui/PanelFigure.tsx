import type { ReactNode } from "react";

/**
 * A decorative data panel with a plain-language caption.
 *
 * The panel is `aria-hidden` because its cycling, animated figures are noise
 * for a screen reader. Text extractors ignore `aria-hidden` entirely, though,
 * so the caption — which says where the figures come from and that they are
 * testnet readings — has to sit *outside* the hidden subtree, where a crawler
 * reads it next to the figures it qualifies.
 *
 * That placement is the whole reason this component exists rather than each
 * panel writing its own `<figure>`: it is a one-line mistake to make in
 * either of them, and components/ui/PanelFigure.test.ts asserts the structure
 * once for both. The captions themselves live in `PANEL_CAPTIONS`
 * (lib/copy.ts), and scripts/check-out.mjs greps the built HTML for them.
 *
 * `className` lands on the `<figure>` rather than the panel; both call sites
 * pass "block w-full", which behaves identically there (preflight zeroes
 * figure margin).
 */
export function PanelFigure({
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

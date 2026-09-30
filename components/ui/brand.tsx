import type { ReactNode } from "react";

/**
 * Wraps every case-insensitive `decdn` in a copy string with the whisper-green
 * brand span, normalising the casing to `deCDN` on the way through. The span
 * reads `--whisper-text`, which Frame deepens on paper so the brand stays AA
 * there (see globals.css :root).
 *
 * Lives here rather than beside any one caller because the strings it decorates
 * come from lib/copy.ts, which several components render — without a shared
 * helper the same sentence would style differently depending on which section
 * it landed in.
 */
export function highlightBrand(s: string): ReactNode[] {
  return s.split(/(decdn)/gi).map((part, i) =>
    part.toLowerCase() === "decdn" ? (
      <span key={i} className="text-whisper-text">
        deCDN
      </span>
    ) : (
      part
    ),
  );
}

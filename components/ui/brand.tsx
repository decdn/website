import type { ReactNode } from "react";

/**
 * Wraps every case-insensitive `decdn` in a copy string with the whisper-green
 * brand span, normalising the casing to `deCDN` on the way through.
 *
 * Lives here rather than beside any one caller because the strings it decorates
 * come from lib/copy.ts, which several components render — without a shared
 * helper the same sentence would style differently depending on which section
 * it landed in.
 */
export function highlightBrand(s: string): ReactNode[] {
  return s.split(/(decdn)/gi).map((part, i) =>
    part.toLowerCase() === "decdn" ? (
      <span key={i} className="text-whisper">
        deCDN
      </span>
    ) : (
      part
    ),
  );
}

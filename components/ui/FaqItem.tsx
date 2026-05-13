import type { ReactNode } from "react";

function highlightBrand(s: string): ReactNode[] {
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

export function FaqItem({
  q,
  a,
  delay = 0,
}: {
  q: string;
  a: string;
  delay?: number;
}) {
  return (
    <div
      data-reveal
      style={{ "--reveal-delay": `${delay}ms` }}
      className="grid grid-cols-1 gap-3 py-6 @xl:grid-cols-12 @xl:gap-8 @xl:py-8"
    >
      <div className="text-lead font-semibold tracking-[-0.01em] @xl:col-span-5">
        {q}
      </div>
      <p className="max-w-[60ch] text-body leading-[1.7] text-paper/75 @xl:col-span-7">
        {highlightBrand(a)}
      </p>
    </div>
  );
}

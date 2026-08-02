import { highlightBrand } from "@/components/ui/brand";

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
      {/* The wrapping div stays: HTML5 explicitly permits a div inside a <dl>
          grouping one <dt> with its <dd>, and it is what carries the reveal
          and the grid. What was missing is the pairing itself — a bare div and
          a <p> left the question and answer bound only by document order,
          contradicting the FAQPage JSON-LD that restates them. */}
      <dt className="text-lead font-semibold tracking-[-0.01em] @xl:col-span-5">
        {q}
      </dt>
      {/* <dd> carries a UA margin-inline-start: 40px. Preflight zeroes it, but
          ms-0 says so at the call site rather than depending on preflight's
          reset list surviving a Tailwind upgrade. */}
      <dd className="ms-0 max-w-[60ch] text-body leading-[1.7] text-paper/75 @xl:col-span-7">
        {highlightBrand(a)}
      </dd>
    </div>
  );
}

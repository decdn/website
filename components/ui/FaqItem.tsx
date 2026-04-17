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
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
      className="grid grid-cols-1 gap-3 py-6 sm:grid-cols-12 sm:gap-8 sm:py-8"
    >
      <div className="text-[16px] font-semibold tracking-[-0.01em] sm:col-span-5 sm:text-[18px]">
        {q}
      </div>
      <p
        className="max-w-[60ch] text-[14px] leading-[1.7] sm:col-span-7 sm:text-[15px]"
        style={{ color: "rgb(255 255 255 / 0.75)" }}
      >
        {a}
      </p>
    </div>
  );
}

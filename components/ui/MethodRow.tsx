export function MethodRow({
  n,
  word,
  body,
  delay = 0,
}: {
  n: string;
  word: string;
  body: string;
  delay?: number;
}) {
  return (
    <div
      data-reveal
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
      className="grid grid-cols-1 gap-4 py-7 sm:grid-cols-12 sm:gap-10 sm:py-10"
    >
      <div className="meta tabular-nums opacity-60 sm:col-span-1">{n}</div>
      <div
        className="hug font-semibold tracking-[-0.05em] sm:col-span-5"
        style={{ fontSize: "clamp(32px, 6.5vw, 96px)", lineHeight: "0.9" }}
      >
        {word}
      </div>
      <p className="max-w-[56ch] text-[15px] leading-[1.65] sm:col-span-6 sm:text-[17px]">
        {body}
      </p>
    </div>
  );
}

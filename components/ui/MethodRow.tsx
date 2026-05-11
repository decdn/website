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
      style={{ "--reveal-delay": `${delay}ms` }}
      className="grid grid-cols-1 gap-4 py-7 @xl:grid-cols-12 @xl:gap-10 @xl:py-10"
    >
      <div className="meta tabular-nums opacity-60 @xl:col-span-1">{n}</div>
      <div
        className="hug font-semibold tracking-[-0.05em] @xl:col-span-5"
        style={{ fontSize: "var(--fs-method-row)", lineHeight: "0.9" }}
      >
        {word}
      </div>
      <p
        className="max-w-[56ch] leading-[1.65] @xl:col-span-6"
        style={{ fontSize: "var(--fs-body)" }}
      >
        {body}
      </p>
    </div>
  );
}

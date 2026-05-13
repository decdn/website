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
      <div className="hug text-method-row leading-[0.9] font-semibold tracking-[-0.05em] @xl:col-span-5">
        {word}
      </div>
      <p className="max-w-[56ch] text-body leading-[1.65] @xl:col-span-6">
        {body}
      </p>
    </div>
  );
}

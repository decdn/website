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
      {/* The step name is the most heading-like text on the page and was a
          div, leaving the homepage with no h3 at all and the three steps
          undifferentiated from body text in a crawler's outline. Tailwind's
          preflight resets heading font-size and font-weight to inherit, so
          these classes keep the appearance byte-for-byte. */}
      <h3 className="hug text-method-row leading-[0.9] font-semibold tracking-[-0.05em] @xl:col-span-5">
        {word}
      </h3>
      <p className="max-w-[56ch] text-body leading-[1.65] @xl:col-span-6">
        {body}
      </p>
    </div>
  );
}

export function ComparisonRow({
  label,
  traditional,
  decdn,
  delay = 0,
}: {
  label: string;
  traditional: string;
  decdn: string;
  delay?: number;
}) {
  return (
    <div
      data-reveal
      style={{ "--reveal-delay": `${delay}ms` }}
      className="grid gap-2 border-t border-current/20 py-4 text-body @xl:grid-cols-12 @xl:gap-8 @xl:py-5"
    >
      <div className="meta opacity-60 @xl:col-span-2">{label}</div>
      <div className="grid grid-cols-2 gap-4 @xl:contents">
        <div className="opacity-55 @xl:col-span-5">{traditional}</div>
        <div className="font-semibold tracking-[-0.01em] @xl:col-span-5">
          {decdn}
        </div>
      </div>
    </div>
  );
}

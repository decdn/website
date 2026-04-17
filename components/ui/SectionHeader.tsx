export function SectionHeader({
  index,
  label,
  timestamp,
}: {
  index: string;
  label: string;
  timestamp: string;
}) {
  return (
    <header className="flex flex-col gap-3">
      <span aria-hidden className="rule opacity-50" />
      <div className="flex items-baseline justify-between gap-6 text-[11px] font-medium tracking-[0.22em] uppercase">
        <span>
          § {index} / {label}
        </span>
        <span className="tabular-nums opacity-60">{timestamp}</span>
      </div>
    </header>
  );
}

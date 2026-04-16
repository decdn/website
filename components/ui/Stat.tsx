type Props = {
  label: string;
  value: string;
};

export function Stat({ label, value }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <span className="font-mono text-lg text-ink">{value}</span>
    </div>
  );
}

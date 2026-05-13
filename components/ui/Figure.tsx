export function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="meta opacity-60">{label}</span>
      <span className="text-body font-medium tracking-[-0.01em] tabular-nums">
        {value}
      </span>
    </div>
  );
}

export function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="meta opacity-60">{label}</span>
      <span
        className="font-medium tabular-nums"
        style={{ fontSize: "var(--fs-body)", letterSpacing: "-0.01em" }}
      >
        {value}
      </span>
    </div>
  );
}

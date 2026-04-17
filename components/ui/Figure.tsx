export function Figure({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="meta opacity-60">{k}</span>
      <span
        className="text-[15px] font-medium tabular-nums sm:text-[17px]"
        style={{ letterSpacing: "-0.01em" }}
      >
        {v}
      </span>
    </div>
  );
}

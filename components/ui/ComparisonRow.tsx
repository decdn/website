export function ComparisonRow({
  label,
  legacy,
  decdn,
  delay = 0,
}: {
  label: string;
  legacy: string;
  decdn: string;
  delay?: number;
}) {
  return (
    <div
      data-reveal
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
      className="grid gap-2 border-t border-current/20 py-4 text-[14px] sm:grid-cols-12 sm:gap-8 sm:py-5 sm:text-[15px]"
    >
      <div className="meta opacity-60 sm:col-span-2">{label}</div>
      <div className="grid grid-cols-2 gap-4 sm:contents">
        <div className="opacity-55 sm:col-span-5">{legacy}</div>
        <div className="font-semibold tracking-[-0.01em] sm:col-span-5">
          {decdn}
        </div>
      </div>
    </div>
  );
}

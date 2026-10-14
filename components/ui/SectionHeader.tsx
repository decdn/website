import type { ReactElement } from "react";

/** The row's right-hand end holds a timestamp or a badge, never both. */
type SectionHeaderProps = { index: string; label: string } & (
  | { timestamp: string; badge?: never }
  | { badge: ReactElement; timestamp?: never }
);

export function SectionHeader({
  index,
  label,
  timestamp,
  badge,
}: SectionHeaderProps) {
  return (
    <header className="flex flex-col gap-3">
      <span aria-hidden className="rule opacity-50" />
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 text-micro font-medium tracking-[0.22em] uppercase">
        <span>
          § {index} / {label}
        </span>
        {badge ?? <span className="tabular-nums opacity-60">{timestamp}</span>}
      </div>
    </header>
  );
}

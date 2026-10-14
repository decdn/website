import type { ReactNode } from "react";

export function SectionHeader({
  index,
  label,
  timestamp,
  children,
}: {
  index: string;
  label: string;
  timestamp?: string;
  /** Takes the right-hand slot in place of the timestamp at @5xl; below it,
   *  drops to its own line under the label. */
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3">
      <span aria-hidden className="rule opacity-50" />
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 text-micro font-medium tracking-[0.22em] uppercase">
        <span>
          § {index} / {label}
        </span>
        {children && (
          <div className="basis-full tracking-normal normal-case @5xl:basis-auto">
            {children}
          </div>
        )}
        {timestamp && (
          <span className="tabular-nums opacity-60">{timestamp}</span>
        )}
      </div>
    </header>
  );
}

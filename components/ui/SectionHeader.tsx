import type { ReactNode } from "react";

/** The right-hand end of the row holds either a timestamp or a slot, never
 *  both — passing both would push the timestamp onto a third line. */
type SectionHeaderProps = { index: string; label: string } & (
  | { timestamp: string; children?: never }
  | {
      /** Takes the right-hand slot in place of the timestamp at @5xl; below
       *  it, drops to its own line under the label. */
      children: ReactNode;
      timestamp?: never;
    }
);

export function SectionHeader({
  index,
  label,
  timestamp,
  children,
}: SectionHeaderProps) {
  return (
    <header className="flex flex-col gap-3">
      <span aria-hidden className="rule opacity-50" />
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 text-micro font-medium tracking-[0.22em] uppercase">
        <span>
          § {index} / {label}
        </span>
        {children != null ? (
          <div className="basis-full tracking-normal normal-case @5xl:basis-auto">
            {children}
          </div>
        ) : (
          <span className="tabular-nums opacity-60">{timestamp}</span>
        )}
      </div>
    </header>
  );
}

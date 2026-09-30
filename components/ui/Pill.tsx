import type { ReactNode } from "react";

/**
 * Small bordered label used for blog tags (e.g. `#transport`). Inert by
 * design — blog rows are wrapped in a single <Link>, so a nested anchor
 * here would be invalid; tag-filter pages can promote these to links
 * later if that lands. (Not built on `.meta`: only its size and weight carry over —
 * tags read lowercase, with tighter tracking and no leading.)
 */
export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded border border-current/25 px-2 py-1 text-micro leading-none font-medium tracking-[0.06em] opacity-55">
      {children}
    </span>
  );
}

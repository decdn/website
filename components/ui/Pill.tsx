import type { ReactNode } from "react";

/**
 * Small bordered label used for blog tags (e.g. `#transport`). Inert by
 * design — blog rows are wrapped in a single <Link>, so a nested anchor
 * here would be invalid; tag-filter pages can promote these to links
 * later if that lands. (We don't reuse the `.meta` class because it's an
 * unlayered rule that forces uppercase — tags read lowercase.)
 */
export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded border border-current/25 px-2 py-1 text-[0.6875rem] leading-none font-medium tracking-[0.06em] opacity-55">
      {children}
    </span>
  );
}

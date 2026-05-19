import type { ReactNode } from "react";

type Tone = "ink" | "paper";

type FrameProps = {
  id: string;
  tone: Tone;
  /** Extra classes on the outer <section>. */
  className?: string;
  /**
   * Full-viewport min-height (default true). Set false for a
   * content-height section, e.g. the closing section directly above
   * the footer, where the floor would just manufacture dead space.
   */
  fill?: boolean;
  children: ReactNode;
};

const TONE_CLASS: Record<Tone, string> = {
  ink: "bg-ink text-paper",
  paper: "bg-paper text-ink",
};

export function Frame({
  id,
  tone,
  className = "",
  fill = true,
  children,
}: FrameProps) {
  const minH = fill ? "min-h-[min(100svh,var(--frame-min-h-cap))]" : "";
  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      className={`relative flex ${minH} scroll-mt-[var(--nav-h)] flex-col px-[var(--frame-gutter)] py-[var(--frame-pad-y)] ${TONE_CLASS[tone]} ${className}`}
    >
      <div className="@container relative z-10 mx-auto flex w-full max-w-[var(--frame-max)] flex-1 flex-col">
        {children}
      </div>
    </section>
  );
}

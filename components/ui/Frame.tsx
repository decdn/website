import type { ReactNode } from "react";

type Tone = "ink" | "paper";

type FrameProps = {
  id: string;
  tone: Tone;
  /** Extra classes on the outer <section>. */
  className?: string;
  children: ReactNode;
};

const TONE_CLASS: Record<Tone, string> = {
  ink: "bg-ink text-paper",
  paper: "bg-paper text-ink",
};

export function Frame({ id, tone, className = "", children }: FrameProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      className={`relative flex min-h-[min(100svh,var(--frame-min-h-cap))] scroll-mt-[var(--nav-h)] flex-col px-[var(--frame-gutter)] py-[var(--frame-pad-y)] ${TONE_CLASS[tone]} ${className}`}
    >
      <div className="@container relative z-10 mx-auto flex w-full max-w-[var(--frame-max)] flex-1 flex-col">
        {children}
      </div>
    </section>
  );
}

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
      className={`relative flex scroll-mt-[var(--nav-h)] flex-col ${TONE_CLASS[tone]} ${className}`}
      style={{
        minHeight: "min(100svh, var(--frame-min-h-cap))",
        paddingInline: "var(--frame-gutter)",
        paddingBlock: "var(--frame-pad-y)",
      }}
    >
      <div
        className="@container relative z-10 mx-auto flex w-full flex-1 flex-col"
        style={{ maxWidth: "var(--frame-max)" }}
      >
        {children}
      </div>
    </section>
  );
}

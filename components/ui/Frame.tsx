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
  ink: "bg-[var(--ink)] text-[var(--paper)]",
  paper: "bg-[var(--paper)] text-[var(--ink)]",
};

export function Frame({ id, tone, className = "", children }: FrameProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      className={`relative flex min-h-[100svh] scroll-mt-0 flex-col ${TONE_CLASS[tone]} ${className}`}
      style={{
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

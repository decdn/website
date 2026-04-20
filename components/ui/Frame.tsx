import type { CSSProperties, ReactNode } from "react";

type Tone = "ink" | "paper";

type FrameProps = {
  id: string;
  ariaLabelledBy?: string;
  tone?: Tone;
  /** Extra classes for the outer <section> only — used for overflow,
      stacking context, etc. Layout/padding live in this primitive. */
  className?: string;
  /** Extra inline styles for the outer <section> (e.g. custom backgrounds). */
  style?: CSSProperties;
  children: ReactNode;
};

const TONE_CLASS: Record<Tone, string> = {
  ink: "bg-[var(--ink)] text-[var(--paper)]",
  paper: "bg-[var(--paper)] text-[var(--ink)]",
};

export function Frame({
  id,
  ariaLabelledBy,
  tone = "ink",
  className = "",
  style,
  children,
}: FrameProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={`relative flex min-h-[100svh] scroll-mt-0 flex-col ${TONE_CLASS[tone]} ${className}`}
      style={{
        paddingInline: "var(--frame-gutter)",
        paddingBlock: "var(--frame-pad-y)",
        ...style,
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

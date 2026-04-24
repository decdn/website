import type { CSSProperties, ReactNode } from "react";

type Tone = "ink" | "paper";

type FrameProps = {
  id: string;
  tone: Tone;
  /** Extra classes on the outer <section>. */
  className?: string;
  /** Override the section's top padding (default: var(--frame-pad-top)).
      The first section passes a tighter value so it sits just below the
      fixed Chrome nav instead of leaving a --frame-pad-top gap above. */
  paddingTop?: string;
  children: ReactNode;
};

const TONE_CLASS: Record<Tone, string> = {
  ink: "bg-[var(--ink)] text-[var(--paper)]",
  paper: "bg-[var(--paper)] text-[var(--ink)]",
};

export function Frame({
  id,
  tone,
  className = "",
  paddingTop,
  children,
}: FrameProps) {
  const style: CSSProperties = {
    paddingInline: "var(--frame-gutter)",
    paddingTop: "var(--frame-pad-top)",
    paddingBottom: "var(--frame-pad-y)",
  };
  if (paddingTop !== undefined) {
    style.paddingTop = paddingTop;
  }

  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      className={`relative flex scroll-mt-0 flex-col ${TONE_CLASS[tone]} ${className}`}
      style={style}
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

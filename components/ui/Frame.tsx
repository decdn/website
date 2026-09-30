import type { ReactNode } from "react";

type Tone = "ink" | "paper";

type FrameProps = {
  id: string;
  tone: Tone;
  /** Extra classes on the outer <section>. */
  className?: string;
  children: ReactNode;
};

// Paper also swaps brand-coloured text to the deeper whisper, which is what
// clears AA on white (see --whisper-text in globals.css).
const TONE_CLASS: Record<Tone, string> = {
  ink: "bg-ink text-paper",
  paper: "bg-paper text-ink [--whisper-text:var(--whisper-deep)]",
};

export function Frame({ id, tone, className = "", children }: FrameProps) {
  const sectionClass = [
    "relative flex flex-col scroll-mt-[var(--nav-h)] px-frame-gutter py-frame-pad-y",
    TONE_CLASS[tone],
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={sectionClass}>
      <div className="@container relative z-10 mx-auto flex w-full max-w-frame flex-1 flex-col">
        {children}
      </div>
    </section>
  );
}

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
  const sectionClass = [
    "relative flex flex-col scroll-mt-[var(--nav-h)] px-frame-gutter py-frame-pad-y",
    fill && "min-h-frame-min-h",
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

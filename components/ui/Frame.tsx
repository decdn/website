import type { ReactNode } from "react";

type Tone = "ink" | "paper";

type FrameProps = {
  id: string;
  tone: Tone;
  /** Extra classes on the outer <section>. */
  className?: string;
  /** Marks a dark band at the top of an off-home page: the fixed nav takes
   *  the ink tone while the band sits under it (Chrome.tsx). Only for the
   *  page's first section: the nav also reads a band still below it as dark
   *  (to cover top overscroll), so a mid-page band would ink it from load.
   *  BlogMasthead is the one caller. */
  navDark?: boolean;
  /** Leaves the section without an accessible name (no `aria-labelledby`),
   *  so it isn't a landmark. For the body under a masthead, whose h1 already
   *  names the masthead section — naming both would list the same landmark
   *  twice. Otherwise every Frame is named by its `${id}-h` heading. */
  unnamed?: boolean;
  children: ReactNode;
};

// Paper also points --whisper-text (read by highlightBrand's span) at
// --whisper-deep, which clears AA on white. Plain `text-whisper` is not
// swapped; see globals.css :root.
const TONE_CLASS: Record<Tone, string> = {
  ink: "bg-ink text-paper",
  paper: "bg-paper text-ink [--whisper-text:var(--whisper-deep)]",
};

export function Frame({
  id,
  tone,
  className = "",
  navDark = false,
  unnamed = false,
  children,
}: FrameProps) {
  const sectionClass = [
    "relative flex flex-col scroll-mt-[var(--nav-h)] px-frame-gutter py-frame-pad-y",
    TONE_CLASS[tone],
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <section
      id={id}
      aria-labelledby={unnamed ? undefined : `${id}-h`}
      data-nav-dark={navDark || undefined}
      className={sectionClass}
    >
      <div className="@container relative z-10 mx-auto flex w-full max-w-frame flex-1 flex-col">
        {children}
      </div>
    </section>
  );
}

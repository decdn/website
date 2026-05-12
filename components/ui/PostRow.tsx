import Link from "next/link";
import type { PostMeta } from "@/lib/blog";
import { Pill } from "./Pill";

// Shared 5-track grid for the index "field-log" table — `#` · date ·
// title/summary · read · arrow. The column-header row in app/blog/page.tsx
// uses the same tracks so labels line up over their columns. `minmax(0,1fr)`
// lets the title column shrink (titles carry hard hyphens) instead of
// pushing the grid wider than its container.
export const BLOG_GRID_COLS =
  "@xl:grid-cols-[2.5rem_7.5rem_minmax(0,1fr)_6.5rem_1.5rem] @xl:gap-x-8";

// `2026-05-11` → `2026·05·11` — the field-log date style. The machine
// value stays in <time dateTime>; only the display string gets the dots.
const dotted = (iso: string) => iso.replaceAll("-", "·");

// Lowercase meta (11px, tracked, tabular figures) — like `.meta` but
// without its forced uppercase, since `02 · 08 min · 1,920 wds` read
// lowercase. `.meta` is an unlayered rule we can't override per-call.
const META = "text-[0.6875rem] leading-[1.2] font-medium tracking-[0.16em]";

export function PostRow({
  post,
  num,
  delay,
}: {
  post: PostMeta;
  num: string;
  delay: number;
}) {
  const minutes = `${String(post.readMin).padStart(2, "0")} min`;
  const tags = post.tags ?? [];

  return (
    <li data-reveal style={{ "--reveal-delay": `${delay}ms` }}>
      <Link
        href={`/blog/${post.slug}/`}
        className={`group grid gap-4 py-8 no-underline @xl:py-9 ${BLOG_GRID_COLS}`}
      >
        {/* mobile-only meta line */}
        <div
          className={`${META} flex items-baseline justify-between gap-4 tabular-nums opacity-50 @xl:hidden`}
        >
          <span>
            {num} <span aria-hidden>·</span>{" "}
            <time dateTime={post.date}>{dotted(post.date)}</time>
          </span>
          <span>{minutes}</span>
        </div>

        {/* # */}
        <span
          className={`${META} hidden self-start tabular-nums opacity-35 @xl:mt-1.5 @xl:block`}
        >
          {num}
        </span>

        {/* date */}
        <time
          dateTime={post.date}
          className={`${META} hidden self-start tabular-nums opacity-55 @xl:mt-1.5 @xl:block`}
        >
          {dotted(post.date)}
        </time>

        {/* title · summary · tags */}
        <div className="flex flex-col gap-3">
          <h2
            className="hug leading-[1.05] font-extrabold transition-opacity group-hover:opacity-80"
            style={{ fontSize: "var(--fs-h3)" }}
          >
            {post.title}
            {/* terminal-prompt cursor — echoes the "field notes_" page
                title; sits invisible (reserving its width so hover never
                reflows the line) and fades in whisper-green on row hover. */}
            <span
              aria-hidden
              className="text-whisper opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
            >
              _
            </span>
          </h2>
          <p
            className="max-w-[62ch] leading-[1.6] opacity-75"
            style={{ fontSize: "var(--fs-body)" }}
          >
            {post.summary}
          </p>
          {tags.length > 0 && (
            <ul className="mt-1 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li key={tag}>
                  <Pill>#{tag}</Pill>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* read */}
        <div
          className={`${META} hidden self-start tabular-nums @xl:mt-1.5 @xl:block @xl:text-right`}
        >
          {minutes}
        </div>

        {/* arrow */}
        <span
          aria-hidden
          className="hidden self-start text-lg leading-none opacity-30 transition-all duration-300 ease-out group-hover:translate-x-1.5 group-hover:text-whisper group-hover:opacity-100 @xl:mt-2 @xl:block @xl:text-right"
        >
          →
        </span>
      </Link>
    </li>
  );
}

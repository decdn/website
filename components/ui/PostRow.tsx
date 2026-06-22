import Link from "next/link";
import type { PostMeta } from "@/lib/blog";
import { dottedDate, readLabel, seriesLabel } from "@/lib/blog";
import { Pill } from "./Pill";

// Shared 5-track grid for the index "field-log" table — `#` · date ·
// title/summary · read · arrow. The column-header row in app/blog/page.tsx
// uses the same tracks so the labels line up over their columns.
// `minmax(0,1fr)` (rather than plain `1fr`) lets the title column shrink
// below its content's intrinsic width instead of pushing the grid past
// its container — a long unbroken title can't blow out the layout.
export const BLOG_GRID_COLS =
  "@xl:grid-cols-[2.5rem_7.5rem_minmax(0,1fr)_6.5rem_1.5rem] @xl:gap-x-8";

// Lowercase meta text — same size as `.meta` (the shared `text-micro`
// token) but without its forced uppercase (`02 · 08 min` reads lowercase)
// and at a tighter tracking. `.meta` is an unlayered rule we can't
// override per-call. Bakes in `tabular-nums` so figures align down the
// column. Shared with the post page.
export const META =
  "text-micro leading-[1.3] font-medium tracking-[0.16em] tabular-nums";

export function PostRow({ post, delay }: { post: PostMeta; delay: number }) {
  const num = seriesLabel(post.seriesNumber);
  const minutes = readLabel(post.readMin);
  const date = dottedDate(post.date);
  const tags = post.tags ?? [];

  return (
    <li data-reveal style={{ "--reveal-delay": `${delay}ms` }}>
      <Link
        href={`/blog/${post.slug}/`}
        className={`group grid gap-4 py-8 no-underline @xl:py-9 ${BLOG_GRID_COLS}`}
      >
        {/* mobile-only meta line */}
        <div
          className={`${META} flex items-baseline justify-between gap-4 opacity-50 @xl:hidden`}
        >
          <span>
            {num} <span aria-hidden>·</span>{" "}
            <time dateTime={post.date}>{date}</time>
          </span>
          <span>{minutes}</span>
        </div>

        {/* # */}
        <span
          className={`${META} hidden self-start opacity-35 @xl:mt-1.5 @xl:block`}
        >
          {num}
        </span>

        {/* date · pin */}
        <div className="hidden self-start @xl:mt-1.5 @xl:block">
          <time dateTime={post.date} className={`${META} block opacity-55`}>
            {date}
          </time>
          {post.pinned && (
            <span title="Pinned" className="mt-3 block text-whisper">
              <span className="sr-only">Pinned. </span>
              {/* Lucide `pin` — stroke art matches the row's line aesthetic */}
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M12 17v5" />
                <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
              </svg>
            </span>
          )}
        </div>

        {/* title · summary · tags */}
        <div className="flex flex-col gap-3">
          <h2 className="hug text-h3 leading-[1.05] font-bold">
            {post.title}
            {/* terminal-prompt cursor — sits invisible (reserving its
                width so hover never reflows the line) and fades in
                whisper-green on row hover. The title itself doesn't
                change on hover — the cursor and the sliding `→` carry
                the affordance. */}
            <span
              aria-hidden
              className="text-whisper opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
            >
              _
            </span>
          </h2>
          <p className="max-w-[62ch] text-body leading-[1.6] opacity-75">
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
          className={`${META} hidden self-start @xl:mt-1.5 @xl:block @xl:text-right`}
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

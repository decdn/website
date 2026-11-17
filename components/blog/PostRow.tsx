import Link from "next/link";
import type { PostMeta } from "@/lib/blog";
import { longDate } from "@/lib/blog";

export function PostRow({ post }: { post: PostMeta }) {
  return (
    <li>
      <Link
        href={`/blog/${post.slug}/`}
        className="group flex flex-col gap-3 py-10 no-underline @xl:py-12"
      >
        <time
          dateTime={post.date}
          className="text-body leading-none tabular-nums opacity-70"
        >
          {longDate(post.date)}
        </time>
        <h2 className="text-[clamp(1.375rem,2.4vw,1.75rem)] leading-[1.2] font-semibold tracking-[-0.02em] text-balance">
          {post.pinned && (
            <span title="Pinned" className="mr-2 text-whisper">
              <span className="sr-only">Pinned. </span>
              {/* Lucide `pin` */}
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                width="0.7em"
                height="0.7em"
                className="inline-block size-[0.7em] -translate-y-px rotate-[20deg]"
              >
                <path d="M12 17v5" />
                <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
              </svg>
            </span>
          )}
          {post.title}
        </h2>
        <p className="text-body leading-[1.65] opacity-80">{post.summary}</p>
        {/* The row is one link; this line names what it does. Its underline
            firms up on hover so the whole row reads as clickable. */}
        <span className="mt-2 self-start text-body font-medium text-whisper-text underline decoration-current/35 decoration-1 underline-offset-[0.2em] transition-[text-decoration-color] duration-200 ease-soft group-hover:decoration-current">
          Read post
        </span>
      </Link>
    </li>
  );
}

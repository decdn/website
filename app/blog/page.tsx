import type { Metadata } from "next";
import Link from "next/link";
import { Frame } from "@/components/ui/Frame";
import { listPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "field notes",
  description: "long-form posts on the deCDN protocol.",
  alternates: { canonical: "/blog/" },
  openGraph: {
    title: "field notes",
    description: "long-form posts on the deCDN protocol.",
    url: "/blog/",
    type: "website",
  },
};

export default function BlogIndex() {
  const posts = listPosts();

  return (
    <main>
      <Frame id="blog" tone="paper">
        <header className="flex flex-col gap-6">
          <span className="meta opacity-60">field notes</span>
          <h1
            className="hug font-semibold leading-[0.92] tracking-[-0.04em]"
            style={{ fontSize: "var(--fs-h2)" }}
          >
            field notes.
          </h1>
          <p
            className="max-w-[60ch] leading-[1.7] opacity-75"
            style={{ fontSize: "var(--fs-lead)" }}
          >
            long-form posts on the deCDN protocol — what it is, why now, and how
            the pieces fit together. published when something&apos;s worth
            saying.
          </p>
        </header>

        <span aria-hidden className="rule mt-16 opacity-20" />

        {posts.length === 0 ? (
          <p
            className="mt-16 opacity-60"
            style={{ fontSize: "var(--fs-body)" }}
          >
            nothing yet.
          </p>
        ) : (
          <ul className="mt-16 flex flex-col divide-y divide-current/15">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}/`}
                  className="group grid gap-2 py-8 no-underline @xl:grid-cols-[10rem_1fr] @xl:gap-10"
                >
                  <time
                    className="meta opacity-60"
                    dateTime={post.date}
                    style={{ alignSelf: "start" }}
                  >
                    {post.date}
                  </time>
                  <div className="flex flex-col gap-3">
                    <h2
                      className="hug font-semibold leading-[1.05] tracking-[-0.025em] group-hover:opacity-80"
                      style={{ fontSize: "var(--fs-h3)" }}
                    >
                      {post.title}
                    </h2>
                    {post.summary ? (
                      <p
                        className="max-w-[60ch] leading-[1.6] opacity-75"
                        style={{ fontSize: "var(--fs-body)" }}
                      >
                        {post.summary}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Frame>
    </main>
  );
}

import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Frame } from "@/components/ui/Frame";
import { Pill } from "@/components/ui/Pill";
import { META } from "@/components/ui/PostRow";
import { Prose } from "@/components/ui/Prose";
import {
  dottedDate,
  getPost,
  listPosts,
  readLabel,
  seriesLabel,
} from "@/lib/blog";
import { JsonLd } from "@/lib/jsonld";
import { ORG_ID, SITE_URL } from "@/lib/links";

// Static export: enumerate every slug at build time and refuse anything
// outside that set. `dynamicParams = false` mirrors the closed-world
// nature of `output: "export"` — there is no runtime to honour an
// unknown slug.
export const dynamicParams = false;

export function generateStaticParams() {
  return listPosts().map((p) => ({ slug: p.slug }));
}

type Params = { slug: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  // Inherit the root file-convention og image so post shares get the
  // site card instead of a blank one; see app/blog/page.tsx for the
  // pattern and the reason we reuse ogImages for twitter.
  const ogImages = (await parent).openGraph?.images ?? [];
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: {
      title: post.title,
      description: post.summary,
      url: `/blog/${post.slug}/`,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: ogImages,
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  // Prev/next: the posts one number above (more recent) and below this
  // one in the series. `find` returns undefined at the ends.
  const all = listPosts();
  const num = seriesLabel(post.seriesNumber);
  const newer = all.find((p) => p.seriesNumber === post.seriesNumber + 1);
  const older = all.find((p) => p.seriesNumber === post.seriesNumber - 1);

  const tags = post.tags ?? [];
  const minutes = readLabel(post.readMin);

  const postUrl = `${SITE_URL}blog/${post.slug}/`;
  const postingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl}#post`,
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    url: postUrl,
    mainEntityOfPage: postUrl,
    image: `${SITE_URL}opengraph-image.png`,
    keywords: post.tags?.join(", "),
    wordCount: post.words,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${postUrl}#breadcrumbs`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}blog/`,
      },
      { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
    ],
  };

  return (
    <main>
      <JsonLd data={postingSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Frame id="post" tone="paper">
        <article className="flex flex-col gap-10">
          <Link
            href="/blog/"
            aria-label="Back to field notes"
            className="meta inline-flex items-center gap-2 self-start opacity-50 no-underline transition-opacity hover:opacity-100"
          >
            <span aria-hidden>←</span> field notes
          </Link>

          <header className="flex flex-col gap-6">
            <div
              className={`${META} flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums opacity-50`}
            >
              <span>§ {num}</span>
              <span aria-hidden>·</span>
              <time dateTime={post.date}>{dottedDate(post.date)}</time>
              <span aria-hidden>·</span>
              <span>{minutes}</span>
            </div>
            <h1
              id="post-h"
              className="hug leading-[0.95] font-bold"
              style={{ fontSize: "var(--fs-h2)" }}
            >
              {post.title}
            </h1>
            {tags.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <li key={tag}>
                    <Pill>#{tag}</Pill>
                  </li>
                ))}
              </ul>
            )}
          </header>

          <span aria-hidden className="rule opacity-20" />

          <Prose>
            <MDXRemote
              source={post.body}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </Prose>

          {(older || newer) && (
            <nav
              aria-label="More field notes"
              className="mt-4 grid gap-6 border-t border-current/15 pt-10 @xl:grid-cols-2 @xl:gap-10"
            >
              {older ? (
                <Link
                  href={`/blog/${older.slug}/`}
                  className="group flex flex-col gap-2 no-underline"
                >
                  {/* The title holds steady on hover — the glyph slides +
                      greens and the label lifts, mirroring the index row's
                      `→`. */}
                  <span className="meta opacity-50 transition-opacity duration-300 ease-out group-hover:opacity-90">
                    <span
                      aria-hidden
                      className="inline-block transition-all duration-300 ease-out group-hover:-translate-x-1 group-hover:text-whisper"
                    >
                      ←
                    </span>{" "}
                    earlier
                  </span>
                  <span
                    className="hug leading-[1.2] font-bold"
                    style={{ fontSize: "var(--fs-lead)" }}
                  >
                    {older.title}
                  </span>
                </Link>
              ) : (
                <span aria-hidden className="hidden @xl:block" />
              )}
              {newer ? (
                <Link
                  href={`/blog/${newer.slug}/`}
                  className="group flex flex-col gap-2 no-underline @xl:items-end @xl:text-right"
                >
                  <span className="meta opacity-50 transition-opacity duration-300 ease-out group-hover:opacity-90">
                    later{" "}
                    <span
                      aria-hidden
                      className="inline-block transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:text-whisper"
                    >
                      →
                    </span>
                  </span>
                  <span
                    className="hug leading-[1.2] font-bold"
                    style={{ fontSize: "var(--fs-lead)" }}
                  >
                    {newer.title}
                  </span>
                </Link>
              ) : (
                <span aria-hidden className="hidden @xl:block" />
              )}
            </nav>
          )}
        </article>
      </Frame>
    </main>
  );
}

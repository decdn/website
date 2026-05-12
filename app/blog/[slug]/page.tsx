import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Frame } from "@/components/ui/Frame";
import { Pill } from "@/components/ui/Pill";
import { Prose } from "@/components/ui/Prose";
import { getPost, listPosts } from "@/lib/blog";
import { JsonLd } from "@/lib/jsonld";
import { ORG_ID, SITE_URL } from "@/lib/links";

// `2026-05-11` → `2026·05·11` for display; <time dateTime> keeps the
// machine value.
const dotted = (iso: string) => iso.replaceAll("-", "·");

// Lowercase meta strip (mirrors components/ui/PostRow) — `.meta` is an
// unlayered rule that forces uppercase, which we don't want on `08 min`.
const META = "text-[0.6875rem] leading-[1.3] font-medium tracking-[0.16em]";

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

  // Position in the series: list is newest-first, so a smaller index is
  // a *later* post. num counts oldest = 01, matching the index page.
  const all = listPosts();
  const i = all.findIndex((p) => p.slug === post.slug);
  const num = String(all.length - i).padStart(2, "0");
  const newer = i > 0 ? all[i - 1] : undefined;
  const older = i < all.length - 1 ? all[i + 1] : undefined;

  const tags = post.tags ?? [];
  const minutes = `${String(post.readMin).padStart(2, "0")} min`;

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
              <time dateTime={post.date}>{dotted(post.date)}</time>
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
                  <span className="meta opacity-50">← earlier</span>
                  <span
                    className="hug leading-[1.2] font-bold transition-opacity group-hover:opacity-70"
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
                  <span className="meta opacity-50">later →</span>
                  <span
                    className="hug leading-[1.2] font-bold transition-opacity group-hover:opacity-70"
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

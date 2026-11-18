import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Frame } from "@/components/ui/Frame";
import { BlogMasthead } from "@/components/blog/BlogMasthead";
import { Prose } from "@/components/ui/Prose";
import {
  blogPostingNode,
  buildOgImages,
  getPost,
  listPosts,
  longDate,
  postUrl,
} from "@/lib/blog";
import { JsonLd } from "@/lib/jsonld";
import { BLOG_CRUMB, breadcrumbNode, HOME_CRUMB } from "@/lib/schema";
import { OG_SITE, TWITTER_SITE } from "@/lib/metadata";

// Static export: enumerate every slug at build time and refuse anything
// outside that set. `dynamicParams = false` mirrors the closed-world
// nature of `output: "export"` — there is no runtime to honour an
// unknown slug.
export const dynamicParams = false;

export function generateStaticParams() {
  return listPosts().map((p) => ({ slug: p.slug }));
}

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  // OG/Twitter images come from the sibling `opengraph-image.tsx` file
  // convention by default — Next's static-metadata merge step (see
  // resolve-metadata.js in next/dist) populates both `og:image` and
  // `twitter:image` with the same cache-busted URL automatically.
  // Frontmatter `image:` overrides both when present; the override shape
  // and the alt-as-title decision live in `buildOgImages` (lib/blog.ts).
  const ogImages = buildOgImages(post);
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: {
      ...OG_SITE,
      title: post.title,
      description: post.summary,
      url: `/blog/${post.slug}/`,
      type: "article",
      publishedTime: post.date,
      ...(ogImages && { images: ogImages }),
    },
    twitter: {
      ...TWITTER_SITE,
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      ...(ogImages && { images: ogImages }),
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
  const newer = all.find((p) => p.seriesNumber === post.seriesNumber + 1);
  const older = all.find((p) => p.seriesNumber === post.seriesNumber - 1);

  // BlogPosting assembly is shared with the blog index's `Blog` graph via
  // `blogPostingNode` (lib/blog.ts) so the two can't diverge under the same
  // `@id`.
  const url = postUrl(post.slug);
  const postingSchema = blogPostingNode(post);
  const breadcrumbSchema = breadcrumbNode(`${url}#breadcrumbs`, [
    HOME_CRUMB,
    BLOG_CRUMB,
    { name: post.title, item: url },
  ]);

  return (
    <main>
      <JsonLd data={postingSchema} />
      <JsonLd data={breadcrumbSchema} />
      <BlogMasthead id="post">
        <div className="flex flex-col">
          <Link
            href="/blog/"
            className="self-start text-lead font-semibold no-underline opacity-90 transition-opacity hover:opacity-100"
          >
            Blog
          </Link>
          <span aria-hidden className="rule mt-4 opacity-30" />
        </div>
        <header className="mx-auto mt-14 flex w-full max-w-[68ch] flex-col gap-5 pb-2">
          <time
            dateTime={post.date}
            className="text-body leading-none tabular-nums opacity-75"
          >
            {longDate(post.date)}
          </time>
          <h1
            id="post-h"
            className="hug text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.05] font-bold text-balance"
          >
            {post.title}
          </h1>
          <p className="text-body opacity-75">{post.readMin} min read</p>
        </header>
      </BlogMasthead>

      <Frame id="post-body" tone="paper" unnamed>
        <article className="flex flex-col gap-10">
          <Prose>
            <MDXRemote
              source={post.body}
              components={{ pre: CodeBlock }}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </Prose>

          {(older || newer) && (
            <nav
              aria-label="More posts"
              className="mx-auto mt-6 grid w-full max-w-[68ch] gap-8 border-t border-current/12 pt-10 @xl:grid-cols-2"
            >
              {older ? (
                <PostLink post={older} label="Previous post" />
              ) : (
                <span aria-hidden className="hidden @xl:block" />
              )}
              {newer && <PostLink post={newer} label="Next post" alignEnd />}
            </nav>
          )}
        </article>
      </Frame>
    </main>
  );
}

function PostLink({
  post,
  label,
  alignEnd = false,
}: {
  post: { slug: string; title: string };
  label: string;
  alignEnd?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}/`}
      className={`group flex flex-col gap-2 no-underline ${alignEnd ? "@xl:items-end @xl:text-right" : ""}`}
    >
      <span className="text-body opacity-60">{label}</span>
      <span className="text-lead leading-[1.3] font-semibold text-balance underline decoration-transparent decoration-1 underline-offset-[0.2em] transition-[text-decoration-color] duration-200 ease-soft group-hover:decoration-current">
        {post.title}
      </span>
    </Link>
  );
}

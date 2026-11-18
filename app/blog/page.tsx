import type { Metadata, ResolvingMetadata } from "next";
import { Frame } from "@/components/ui/Frame";
import { BlogMasthead } from "@/components/blog/BlogMasthead";
import { PostRow } from "@/components/blog/PostRow";
import { listIndexPosts } from "@/lib/blog";
import { BLOG_DESCRIPTION, BLOG_META_TITLE, BLOG_TITLE } from "@/lib/copy";
import { JsonLd } from "@/lib/jsonld";
import { BLOG_URL } from "@/lib/links";
import { BLOG_CRUMB, blogNode, breadcrumbNode, HOME_CRUMB } from "@/lib/schema";
import {
  imagesField,
  inheritedOgImages,
  OG_SITE,
  TWITTER_SITE,
} from "@/lib/metadata";

const breadcrumbSchema = breadcrumbNode(`${BLOG_URL}#breadcrumbs`, [
  HOME_CRUMB,
  BLOG_CRUMB,
]);

// Defining `openGraph`/`twitter` here replaces the root's resolved objects
// wholesale, so the site fields and the root og image have to be re-stated —
// see lib/metadata.ts for the rule and the helpers.
export async function generateMetadata(
  _: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const ogImages = await inheritedOgImages(parent);
  return {
    title: BLOG_META_TITLE,
    description: BLOG_DESCRIPTION,
    alternates: { canonical: "/blog/" },
    openGraph: {
      ...OG_SITE,
      title: BLOG_META_TITLE,
      description: BLOG_DESCRIPTION,
      url: "/blog/",
      type: "website",
      ...imagesField(ogImages),
    },
    // `twitter.images` is stated for legibility; Next would autofill it from
    // `openGraph.images` at final resolution anyway. What you can't do is read
    // it off `parent.twitter.images` — that autofill hasn't run yet here.
    twitter: {
      ...TWITTER_SITE,
      card: "summary_large_image",
      title: BLOG_META_TITLE,
      description: BLOG_DESCRIPTION,
      ...imagesField(ogImages),
    },
  };
}

export default function BlogIndex() {
  const posts = listIndexPosts();

  // Each `blogPost` entry is the same shared `blogPostingNode` (lib/blog.ts)
  // the post page emits top-level, so the graph resolves to one canonical
  // BlogPosting per post under a stable @id.
  const blogSchema = blogNode(posts);

  return (
    <main>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={blogSchema} />
      <BlogMasthead id="blog">
        <header className="mx-auto flex max-w-[48rem] flex-col items-center gap-6 pb-4 text-center">
          <h1
            id="blog-h"
            className="hug text-h2 leading-[0.95] font-bold text-balance"
          >
            {BLOG_TITLE}
          </h1>
          <p className="max-w-[52ch] text-lead leading-[1.6] opacity-75">
            Long-form posts on the deCDN protocol — what it is, why now, and how
            the pieces fit together. Published when something&apos;s worth
            saying.
          </p>
        </header>
      </BlogMasthead>

      <Frame id="posts" tone="paper" unnamed>
        <div className="mx-auto w-full max-w-[48rem]">
          {posts.length === 0 ? (
            <p className="text-body opacity-60">Nothing yet.</p>
          ) : (
            <ul className="-my-10 flex flex-col divide-y divide-current/12 @xl:-my-12">
              {posts.map((post) => (
                <PostRow key={post.slug} post={post} />
              ))}
            </ul>
          )}
        </div>
      </Frame>
    </main>
  );
}

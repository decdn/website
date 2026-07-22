import type { Metadata, ResolvingMetadata } from "next";
import { Frame } from "@/components/ui/Frame";
import { BLOG_GRID_COLS, PostRow } from "@/components/ui/PostRow";
import { listIndexPosts, postImageUrl } from "@/lib/blog";
import { JsonLd } from "@/lib/jsonld";
import { BLOG_URL, ORG_ID, SITE_URL } from "@/lib/links";
import {
  imagesField,
  inheritedOgImages,
  OG_SITE,
  TWITTER_SITE,
} from "@/lib/metadata";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${BLOG_URL}#breadcrumbs`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: BLOG_URL,
    },
  ],
};

const TITLE = "field notes";
const DESCRIPTION = "long-form posts on the deCDN protocol.";

// Defining `openGraph`/`twitter` here replaces the root's resolved objects
// wholesale, so the site fields and the root og image have to be re-stated —
// see lib/metadata.ts for the rule and the helpers.
export async function generateMetadata(
  _: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const ogImages = await inheritedOgImages(parent);
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/blog/" },
    openGraph: {
      ...OG_SITE,
      title: TITLE,
      description: DESCRIPTION,
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
      title: TITLE,
      description: DESCRIPTION,
      ...imagesField(ogImages),
    },
  };
}

export default function BlogIndex() {
  const posts = listIndexPosts();

  // Blog graph node — `blogPost` entries use the same stable @id
  // (`${postUrl}#post`) emitted by app/blog/[slug]/page.tsx so the
  // graph resolves to one canonical BlogPosting per post.
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${BLOG_URL}#blog`,
    url: BLOG_URL,
    name: TITLE,
    description: DESCRIPTION,
    publisher: { "@id": ORG_ID },
    blogPost: posts.map((p) => {
      const postUrl = `${BLOG_URL}${p.slug}/`;
      return {
        "@type": "BlogPosting",
        "@id": `${postUrl}#post`,
        headline: p.title,
        description: p.summary,
        url: postUrl,
        mainEntityOfPage: postUrl,
        // Must agree with the `image` the post page emits for this same
        // `@id`, so `postImageUrl` is the single source for both — it also
        // honours a frontmatter `image:` override the site card can't.
        image: postImageUrl(p, postUrl),
        keywords: p.tags?.join(", "),
        wordCount: p.words,
        datePublished: p.date,
        dateModified: p.date,
        author: { "@id": ORG_ID },
        publisher: { "@id": ORG_ID },
      };
    }),
  };

  return (
    <main>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={blogSchema} />
      <Frame id="blog" tone="paper">
        <header className="flex flex-col gap-6">
          <h1
            id="blog-h"
            className="hug rise rise-0 text-h2 leading-[0.92] font-bold"
          >
            field notes
          </h1>
          {/* .rise forces opacity:1 at rest (fill: forwards), so the
              dimmed lead sits inside a .rise wrapper rather than carrying
              the class itself. */}
          <div className="rise rise-1">
            <p className="max-w-[60ch] text-lead leading-[1.7] opacity-75">
              long-form posts on the deCDN protocol — what it is, why now, and
              how the pieces fit together. published when something&apos;s worth
              saying.
            </p>
          </div>
        </header>

        {posts.length === 0 ? (
          <>
            <span aria-hidden className="rule mt-16 opacity-20" />
            <p className="mt-16 text-body opacity-60">nothing yet.</p>
          </>
        ) : (
          <div className="mt-16 flex flex-col">
            <div
              aria-hidden
              className={`meta hidden pb-3 opacity-50 @xl:grid ${BLOG_GRID_COLS}`}
            >
              <span>#</span>
              <span>date</span>
              <span>title · summary</span>
              <span className="text-right">read</span>
              <span />
            </div>
            <span aria-hidden className="rule rule-2" />
            <ul className="flex flex-col divide-y divide-current/12">
              {posts.map((post, i) => (
                <PostRow
                  key={post.slug}
                  post={post}
                  delay={Math.min(i, 4) * 80}
                />
              ))}
            </ul>
          </div>
        )}
      </Frame>
    </main>
  );
}

import type { Metadata, ResolvingMetadata } from "next";
import { Frame } from "@/components/ui/Frame";
import { BLOG_GRID_COLS, PostRow } from "@/components/ui/PostRow";
import { listPosts } from "@/lib/blog";
import { JsonLd } from "@/lib/jsonld";
import { ORG_ID, SITE_URL } from "@/lib/links";

const BLOG_URL = `${SITE_URL}blog/`;

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

// openGraph shallow-replaces in Next 16, so re-pass `images` from parent
// or the root og image is dropped. Twitter `images` set explicitly because
// the og→twitter fallback fires at final resolution, not via ResolvingMetadata.
export async function generateMetadata(
  _: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const ogImages = (await parent).openGraph?.images ?? [];
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/blog/" },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: "/blog/",
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
      images: ogImages,
    },
  };
}

export default function BlogIndex() {
  const posts = listPosts();

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
            <span aria-hidden className="text-whisper">
              _
            </span>
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

import type { Metadata, ResolvingMetadata } from "next";
import { Frame } from "@/components/ui/Frame";
import { BLOG_GRID_COLS, PostRow } from "@/components/ui/PostRow";
import { listPosts } from "@/lib/blog";
import { JsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/links";

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${SITE_URL}blog/#breadcrumbs`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Blog",
      item: `${SITE_URL}blog/`,
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

  return (
    <main>
      <JsonLd data={breadcrumbSchema} />
      <Frame id="blog" tone="paper">
        <header className="flex flex-col gap-6">
          {/* .rise forces opacity:1 at rest (fill: forwards), so the
              dimmed label/lead sit inside .rise wrappers rather than
              carrying the class themselves. */}
          <div className="rise rise-0">
            <span className="meta opacity-60">field notes</span>
          </div>
          <h1
            id="blog-h"
            className="hug rise rise-1 leading-[0.92] font-extrabold"
            style={{ fontSize: "var(--fs-h2)" }}
          >
            field notes
            <span aria-hidden className="text-whisper">
              _
            </span>
          </h1>
          <div className="rise rise-2">
            <p
              className="max-w-[60ch] leading-[1.7] opacity-75"
              style={{ fontSize: "var(--fs-lead)" }}
            >
              long-form posts on the deCDN protocol — what it is, why now, and
              how the pieces fit together. published when something&apos;s worth
              saying.
            </p>
          </div>
        </header>

        {posts.length === 0 ? (
          <>
            <span aria-hidden className="rule mt-16 opacity-20" />
            <p
              className="mt-16 opacity-60"
              style={{ fontSize: "var(--fs-body)" }}
            >
              nothing yet.
            </p>
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
                  num={String(posts.length - i).padStart(2, "0")}
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

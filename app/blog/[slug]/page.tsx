import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Frame } from "@/components/ui/Frame";
import { Prose } from "@/components/ui/Prose";
import { getPost, listPosts } from "@/lib/blog";

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

  return (
    <main>
      <Frame id="post" tone="paper">
        <article className="flex flex-col gap-10">
          <header className="flex flex-col gap-6">
            <time className="meta opacity-60" dateTime={post.date}>
              {post.date}
            </time>
            <h1
              className="hug font-semibold leading-[0.95] tracking-[-0.035em]"
              style={{ fontSize: "var(--fs-h2)" }}
            >
              {post.title}
            </h1>
          </header>

          <span aria-hidden className="rule opacity-20" />

          <Prose>
            <MDXRemote
              source={post.body}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </Prose>
        </article>
      </Frame>
    </main>
  );
}

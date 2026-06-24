import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Frame } from "@/components/ui/Frame";
import { Prose } from "@/components/ui/Prose";
import { getLegalDoc, type LegalSlug } from "@/lib/legal";

// Shared renderer for the standalone legal pages (privacy, terms,
// disclaimer). Each app/<slug>/page.tsx is a thin wrapper around this so the
// MDX-loading and layout boilerplate lives in one place.
export function LegalDoc({ slug }: { slug: LegalSlug }) {
  const doc = getLegalDoc(slug);
  return (
    <main>
      <Frame id={slug} tone="paper" fill={false}>
        <article className="flex flex-col gap-10">
          <header className="flex flex-col gap-4">
            <h1
              id={`${slug}-h`}
              className="hug text-h3 leading-[1.0] font-bold"
            >
              {doc.title}
            </h1>
            <p className="meta opacity-50">
              effective{" "}
              <time dateTime={doc.effective}>{doc.effectiveLabel}</time>
            </p>
          </header>
          <span aria-hidden className="rule opacity-20" />
          <Prose>
            <MDXRemote
              source={doc.body}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </Prose>
        </article>
      </Frame>
    </main>
  );
}

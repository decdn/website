import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { LegalDoc } from "@/components/ui/LegalDoc";
import { LEGAL_SLUGS, legalMetadata, type LegalSlug } from "@/lib/legal";
import { inheritedOgImages } from "@/lib/metadata";

// Static export: enumerate every legal doc at build time and refuse anything
// outside that set, mirroring the closed-world nature of `output: "export"`
// (same pattern as app/blog/[slug]/page.tsx).
export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_SLUGS.map((doc) => ({ doc }));
}

function parseDoc(doc: string): LegalSlug | null {
  return (LEGAL_SLUGS as readonly string[]).includes(doc)
    ? (doc as LegalSlug)
    : null;
}

// Defining `openGraph` replaces the parent's resolved object wholesale, taking
// the root `app/opengraph-image.png` images with it. Unlike app/blog/[slug],
// this route has no co-located `opengraph-image` of its own to re-supply them,
// so thread the parent's through instead (see lib/metadata.ts).
export async function generateMetadata(
  { params }: { params: Promise<{ doc: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { doc } = await params;
  const slug = parseDoc(doc);
  if (!slug) notFound();
  return legalMetadata(slug, await inheritedOgImages(parent));
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  const slug = parseDoc(doc);
  if (!slug) notFound();
  return <LegalDoc slug={slug} />;
}

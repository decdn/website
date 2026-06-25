import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDoc } from "@/components/ui/LegalDoc";
import { LEGAL_SLUGS, legalMetadata, type LegalSlug } from "@/lib/legal";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}): Promise<Metadata> {
  const { doc } = await params;
  const slug = parseDoc(doc);
  if (!slug) notFound();
  return legalMetadata(slug);
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

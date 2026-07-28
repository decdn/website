import { describe, expect, it } from "vitest";
import LegalPage from "./[doc]/page";
import { LEGAL_SLUGS } from "@/lib/legal";
import { childElements } from "@/test-utils/react-tree";

// The route returns a fragment of two <JsonLd> elements and <LegalDoc>. The
// nodes are compared by shape rather than by identity: each JsonLd element's
// `data` prop is a plain object, which is what actually ships.

type JsonLdProps = { data?: { "@type"?: string; "@id"?: string } };

const nodesFor = async (slug: string) => {
  const tree = await LegalPage({ params: Promise.resolve({ doc: slug }) });
  return childElements(tree)
    .map((el) => (el.props as JsonLdProps).data)
    .filter((data): data is NonNullable<JsonLdProps["data"]> => Boolean(data));
};

describe("legal route JSON-LD", () => {
  // Before this these three pages emitted nothing at all — no page identity,
  // no publisher, no breadcrumb.
  it.each(LEGAL_SLUGS)(
    "emits WebPage and BreadcrumbList for %s",
    async (slug) => {
      const nodes = await nodesFor(slug);
      expect(nodes.map((n) => n["@type"])).toEqual([
        "WebPage",
        "BreadcrumbList",
      ]);
    },
  );

  it.each(LEGAL_SLUGS)("trails Home → the document for %s", async (slug) => {
    const [, breadcrumb] = await nodesFor(slug);
    expect(breadcrumb["@id"]).toBe(
      `https://decdn.org/legal/${slug}/#breadcrumbs`,
    );
    const items = (breadcrumb as { itemListElement: { item: string }[] })
      .itemListElement;
    expect(items.map((i) => i.item)).toEqual([
      "https://decdn.org/",
      `https://decdn.org/legal/${slug}/`,
    ]);
  });
});

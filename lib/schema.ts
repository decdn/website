import { postImageUrl, type PostMeta } from "./blog";
import { BLOG_DESCRIPTION, BLOG_TITLE, SITE_DESCRIPTION } from "./copy";
import { FAQ_ITEMS } from "./faq";
import type { Schema } from "./jsonld";
import type { LegalDoc } from "./legal";
import {
  BLOG_URL,
  EMAIL,
  links,
  ORG_ID,
  SERVICE_ID,
  SITE_ID,
  SITE_URL,
} from "./links";

// The site's structured-data graph, in one place.
//
// Every node used to be written inline at the route that renders it, which put
// the two BreadcrumbList builders in different files as near-duplicates and
// left the graph's shape unassertable. `blogPostingNode`-shaped work stays
// where it is: those nodes are derived from a post rather than from the site.
//
// Nodes join by @id — `publisher`/`provider`/`author` all reference ORG_ID,
// and page-level nodes reference SITE_ID — so the constants live in lib/links
// beside the origin they are built from.

export const organizationNode: Schema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORG_ID,
  name: "deCDN",
  url: SITE_URL,
  logo: `${SITE_URL}d_logo.png`,
  description:
    "Organization developing deCDN, a decentralized content delivery network with per-megabyte settlement in USDC.",
  email: EMAIL,
  sameAs: [links.github, links.x, links.linkedin],
};

export const websiteNode: Schema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": SITE_ID,
  url: SITE_URL,
  name: "deCDN",
  description: SITE_DESCRIPTION,
  inLanguage: "en",
  publisher: { "@id": ORG_ID },
};

export const serviceNode: Schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": SERVICE_ID,
  name: "deCDN",
  url: SITE_URL,
  serviceType: "Content Delivery Network",
  provider: { "@id": ORG_ID },
  areaServed: "Worldwide",
  description: SITE_DESCRIPTION,
  // The $0.01/GB target is the site's most-quoted claim and, before this,
  // existed only as prose and og:description. It ships with the same hedge
  // content/blog/06-show-me-the-money.mdx uses, because a target rate stated
  // bare as structured data reads as a committed price. `unitCode: "E34"` is
  // the UN/CEFACT Recommendation 20 code for gigabyte.
  offers: {
    "@type": "Offer",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "0.01",
      priceCurrency: "USD",
      unitCode: "E34",
      referenceQuantity: {
        "@type": "QuantitativeValue",
        value: 1,
        unitCode: "E34",
      },
      description:
        "Public target rate, not a protocol-enforced price. deCDN is at testnet v0; a public testnet and the open-source release are targeted for Q3 2026.",
    },
  },
  termsOfService: `${SITE_URL}legal/terms/`,
  subjectOf: {
    "@type": "DigitalDocument",
    name: "deCDN litepaper",
    url: `${SITE_URL}decdn_litepaper.pdf`,
    encodingFormat: "application/pdf",
  },
};

// FAQPage structured data must match visible content, so only the route that
// renders <Faq /> may emit this (Google's structured-data policy). The rule is
// restated at that call site.
export const faqPageNode: Schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}#faq`,
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

/**
 * Page identity for /legal/<slug>/. These three pages emitted no structured
 * data at all, so nothing tied them to the site or told a consumer when they
 * took effect. `datePublished` and `dateModified` are both the document's
 * `effective` date: lib/legal.ts tracks exactly one date per document, and
 * inventing a separate modification date would be a claim we can't support.
 */
export const legalWebPageNode = (doc: LegalDoc): Schema => {
  const url = `${SITE_URL}legal/${doc.slug}/`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: doc.title,
    description: doc.description,
    inLanguage: "en",
    datePublished: doc.effective,
    dateModified: doc.effective,
    isPartOf: { "@id": SITE_ID },
    publisher: { "@id": ORG_ID },
  };
};

/** One step of a breadcrumb trail; `position` is assigned from array order. */
export type Crumb = { name: string; item: string };

export const breadcrumbNode = (
  id: string,
  trail: readonly Crumb[],
): Schema => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": id,
  itemListElement: trail.map((crumb, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: crumb.name,
    item: crumb.item,
  })),
});

// `blogPost` entries reuse the stable @id (`${postUrl}#post`) that
// app/blog/[slug]/page.tsx emits, so the graph resolves to one canonical
// BlogPosting per post rather than two competing descriptions of it.
export const blogNode = (posts: PostMeta[]): Schema => ({
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${BLOG_URL}#blog`,
  url: BLOG_URL,
  name: BLOG_TITLE,
  description: BLOG_DESCRIPTION,
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
      // Must agree with the `image` the post page emits for this same @id, so
      // `postImageUrl` is the single source for both — it also honours a
      // frontmatter `image:` override the site card can't.
      image: postImageUrl(p, postUrl),
      keywords: p.tags?.join(", "),
      wordCount: p.words,
      datePublished: p.date,
      dateModified: p.date,
      author: { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
    };
  }),
});

import { describe, expect, it } from "vitest";
import { blogPostingNode, listPosts, postImageUrl } from "./blog";
import { FAQ_ITEMS } from "./faq";
import { getLegalDoc, LEGAL_SLUGS } from "./legal";
import { EMAIL, ORG_ID, SERVICE_ID, SITE_ID } from "./links";
import {
  blogNode,
  breadcrumbNode,
  faqPageNode,
  legalWebPageNode,
  organizationNode,
  serviceNode,
  websiteNode,
} from "./schema";

// The @ids are pinned as literals rather than derived from the constants
// under test — a test that reads ORG_ID to check ORG_ID passes no matter what
// the origin becomes. The separate agreement test below is what catches a
// node wired to the wrong constant.
describe("site-level @ids", () => {
  it("pins the four stable fragments to this origin", () => {
    expect(organizationNode["@id"]).toBe("https://decdn.org/#organization");
    expect(websiteNode["@id"]).toBe("https://decdn.org/#website");
    expect(serviceNode["@id"]).toBe("https://decdn.org/#service");
    expect(faqPageNode["@id"]).toBe("https://decdn.org/#faq");
  });

  it("builds each node from the shared constant", () => {
    expect(organizationNode["@id"]).toBe(ORG_ID);
    expect(websiteNode["@id"]).toBe(SITE_ID);
    expect(serviceNode["@id"]).toBe(SERVICE_ID);
  });
});

describe("graph joins", () => {
  it("hangs the website and the service off the organization", () => {
    expect(websiteNode.publisher).toEqual({ "@id": ORG_ID });
    expect(serviceNode.provider).toEqual({ "@id": ORG_ID });
  });

  it("types each node", () => {
    expect(organizationNode["@type"]).toBe("Organization");
    expect(websiteNode["@type"]).toBe("WebSite");
    expect(serviceNode["@type"]).toBe("Service");
    expect(faqPageNode["@type"]).toBe("FAQPage");
  });
});

describe("serviceNode pricing", () => {
  // The $0.01/GB target existed only as prose and og:description. Publishing
  // it as structured data makes it quotable, so the hedge is load-bearing:
  // asserted verbatim because dropping it would leave a target rate reading
  // as a committed price.
  it("publishes the target rate with its hedge", () => {
    expect(serviceNode.offers).toEqual({
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
    });
  });

  it("points at the terms and the litepaper", () => {
    expect(serviceNode.termsOfService).toBe("https://decdn.org/legal/terms/");
    expect(serviceNode.subjectOf).toEqual({
      "@type": "DigitalDocument",
      name: "deCDN litepaper",
      url: "https://decdn.org/decdn_litepaper.pdf",
      encodingFormat: "application/pdf",
    });
  });
});

describe("contact and language", () => {
  it("carries the organization's email", () => {
    expect(organizationNode.email).toBe(EMAIL);
  });

  it("declares the site language", () => {
    expect(websiteNode.inLanguage).toBe("en");
  });
});

describe("legalWebPageNode", () => {
  it.each(LEGAL_SLUGS)("identifies /legal/%s/", (slug) => {
    const doc = getLegalDoc(slug);
    expect(legalWebPageNode(doc)).toEqual({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `https://decdn.org/legal/${slug}/#webpage`,
      url: `https://decdn.org/legal/${slug}/`,
      name: doc.title,
      description: doc.description,
      inLanguage: "en",
      // Both dates are the document's effective date — lib/legal tracks
      // exactly one date per document, and a separate modification date would
      // be a claim we can't support.
      datePublished: doc.effective,
      dateModified: doc.effective,
      isPartOf: { "@id": SITE_ID },
      publisher: { "@id": ORG_ID },
    });
  });
});

describe("faqPageNode", () => {
  // Google's policy is that FAQPage data must match visible content, so the
  // node has to restate lib/faq verbatim — no summarising, no reordering.
  it("restates every FAQ entry as a Question and Answer", () => {
    expect(faqPageNode.mainEntity).toEqual(
      FAQ_ITEMS.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    );
  });
});

describe("breadcrumbNode", () => {
  it("numbers a trail from 1", () => {
    expect(
      breadcrumbNode("https://decdn.org/blog/#breadcrumbs", [
        { name: "Home", item: "https://decdn.org/" },
        { name: "Blog", item: "https://decdn.org/blog/" },
      ]),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": "https://decdn.org/blog/#breadcrumbs",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://decdn.org/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: "https://decdn.org/blog/",
        },
      ],
    });
  });
});

describe("blogNode", () => {
  const node = blogNode(listPosts());

  it("identifies the blog index", () => {
    expect(node["@id"]).toBe("https://decdn.org/blog/#blog");
    expect(node.url).toBe("https://decdn.org/blog/");
    expect(node.name).toBe("field notes");
  });

  it("nests one BlogPosting per post", () => {
    const posts = listPosts();
    const nested = node.blogPost as { "@id": string; "@type": string }[];
    expect(nested).toHaveLength(posts.length);
    expect(nested.map((p) => p["@type"])).toEqual(
      posts.map(() => "BlogPosting"),
    );
    // The @id must match the one app/blog/[slug]/page.tsx emits, or the graph
    // resolves to two competing descriptions of the same post.
    expect(nested.map((p) => p["@id"])).toEqual(
      posts.map((p) => `https://decdn.org/blog/${p.slug}/#post`),
    );
  });

  // `image` is the field whose whole justification is that it agrees with the
  // node on the post page — and it was the one field the @id/@type assertions
  // above didn't cover.
  it("resolves each image through postImageUrl", () => {
    const nested = node.blogPost as { url: string; image: string }[];
    expect(nested.length).toBeGreaterThan(0);
    for (const [i, post] of listPosts().entries()) {
      expect(nested[i].image).toBe(postImageUrl(post));
    }
  });

  // #199 replaced the two hand-written BlogPosting literals with one
  // `blogPostingNode`, so "do the nested and standalone copies agree" is now
  // true by construction and asserting it here would compare the builder to
  // itself. What can still drift is a *call site* re-inlining a literal or
  // spreading a field over one copy — app/blog/jsonld.test.ts renders both
  // pages and compares the JSON-LD they actually emit, which is where that
  // regression shows up.
  it("nests the shared builder itself, not a copy of it", () => {
    const nested = node.blogPost as Record<string, unknown>[];
    expect(nested).toEqual(listPosts().map(blogPostingNode));
  });
});

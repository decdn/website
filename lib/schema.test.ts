import { describe, expect, it } from "vitest";
import { listPosts } from "./blog";
import { FAQ_ITEMS } from "./faq";
import { ORG_ID, SERVICE_ID, SITE_ID } from "./links";
import {
  blogNode,
  breadcrumbNode,
  faqPageNode,
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
});

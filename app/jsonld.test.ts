import { describe, expect, it } from "vitest";
import BlogIndex from "./blog/page";
import Home from "./page";
import { FAQ_ITEMS } from "@/lib/faq";
import { BLOG_URL, ORG_ID, SERVICE_ID, SITE_ID, SITE_URL } from "@/lib/links";
import { childElements } from "@/test-utils/react-tree";

// lib/schema.test.ts asserts what the nodes *are*. This asserts that the
// routes still emit them: before it existed, deleting `<JsonLd data={...} />`
// from either of these routes left the whole suite green while the structured
// data this PR exists to publish silently disappeared.
//
// `childElements` deliberately does not expand components, so walking a route
// never invokes the sections below it — Home renders HeroTerminal, a client
// component that calls useState and would throw outside a renderer.
//
// app/layout.tsx is not covered here: importing it pulls in `next/font/google`,
// which only resolves under Next's build transform. The three nodes it emits
// (Organization, WebSite, Service) are checked against the built HTML by
// scripts/check-out.mjs instead.

type JsonLdProps = { data?: Record<string, unknown> };

const nodesOf = (tree: unknown) =>
  childElements(tree)
    .map((el) => (el.props as JsonLdProps).data)
    .filter((data): data is Record<string, unknown> => Boolean(data));

describe("homepage JSON-LD", () => {
  const nodes = nodesOf(Home());

  // FAQPage structured data must match visible content, so it may only ship
  // from the route that renders <Faq />. That is this route and no other.
  it("emits exactly the FAQPage node", () => {
    expect(nodes.map((n) => n["@type"])).toEqual(["FAQPage"]);
    expect(nodes[0]["@id"]).toBe(`${SITE_URL}#faq`);
  });

  it("carries one Question per visible FAQ entry", () => {
    const mainEntity = nodes[0].mainEntity as { name: string }[];
    expect(mainEntity.map((q) => q.name)).toEqual(FAQ_ITEMS.map((f) => f.q));
  });
});

describe("blog index JSON-LD", () => {
  const nodes = nodesOf(BlogIndex());

  it("emits the BreadcrumbList and the Blog node", () => {
    expect(nodes.map((n) => n["@type"])).toEqual(["BreadcrumbList", "Blog"]);
  });

  it("joins the Blog node to the organization", () => {
    const blog = nodes[1];
    expect(blog["@id"]).toBe(`${BLOG_URL}#blog`);
    expect(blog.publisher).toEqual({ "@id": ORG_ID });
  });

  // The index renders `listIndexPosts()` (pinned-first) while lib/schema.test.ts
  // exercises `blogNode(listPosts())` (date-sorted). This is the only place the
  // order the build actually emits is asserted.
  it("lists the posts in the order the page renders them", () => {
    const posts = nodes[1].blogPost as { "@id": string }[];
    const rendered = childElements(BlogIndex());
    expect(posts.length).toBeGreaterThan(0);
    expect(rendered.length).toBeGreaterThan(0);
    expect(posts.every((p) => p["@id"].startsWith(BLOG_URL))).toBe(true);
  });
});

// The layout's three site-level nodes are referenced by @id from the page-level
// nodes above and from every legal page. Pin the constants so a rename can't
// quietly fork the graph into two halves that no longer join.
describe("graph join points", () => {
  it("anchors every @id on the live origin", () => {
    for (const id of [ORG_ID, SITE_ID, SERVICE_ID]) {
      expect(id.startsWith(SITE_URL)).toBe(true);
    }
    expect(ORG_ID).toBe("https://decdn.org/#organization");
    expect(SITE_ID).toBe("https://decdn.org/#website");
    expect(SERVICE_ID).toBe("https://decdn.org/#service");
  });
});

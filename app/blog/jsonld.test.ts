import { isValidElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import {
  blogPostingNode,
  listIndexPosts,
  listPosts,
  postUrl,
} from "@/lib/blog";
import BlogIndex from "./page";
import BlogPost from "./[slug]/page";

// #199 hoisted `BlogPosting` assembly into `blogPostingNode` so the blog index
// and the post page cannot emit different nodes under the same `@id`. Testing
// the builder alone doesn't guard that: the regression is a call site drifting
// away from it — re-inlining a literal, or spreading an extra field over one
// copy. These tests render both pages and compare what they actually emit.
//
// Rendering `app/` from vitest is what the `@/` alias resolution added in #196
// bought (`vitest.config.ts`). `MDXRemote` in the post page stays an
// unevaluated React element, so no MDX compilation happens here.

/** Every `<JsonLd data={…}>` prop in a rendered tree, in document order. */
const jsonLdNodes = (node: ReactNode): Record<string, unknown>[] => {
  if (Array.isArray(node)) return node.flatMap(jsonLdNodes);
  if (!isValidElement(node)) return [];
  const props = node.props as {
    data?: Record<string, unknown>;
    children?: ReactNode;
  };
  // Compare by shape, not by identity: `JsonLd` is imported through the `@/`
  // alias here and relatively there, so the two module instances differ.
  if (props.data !== undefined && "@type" in props.data) return [props.data];
  return jsonLdNodes(props.children);
};

const nodeById = (nodes: Record<string, unknown>[], id: string) =>
  nodes.find((n) => n["@id"] === id);

describe("blog JSON-LD single-sourcing", () => {
  const posts = listPosts();

  it("has posts to check", () => {
    expect(posts.length).toBeGreaterThan(0);
  });

  it("emits the shared node for every post in the index's Blog graph", () => {
    const blog = nodeById(
      jsonLdNodes(BlogIndex()),
      "https://decdn.org/blog/#blog",
    );
    expect(blog).toBeDefined();
    expect(blog!.blogPost).toEqual(listIndexPosts().map(blogPostingNode));
  });

  it("emits the byte-identical node on each post page", async () => {
    for (const post of posts) {
      const tree = await BlogPost({
        params: Promise.resolve({ slug: post.slug }),
      });
      const emitted = nodeById(jsonLdNodes(tree), `${postUrl(post.slug)}#post`);
      expect(
        emitted,
        `no BlogPosting node on /blog/${post.slug}/`,
      ).toBeDefined();
      expect(emitted).toEqual(blogPostingNode(post));
    }
  });

  it("agrees between the index and the post pages under the same @id", async () => {
    const indexed = (
      nodeById(jsonLdNodes(BlogIndex()), "https://decdn.org/blog/#blog")!
        .blogPost as Record<string, unknown>[]
    ).map((n) => [n["@id"], n] as const);

    for (const post of posts) {
      const id = `${postUrl(post.slug)}#post`;
      const fromIndex = indexed.find(([nodeId]) => nodeId === id)?.[1];
      const tree = await BlogPost({
        params: Promise.resolve({ slug: post.slug }),
      });
      expect(fromIndex).toEqual(nodeById(jsonLdNodes(tree), id));
    }
  });

  it("points every post's image at the same @id-derived URL on both surfaces", async () => {
    for (const post of posts) {
      const tree = await BlogPost({
        params: Promise.resolve({ slug: post.slug }),
      });
      const node = nodeById(jsonLdNodes(tree), `${postUrl(post.slug)}#post`)!;
      // The corruption #199 guarded against: a slash-less base turning the
      // image into `…/why-nowopengraph-image`.
      expect(node.image).toBe(`${postUrl(post.slug)}opengraph-image`);
      expect(node.url).toBe(postUrl(post.slug));
    }
  });
});

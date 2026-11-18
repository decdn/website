import { describe, expect, it } from "vitest";
import NotFound, { metadata } from "./not-found";
import { NOT_FOUND_TITLE } from "@/lib/copy";
import { links } from "@/lib/links";
import { attrs, findAll, findOne, textOf } from "@/test-utils/react-tree";

describe("not-found metadata", () => {
  // Without these the 404 inherits the root layout's `index, follow` and its
  // canonical to the homepage, contradicting the `noindex` Next injects.
  it("is not indexable", () => {
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it("drops the inherited canonical", () => {
    expect(metadata.alternates).toEqual({ canonical: null });
  });

  it("titles the page rather than inheriting the homepage title", () => {
    expect(metadata.title).toBe(NOT_FOUND_TITLE);
  });
});

describe("NotFound", () => {
  const tree = NotFound();

  it("has one h1 naming the page", () => {
    expect(textOf(findOne(tree, "h1"))).toContain(NOT_FOUND_TITLE);
  });

  it("links back to the homepage, the blog and the docs", () => {
    const hrefs = findAll(tree, "a").map((a) => attrs(a).href);
    expect(hrefs).toEqual(["/", links.blog, links.docs]);
  });
});

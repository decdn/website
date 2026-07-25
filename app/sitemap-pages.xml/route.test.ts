import { describe, expect, it } from "vitest";
import { GET } from "./route";
import { listPosts } from "@/lib/blog";
import { LEGAL_SLUGS } from "@/lib/legal";

const body = await GET().text();
const locs = [...body.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);

describe("sitemap-pages.xml", () => {
  it("serves xml", () => {
    expect(GET().headers.get("Content-Type")).toBe("application/xml");
  });

  it("lists every URL exactly once, absolute and on this origin", () => {
    expect(new Set(locs).size).toBe(locs.length);
    for (const loc of locs) {
      expect(loc.startsWith("https://decdn.org/")).toBe(true);
      expect(loc).not.toMatch(/[<>&"']/);
    }
  });

  it("lists the pages that are not derived from content", () => {
    expect(locs).toContain("https://decdn.org/");
    expect(locs).toContain("https://decdn.org/blog/");
    expect(locs).toContain("https://decdn.org/decdn_litepaper.pdf");
  });

  // The two machine-readable surfaces are listed here so a build that stops
  // emitting one shows up in the sitemap diff. There is no postbuild script in
  // this repo verifying that every <loc> resolves to a file in out/, so this
  // is the guard: it fails if the entries are dropped.
  it.each(["https://decdn.org/llms.txt", "https://decdn.org/llms-full.txt"])(
    "lists %s",
    (url) => {
      expect(locs).toContain(url);
    },
  );

  it.each(listPosts())("lists the $slug post", (post) => {
    expect(locs).toContain(`https://decdn.org/blog/${post.slug}/`);
  });

  it.each(LEGAL_SLUGS)("lists the %s document", (slug) => {
    expect(locs).toContain(`https://decdn.org/legal/${slug}/`);
  });
});

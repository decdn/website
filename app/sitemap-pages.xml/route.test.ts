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

  // Both machine-readable surfaces are listed. This asserts only that the
  // entries are present — they are string literals in the route, so nothing
  // here would notice if app/llms.txt/route.ts stopped emitting the file.
  // scripts/check-out.mjs is what resolves every <loc> against out/.
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

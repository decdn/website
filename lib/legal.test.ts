import { describe, expect, it } from "vitest";
import {
  formatEffective,
  getLegalDoc,
  legalMetadata,
  LEGAL_SLUGS,
} from "./legal";

describe("formatEffective", () => {
  it("renders a human-readable date with no leading zero on the day", () => {
    expect(formatEffective("2026-06-22", "x.mdx")).toBe("22 June 2026");
    expect(formatEffective("2026-01-05", "x.mdx")).toBe("5 January 2026");
  });

  it("accepts a real leap day", () => {
    expect(formatEffective("2024-02-29", "x.mdx")).toBe("29 February 2024");
  });

  it.each(["2026/06/22", "2026-6-22", "26-06-22", "2026-06-22T00:00:00", ""])(
    "rejects malformed ISO shape %j",
    (input) => {
      expect(() => formatEffective(input, "x.mdx")).toThrow(/ISO date/);
    },
  );

  // Shape-valid but non-existent dates would index MONTHS out of bounds and
  // silently render "undefined" without the calendar check.
  it.each([
    "2026-13-40",
    "2026-00-10",
    "2026-02-30",
    "2026-04-31",
    "2023-02-29",
  ])("rejects non-existent calendar date %j", (input) => {
    expect(() => formatEffective(input, "x.mdx")).toThrow(
      /not a real calendar date/,
    );
  });
});

describe("getLegalDoc", () => {
  it.each(LEGAL_SLUGS)("loads %s with non-empty required fields", (slug) => {
    const doc = getLegalDoc(slug);
    expect(doc.slug).toBe(slug);
    expect(doc.title.trim()).not.toBe("");
    expect(doc.description.trim()).not.toBe("");
    expect(doc.effective).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(doc.effectiveLabel).toMatch(/^\d{1,2} [A-Z][a-z]+ \d{4}$/);
    expect(doc.body.trim()).not.toBe("");
  });
});

describe("legalMetadata", () => {
  it.each(LEGAL_SLUGS)(
    "uses a relative canonical resolved via metadataBase for %s",
    (slug) => {
      const meta = legalMetadata(slug);
      // Relative (not absolute) so it matches the blog convention and resolves
      // against `metadataBase`; see lib/links.ts.
      expect(meta.alternates?.canonical).toBe(`/legal/${slug}/`);
      expect(meta.openGraph?.url).toBe(`/legal/${slug}/`);
    },
  );

  // openGraph shallow-replaces in Next 16, so images have to be threaded
  // through from the parent — without this the page declares
  // `twitter:card=summary_large_image` with no image and renders a blank card.
  it("re-passes the parent og images to both openGraph and twitter", () => {
    const images = [{ url: "https://decdn.org/opengraph-image.png" }];
    const meta = legalMetadata("privacy", images);
    expect(meta.openGraph?.images).toBe(images);
    expect(meta.twitter?.images).toBe(images);
  });

  // The card is declared `summary_large_image`, so an empty images list is a
  // blank card on X — assert every slug carries the image through.
  it.each(LEGAL_SLUGS)("carries an image on every surface for %s", (slug) => {
    const meta = legalMetadata(slug, [
      { url: "https://decdn.org/opengraph-image.png" },
    ]);
    expect(meta.openGraph?.images).not.toHaveLength(0);
    expect(meta.twitter?.images).not.toHaveLength(0);
  });
});

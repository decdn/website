import { describe, expect, it } from "vitest";
import { imagesField, OG_SITE, TWITTER_SITE } from "./metadata";
import { X_HANDLE } from "./links";

// A resolved parent image carries more than a url — assert against that shape
// so the tests document what actually flows through.
const IMAGE = {
  url: "https://decdn.org/opengraph-image.png",
  alt: "deCDN — decentralized CDN for bytes at scale",
  width: 1200,
  height: 630,
  type: "image/png",
};

describe("imagesField", () => {
  it("emits the images key when there is at least one image", () => {
    expect(imagesField([IMAGE])).toEqual({ images: [IMAGE] });
  });

  // The point of the helper: Next's static-metadata merge tests
  // `hasOwnProperty("images")`, so an `images: []` would disable any
  // co-located `opengraph-image.*` just as effectively as a real list.
  // Absence of the key is the contract — `toEqual({})` alone wouldn't catch
  // `{ images: undefined }`, so assert the key is genuinely not there.
  it("omits the images key entirely when the list is empty", () => {
    const field = imagesField([]);
    expect(field).toEqual({});
    expect(Object.hasOwn(field, "images")).toBe(false);
  });
});

describe("site-level metadata fields", () => {
  // These exist only to survive Next's shallow merge; if a value drifts from
  // what the root layout used to declare inline, the cards change silently.
  it("pins the openGraph site fields", () => {
    expect(OG_SITE).toEqual({ siteName: "deCDN", locale: "en_US" });
  });

  it("derives both X attribution fields from the single handle", () => {
    expect(TWITTER_SITE).toEqual({ site: X_HANDLE, creator: X_HANDLE });
  });
});

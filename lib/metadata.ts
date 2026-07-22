import type { ResolvedMetadata, ResolvingMetadata } from "next";
import { X_HANDLE } from "./links";

// Next merges metadata SHALLOWLY: a segment that defines `openGraph` (or
// `twitter`) replaces the parent's *resolved* object wholesale rather than
// merging into it — see the "Merging" section of
// node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md,
// and `case "openGraph"` in next/dist/lib/metadata/resolve-metadata.js.
//
// Everything below exists because of that one rule. Every route that sets its
// own `openGraph`/`twitter` has to re-state these, or they silently vanish
// from the rendered <head>.

/** Site-level `openGraph` fields. Re-state on every route that sets openGraph. */
export const OG_SITE = { siteName: "deCDN", locale: "en_US" } as const;

/** Site-level `twitter` fields — the X attribution shown on the card. */
export const TWITTER_SITE = { site: X_HANDLE, creator: X_HANDLE } as const;

/**
 * The images array as it comes back from an awaited `ResolvingMetadata`.
 * Doubly-unwrapped: `openGraph` is nullable and its `images` is optional, and
 * neither `undefined` is a value any caller should be allowed to pass on — an
 * absent list and an empty one both render a blank card.
 */
export type OgImages = NonNullable<
  NonNullable<ResolvedMetadata["openGraph"]>["images"]
>;

/**
 * The root `app/opengraph-image.png` reaches a child route only through the
 * resolved parent: the file convention attaches at its own segment, and a
 * descendant defining `openGraph` replaces it. Reading it here is what keeps
 * the site card on routes that have no `opengraph-image` of their own.
 */
export const inheritedOgImages = async (
  parent: ResolvingMetadata,
): Promise<OgImages> => (await parent).openGraph?.images ?? [];

/**
 * Spread this — never assign `images:` directly. Next's static-metadata merge
 * tests `hasOwnProperty("images")` (resolve-metadata.js), not whether the value
 * is set, so writing the key at all (even as `[]`) permanently disables any
 * co-located `opengraph-image.*` for that segment. Omitting the key instead
 * leaves that door open. Same reasoning as the `...(ogImages && { images })`
 * guard in app/blog/[slug]/page.tsx.
 */
export const imagesField = (images: OgImages) =>
  images.length > 0 ? { images } : {};

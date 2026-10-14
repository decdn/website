// The homepage's section ids, top to bottom. sections.test.ts holds each
// one to the Frame it names.
export const SECTION_IDS = [
  "intro",
  "compare",
  "method",
  "faq",
  "try",
  "contact",
] as const;

// Ids of sections that paint on a dark background — used to flip the
// navbar text color per-section instead of relying on
// `mix-blend-mode: difference`, which silently fails on Safari / iOS
// when applied to `position: fixed` elements (the nav would vanish).
// A hand copy of each section's <Frame tone>; sections.test.ts keeps the
// two in step.
export const DARK_SECTIONS: ReadonlySet<(typeof SECTION_IDS)[number]> = new Set(
  ["compare", "faq", "contact"],
);

// Both `pathname === "/"` and `scrolled` must hold for `observed` to win.
// Off-home, the caller's observer never gets built but `active` still
// holds its last home-route value — the home check stops that stale value
// painting. On home, `active` is briefly stale between the route-change
// render and the new observer's first callback; `scrolled` (scrollY > 8)
// stands in for "observer has had a moment to fire". Caveat: back-nav
// with restored scroll skips this — a brief stale-tone flash is possible.
export function resolveActiveSection<T>(
  pathname: string,
  scrolled: boolean,
  observed: T,
  fallback: T,
): T {
  return pathname === "/" && scrolled ? observed : fallback;
}

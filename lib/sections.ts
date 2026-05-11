// Single source of truth for the section vocabulary used by the
// navbar (Chrome.tsx) and the mobile drawer (MobileMenu.tsx). Both
// components used to maintain their own copies; keep that drift from
// reappearing by importing from here.

export const SECTION_IDS = [
  "intro",
  "compare",
  "method",
  "faq",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

// Nav items = section ids minus the hero (intro is the wordmark's
// target, not a navbar link).
export const NAV_SECTIONS: ReadonlyArray<{ id: SectionId; label: string }> = [
  { id: "compare", label: "compare" },
  { id: "method", label: "method" },
  { id: "faq", label: "faq" },
  { id: "contact", label: "contact" },
] as const;

// Sections that paint on a dark background — drives the navbar's
// per-section tone flip. See Chrome.tsx for the IntersectionObserver
// that updates the active section as you scroll.
export const DARK_SECTIONS: ReadonlySet<SectionId> = new Set([
  "compare",
  "faq",
]);

// `litepaper` 404s until the PDF lands in public/ — see #26.
export const links = {
  site: "https://decdn.org",
  github: "https://github.com/decdn",
  x: "https://x.com/deCDNorg",
  litepaper: "/litepaper-v0.pdf",
  docs: "https://docs.decdn.org/overview/introduction",
  runNode: "https://docs.decdn.org/node-operators/overview",
  contact: "mailto:info@decdn.org",
} as const;

export type LinkKey = keyof typeof links;

// Trailing-slash base: lets callers concat `${SITE_URL}icon.svg` and
// stable-fragment @ids (`${SITE_URL}#organization`) without manual joins.
// `trailingSlash: true` is set in next.config.ts; keep these consistent.
export const SITE_URL = new URL("/", links.site).toString();

// Single source of truth for crawl policy. The page-level meta tag in
// `app/layout.tsx` and the site-level rules in `app/robots.ts` both derive
// from this so they can't drift (e.g. a future preview deploy flipping one
// to noindex but leaving the other allow-all).
export const INDEXABLE = true;

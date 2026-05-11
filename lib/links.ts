export const links = {
  site: "https://decdn.org",
  github: "https://github.com/decdn",
  x: "https://x.com/deCDNorg",
  litepaper: "/decdn_litepaper.pdf",
  docs: "https://docs.decdn.org/overview/introduction",
  blog: "/blog/",
  contact: "mailto:info@decdn.org",
} as const;

export type LinkKey = keyof typeof links;

// Trailing-slash base: lets callers concat `${SITE_URL}icon.svg` and
// stable-fragment @ids (`${SITE_URL}#organization`) without manual joins.
// Must stay aligned with `trailingSlash` in next.config.ts — otherwise
// hand-built URLs (sitemap entries, JSON-LD @ids) won't match rendered routes.
export const SITE_URL = new URL("/", links.site).toString();

// Drives `<meta name="robots">` in `app/layout.tsx`. `robots.txt` stays
// `Allow: /` regardless: Disallow + noindex is an anti-pattern that strands
// URLs in search results — blocked crawlers never fetch the page and so never
// see the noindex directive. Flip this to take the site out of search.
export const INDEXABLE = true;

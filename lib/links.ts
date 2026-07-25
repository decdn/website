export const EMAIL = "info@decdn.org";

export const links = {
  site: "https://decdn.org",
  github: "https://github.com/decdn",
  x: "https://x.com/decdn_",
  linkedin: "https://www.linkedin.com/company/decdn",
  litepaper: "/decdn_litepaper.pdf",
  presskit: "/presskit/decdn-presskit.zip",
  docs: "https://docs.decdn.org/overview/introduction",
  blog: "/blog/",
  contact: `mailto:${EMAIL}`,
  privacy: "/legal/privacy/",
  terms: "/legal/terms/",
  disclaimer: "/legal/disclaimer/",
} as const;

// Trailing-slash base: lets callers concat `${SITE_URL}icon.svg` and
// stable-fragment @ids (`${SITE_URL}#organization`) without manual joins.
// Must stay aligned with `trailingSlash` in next.config.ts — otherwise
// hand-built URLs (sitemap entries, JSON-LD @ids) won't match rendered routes.
export const SITE_URL = new URL("/", links.site).toString();

// Stable @id for the Organization JSON-LD node. Referenced as
// `{ "@id": ORG_ID }` from every other schema's `publisher`/`provider`/
// `author` field so the structured-data graph joins correctly.
export const ORG_ID = `${SITE_URL}#organization`;

// Stable @ids for the WebSite and Service nodes. They sit beside ORG_ID
// rather than in the route that renders them because other modules join on
// them — `isPartOf: { "@id": SITE_ID }` on every legal page, for one — and an
// @id that disagrees with the origin it is built from breaks the graph
// silently.
export const SITE_ID = `${SITE_URL}#website`;
export const SERVICE_ID = `${SITE_URL}#service`;

// Trailing-slash blog base, paired with SITE_URL so callers can concat
// `${BLOG_URL}${slug}/` (post URL) and `${BLOG_URL}#blog` (stable @id)
// without re-deriving the path. Must agree with `next.config.ts`'s
// `trailingSlash: true` and `links.blog`.
export const BLOG_URL = `${SITE_URL}blog/`;

// Twitter expects an `@handle`; derive from the X profile URL so the X
// account is the single source of truth.
export const X_HANDLE = `@${new URL(links.x).pathname.replace(/^\//, "")}`;

// Drives the `<meta name="robots">` `index` and `follow` flags. robots.txt
// and the sitemap stay unconditional by design — Disallow + noindex strands
// URLs in search results because blocked crawlers never fetch the page and
// so never see the noindex directive.
export const INDEXABLE = true;

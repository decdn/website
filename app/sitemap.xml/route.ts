import { SITE_URL, links } from "@/lib/links";

// Required by Next 16 under `output: "export"` for route handlers that emit
// static files at build time. GET-only is the only verb supported in export.
export const dynamic = "force-static";

// Cross-host sitemap entries are only honored by Google when both hosts are
// verified in Search Console.
const DOCS_SITEMAP = `${new URL(links.docs).origin}/sitemap.xml`;

const BODY = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${SITE_URL}sitemap-pages.xml</loc></sitemap>
  <sitemap><loc>${DOCS_SITEMAP}</loc></sitemap>
</sitemapindex>
`;

export function GET() {
  return new Response(BODY, {
    headers: { "Content-Type": "application/xml" },
  });
}

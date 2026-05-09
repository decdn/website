import { SITE_URL } from "@/lib/links";

// Required by Next 16 under `output: "export"` for route handlers that emit
// static files at build time. GET-only is the only verb supported in export.
export const dynamic = "force-static";

// Marketing-site URLs. Add a new <url> entry here when shipping a new page;
// the sibling `sitemap.xml` route serves the index that references this file.
const BODY = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}</loc></url>
</urlset>
`;

export function GET() {
  return new Response(BODY, {
    headers: { "Content-Type": "application/xml" },
  });
}

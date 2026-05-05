import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/links";

// Required by Next 16 under `output: "export"` for metadata route handlers.
export const dynamic = "force-static";

// Always allow crawling — even when `INDEXABLE` is false. `Disallow: /` +
// `<meta name="robots" content="noindex">` is an anti-pattern: blocked
// crawlers never fetch the page and so never see the `noindex` directive,
// leaving already-indexed URLs stranded in search results. To remove the
// site from search, flip `INDEXABLE` (which flips the meta tag) and let
// crawlers actually read it.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}sitemap.xml`,
  };
}

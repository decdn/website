import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/links";

// Required by Next 16 under `output: "export"` for metadata route handlers.
export const dynamic = "force-static";

// Always `Allow: /` regardless of `INDEXABLE` — see `lib/links.ts` for the
// rationale (Disallow + noindex strands URLs in the index).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}sitemap.xml`,
  };
}

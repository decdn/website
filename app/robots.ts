import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/links";

// Required by Next 16 under `output: "export"` for metadata route handlers.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}sitemap.xml`,
  };
}

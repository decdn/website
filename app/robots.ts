import type { MetadataRoute } from "next";
import { links } from "@/lib/links";

const SITE_URL = new URL("/", links.site).toString();

// Required by Next 16 under `output: "export"` for metadata route handlers.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}sitemap.xml`,
  };
}

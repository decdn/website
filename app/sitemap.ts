import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/links";

// Required by Next 16 under `output: "export"` for metadata route handlers.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL }];
}

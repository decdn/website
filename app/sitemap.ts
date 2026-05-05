import type { MetadataRoute } from "next";
import { links } from "@/lib/links";

// Trailing-slash base mirrors app/layout.tsx — keeps canonical, OG, and sitemap
// URLs byte-identical so search engines treat them as one resource.
const SITE_URL = new URL("/", links.site).toString();

// Required by Next 16 under `output: "export"` for metadata route handlers.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
    },
  ];
}

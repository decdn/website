import { SITE_URL } from "@/lib/links";
import { listPosts } from "@/lib/blog";

// SITE_URL is interpolated raw into <loc> bodies below. SLUG_RE guards
// the per-post slug; this guards the origin against a future accident
// (preview-URL with query string, embedded entity) that would emit
// invalid XML and have search engines silently reject the sitemap.
if (/[<>&"']/.test(SITE_URL)) {
  throw new Error(
    `[sitemap] SITE_URL contains XML-significant characters: ${SITE_URL}`,
  );
}

// Required by Next 16 under `output: "export"` for route handlers that emit
// static files at build time. GET-only is the only verb supported in export.
export const dynamic = "force-static";

// Same source as `generateStaticParams` in app/blog/[slug]/page.tsx, so the
// sitemap can never list a URL the build didn't actually emit.
// Raw-interpolating slug into XML is safe only because `SLUG_RE` in
// lib/blog.ts forbids `&`, `<`, `>`; if that regex ever loosens this
// must move to an XML-encoder, or search engines silently reject the
// sitemap.
const posts = listPosts();
// listPosts() is sorted newest-first in lib/blog.ts; reuse the latest post
// date as lastmod for the home and blog index since they refresh whenever
// blog content changes. The litepaper PDF has no honest lastmod tied to
// content here, so we omit it — sitemap spec permits per-URL omission.
// Fallback only fires with zero posts.
const siteLastMod = posts[0]?.date ?? new Date().toISOString().slice(0, 10);
const postUrls = posts
  .map(
    (p) =>
      `  <url><loc>${SITE_URL}blog/${p.slug}/</loc><lastmod>${p.date}</lastmod></url>`,
  )
  .join("\n");

const BODY = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}</loc><lastmod>${siteLastMod}</lastmod></url>
  <url><loc>${SITE_URL}decdn_litepaper.pdf</loc></url>
  <url><loc>${SITE_URL}blog/</loc><lastmod>${siteLastMod}</lastmod></url>
${postUrls}
</urlset>
`;

export function GET() {
  return new Response(BODY, {
    headers: { "Content-Type": "application/xml" },
  });
}

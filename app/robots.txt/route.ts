import { SITE_URL } from "@/lib/links";

// Required by Next 16 under `output: "export"` for route handlers that emit
// static files at build time. GET-only is the only verb supported in export.
export const dynamic = "force-static";

// Always `Allow: /` regardless of `INDEXABLE` — see `lib/links.ts` for the
// rationale (Disallow + noindex strands URLs in the index).
//
// `Content-Signal` declares AI/search usage preferences per
// https://contentsignals.org/ and draft-romm-aipref-contentsignals: allow
// search indexing, training, and real-time AI grounding/RAG.
const BODY = `User-Agent: *
Content-Signal: ai-train=yes, search=yes, ai-input=yes
Allow: /

Sitemap: ${SITE_URL}sitemap.xml
`;

export function GET() {
  return new Response(BODY, {
    headers: { "Content-Type": "text/plain" },
  });
}

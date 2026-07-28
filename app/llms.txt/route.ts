import { listPosts, postUrl } from "@/lib/blog";
import {
  BLOG_DESCRIPTION,
  BLOG_TITLE,
  SITE_DESCRIPTION,
  statusBlock,
} from "@/lib/copy";
import { getLegalDoc, LEGAL_SLUGS, legalUrl } from "@/lib/legal";
import { BLOG_URL, DOCS_ORIGIN, links, SITE_URL } from "@/lib/links";

// Curated machine-readable index of this origin, per https://llmstxt.org:
// an H1, a blockquote summary, free-form prose, then H2-delimited file lists
// of `[name](url): notes`. The spec-defined `## Optional` section goes last —
// a consumer short on context may skip everything under it, so nothing
// load-bearing lives there.
//
// Page entries derive from the same loaders the HTML routes use (listPosts,
// LEGAL_SLUGS), so this file cannot list an HTML route the build did not emit.
// Four entries are not routes and get no such guarantee: the litepaper and
// press kit are files under public/, and the two docs.decdn.org URLs are on a
// host Mintlify builds independently of `pnpm build`. scripts/check-out.mjs
// verifies the same-origin ones against out/ after a build; the docs host is
// out of reach from here. Both llms surfaces are also listed in
// app/sitemap-pages.xml/route.ts.

// Required by Next 16 under `output: "export"` for route handlers that emit
// static files at build time. GET-only is the only verb supported in export.
export const dynamic = "force-static";

/**
 * Authored strings (post titles, summaries, legal descriptions) are
 * interpolated raw into markdown link labels and notes. A `]` closes the label
 * early and a newline ends the list item — both silently truncate the entry
 * instead of failing, which is exactly the class of bug the SITE_URL guard in
 * the sitemap route exists to prevent. Exported for tests.
 */
export function assertMarkdownSafe(value: string, field: string): string {
  if (/[\]\n\r]/.test(value)) {
    throw new Error(
      `[llms.txt] ${field}: must not contain "]" or a line break — got ${JSON.stringify(value)}`,
    );
  }
  return value;
}

const entry = (label: string, url: string, note: string, field: string) =>
  `- [${assertMarkdownSafe(label, `${field} label`)}](${url}): ${assertMarkdownSafe(note, `${field} note`)}`;

// The docs host serves its own llms.txt and llms-full.txt (Mintlify), so this
// points at those two files rather than restating fourteen doc pages.
const LITEPAPER_URL = new URL(links.litepaper, SITE_URL).toString();
const PRESSKIT_URL = new URL(links.presskit, SITE_URL).toString();

// Status and the target-rate hedge sit in the prose, not under `## Optional`,
// because a consumer that skips the optional section must still see them.
const STATUS = statusBlock("across this site");

const posts = listPosts();

const BODY = `# deCDN

> ${SITE_DESCRIPTION}

deCDN is demand-shaped, locality-optimised delivery for large files at scale: supply forms around demand, cost collapses as regional traffic concentrates. Clients stream from several peers at once, verify every chunk against a BLAKE3 tree hash, and pay per megabyte in USDC — whether the payload is a Linux ISO, a dataset, a game patch, a media library, or an AI model.

A fetch runs in three steps: probe (ask nearby peers who has the file and at what rate), swarm (stream from the best of them in parallel, verifying every chunk), settle (pay per megabyte in USDC as the bytes arrive). llms-full.txt below reproduces each step in full.

${STATUS}

## Site

${entry("deCDN", SITE_URL, SITE_DESCRIPTION, "site")}
${entry(BLOG_TITLE, BLOG_URL, BLOG_DESCRIPTION, "blog index")}
${entry("llms-full.txt", `${SITE_URL}llms-full.txt`, "Every page on this origin as one plain-text document: homepage copy, the comparison matrix, the FAQ, all field notes, and the legal documents.", "llms-full")}

## Protocol documentation

${entry("docs.decdn.org llms.txt", `${DOCS_ORIGIN}/llms.txt`, "Curated index of the protocol documentation, served by the docs host.", "docs index")}
${entry("docs.decdn.org llms-full.txt", `${DOCS_ORIGIN}/llms-full.txt`, "The full protocol documentation as one plain-text document.", "docs full")}

## Field notes

${posts
  .map((post) =>
    entry(post.title, postUrl(post.slug), post.summary, `post ${post.slug}`),
  )
  .join("\n")}

## Optional

${entry("deCDN litepaper (PDF)", LITEPAPER_URL, "The protocol litepaper.", "litepaper")}
${entry("Press kit", PRESSKIT_URL, "Logos and wordmarks, as a zip archive.", "presskit")}
${LEGAL_SLUGS.map((slug) => {
  const doc = getLegalDoc(slug);
  return entry(doc.title, legalUrl(slug), doc.description, `legal ${slug}`);
}).join("\n")}
`;

export function GET() {
  return new Response(BODY, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

import { getPost, listPosts } from "@/lib/blog";
import {
  COMPARE_HEADLINE,
  COMPARE_LEAD,
  COMPARE_ROWS,
  CONTACT_LEAD,
  HERO_HEADLINE,
  HERO_LEAD,
  METHOD_STEPS,
  SITE_DESCRIPTION,
} from "@/lib/copy";
import { FAQ_ITEMS } from "@/lib/faq";
import { getLegalDoc, LEGAL_SLUGS } from "@/lib/legal";
import { BLOG_URL, EMAIL, links, SITE_URL } from "@/lib/links";

// The whole origin as one plain-text document, so an agent grounding on deCDN
// fetches this instead of stripping HTML from the homepage, the blog index,
// seven post pages and three legal pages.
//
// Homepage prose comes from lib/copy.ts — the same module the section
// components render, so the mirror cannot drift from the page. Post and legal
// bodies come from the same loaders the routes use.
//
// Deliberately excluded: the HeroTerminal and FleetStatus figures. They are
// invented sample values, and a plain-text mirror strips exactly the visual
// framing that marks them as a demo, so quoting them here would be worse than
// not mirroring them at all. The tests assert their absence.

// Required by Next 16 under `output: "export"` for route handlers that emit
// static files at build time. GET-only is the only verb supported in export.
export const dynamic = "force-static";

/**
 * Post and legal bodies are embedded verbatim. A `# ` line inside one would
 * collide with this document's single H1 and corrupt the outline a consumer
 * builds from the headings — the one heading level that says *which document
 * this is*. Deeper headings inside a body belong to that body and are left
 * alone. Exported for tests.
 */
export function assertNoTopLevelHeading(body: string, field: string): string {
  const match = /^# .*/m.exec(body);
  if (match) {
    throw new Error(
      `[llms-full.txt] ${field}: embedded body must not contain a top-level heading — found ${JSON.stringify(match[0])}`,
    );
  }
  return body;
}

const compareTable = [
  "| axis | traditional cdn | decdn |",
  "| --- | --- | --- |",
  ...COMPARE_ROWS.map(
    (row) => `| ${row.axis} | ${row.traditional} | ${row.decdn} |`,
  ),
].join("\n");

const methodSteps = METHOD_STEPS.map(
  (step) => `#### ${step.n} ${step.word}\n\n${step.body}`,
).join("\n\n");

const faq = FAQ_ITEMS.map(({ q, a }) => `#### ${q}\n\n${a}`).join("\n\n");

const fieldNotes = listPosts()
  .map((meta) => {
    const post = getPost(meta.slug);
    if (!post) {
      throw new Error(`[llms-full.txt] ${meta.slug}: listed but not loadable`);
    }
    return [
      `### ${post.title}`,
      "",
      `${BLOG_URL}${post.slug}/ — published ${post.date}`,
      "",
      post.summary,
      "",
      assertNoTopLevelHeading(post.body.trim(), `post ${post.slug}`),
    ].join("\n");
  })
  .join("\n\n");

const legal = LEGAL_SLUGS.map((slug) => {
  const doc = getLegalDoc(slug);
  return [
    `### ${doc.title}`,
    "",
    `${SITE_URL}legal/${slug}/ — effective ${doc.effective}`,
    "",
    doc.description,
    "",
    assertNoTopLevelHeading(doc.body, `legal ${slug}`),
  ].join("\n");
}).join("\n\n");

const BODY = `# deCDN — full text

> ${SITE_DESCRIPTION}

This is every page on decdn.org as one document: the homepage copy, the traditional-vs-deCDN comparison, the FAQ, every field note, and the three legal documents. The curated index is at ${SITE_URL}llms.txt, and the protocol documentation lives on its own host at ${new URL(links.docs).origin}/llms-full.txt.

Status: testnet v0. The protocol runs end-to-end in a test environment; a public testnet and the open-source release are targeted for Q3 2026. The $0.01/GB figure quoted throughout is a public target rate, not a protocol-enforced price.

Two notes on reading this file. Field notes and legal documents are reproduced verbatim, so the headings inside them belong to those documents rather than to this outline. And the homepage's terminal and fleet-dashboard widgets are not mirrored here at all: their figures are invented sample values for demonstration, and plain text strips the framing that marks them as a demo.

## Homepage

### Intro

${HERO_HEADLINE.join(" ")}

${HERO_LEAD}

Target price $0.01/GB · p50 latency 50–100 ms · settlement per-MB in USDC · gas overhead under 1%.

### Side by side

${COMPARE_HEADLINE.join(" ")}

${COMPARE_LEAD}

${compareTable}

### How it works

Stack: BLAKE3 · QUIC · iroh · USDC · EVM. Written in Rust; transport is QUIC over iroh; settlement is chain-agnostic, in USDC and the protocol token.

${methodSteps}

### FAQ

${faq}

### Contact

${CONTACT_LEAD}

Email ${EMAIL} · GitHub ${links.github} · X ${links.x} · LinkedIn ${links.linkedin}

## Field notes

${fieldNotes}

## Legal

${legal}
`;

export function GET() {
  return new Response(BODY, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

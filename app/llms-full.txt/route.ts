import { getPost, listPosts, postUrl } from "@/lib/blog";
import {
  COMPARE_HEADLINE,
  COMPARE_LEAD,
  COMPARE_ROWS,
  CONTACT_LEAD,
  type FigureCopy,
  HERO_FIGURES,
  HERO_HEADLINE,
  HERO_LEAD,
  METHOD_FIGURES,
  METHOD_STEPS,
  SITE_DESCRIPTION,
  STACK,
  statusBlock,
} from "@/lib/copy";
import { FAQ_ITEMS } from "@/lib/faq";
import { getLegalDoc, LEGAL_SLUGS, legalUrl } from "@/lib/legal";
import { DOCS_ORIGIN, EMAIL, links, SITE_URL } from "@/lib/links";

// The whole origin as one plain-text document, so an agent grounding on deCDN
// fetches this instead of stripping HTML from the homepage, the blog index,
// every post page and the three legal pages.
//
// Homepage prose comes from lib/copy.ts — the same module the section
// components render — so a sentence cannot be edited on the page without the
// mirror following. That is only true of prose actually kept there: the rule
// exists because the hero and method stat strips used to be inline JSX
// attributes restated here by hand, and had already drifted. Anything new the
// homepage renders belongs in lib/copy.ts for the same reason.
//
// Post and legal bodies come from the same loaders the routes use.
//
// Deliberately excluded: the HeroTerminal and FleetStatus figures. They are
// invented sample values, and a plain-text mirror strips exactly the visual
// framing that marks them as a demo, so quoting them here would be worse than
// not mirroring them at all. The tests assert their absence.

// Required by Next 16 under `output: "export"` for route handlers that emit
// static files at build time. GET-only is the only verb supported in export.
export const dynamic = "force-static";

/**
 * Text interpolated onto a heading line. A line break splits the heading in
 * two, leaving a heading that says something different and a stray paragraph
 * under it — still valid markdown, so nothing fails. Exported for tests.
 */
export function assertHeadingText(value: string, field: string): string {
  if (/[\n\r]/.test(value)) {
    throw new Error(
      `[llms-full.txt] ${field}: heading text must not contain a line break — got ${JSON.stringify(value)}`,
    );
  }
  return value;
}

/**
 * A cell in the pipe-delimited comparison table. A `|` opens a column the
 * header row doesn't have, which misaligns the row for every markdown parser
 * rather than failing; a line break ends the row outright. Exported for tests.
 */
export function assertTableCell(value: string, field: string): string {
  if (/[|\n\r]/.test(value)) {
    throw new Error(
      `[llms-full.txt] ${field}: table cell must not contain "|" or a line break — got ${JSON.stringify(value)}`,
    );
  }
  return value;
}

// Embedded bodies are given `###`, so their own headings shift by three to
// nest underneath: an embedded `##` becomes `#####`. Markdown stops at six
// levels, so a body may not already be deeper than `###`.
const BODY_HEADING_OFFSET = 3;
const DEEPEST_EMBEDDED_HEADING = 6 - BODY_HEADING_OFFSET;
const FENCE_RE = /^\s*(?:```|~~~)/;
const HEADING_RE = /^(#{1,6}) /;

/**
 * Demote every heading in an embedded body so it nests under the `###` this
 * document gives the body.
 *
 * Without this the outline inverts. Every post and legal document uses `##`
 * for its own sections, so `## The setup` inside a field note parses as a
 * sibling of this document's `## Legal` — and the privacy policy's own
 * `## Contact` then terminates the Legal section, stranding the terms of use
 * and the disclaimer outside it in any heading-derived outline. Prose telling
 * the reader to disregard the embedded headings does not help a machine
 * consumer, which is who this file is for.
 *
 * Fenced regions are skipped: a shell snippet's `# install deps` is a comment,
 * not a heading, and content/blog/06-show-me-the-money.mdx already ships
 * fences. Exported for tests.
 */
export function demoteHeadings(body: string, field: string): string {
  let inFence = false;
  return body
    .split("\n")
    .map((line) => {
      if (FENCE_RE.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      const heading = HEADING_RE.exec(line);
      if (!heading) return line;
      const level = heading[1].length;
      if (level > DEEPEST_EMBEDDED_HEADING) {
        throw new Error(
          `[llms-full.txt] ${field}: heading is deeper than ${"#".repeat(DEEPEST_EMBEDDED_HEADING)} and cannot be demoted into this document — found ${JSON.stringify(line)}`,
        );
      }
      return "#".repeat(level + BODY_HEADING_OFFSET) + line.slice(level);
    })
    .join("\n");
}

/** A Figure strip, as `label: value` pairs. Comma-joined, not `·`-joined: a
 *  value can itself contain `·` ("per-MB · usdc"). */
const figureList = (figures: readonly FigureCopy[]): string =>
  figures.map((f) => `${f.label}: ${f.value}`).join(", ");

/** `### Title` / url and date / summary / body — the shape the field notes and
 *  the legal documents share. */
const documentBlock = (
  title: string,
  dateLine: string,
  summary: string,
  body: string,
  field: string,
): string =>
  [
    `### ${assertHeadingText(title, `${field} title`)}`,
    "",
    dateLine,
    "",
    summary,
    "",
    demoteHeadings(body, field),
  ].join("\n");

const compareTable = [
  "| axis | traditional cdn | decdn |",
  "| --- | --- | --- |",
  ...COMPARE_ROWS.map((row) => {
    const cell = (value: string, name: string) =>
      assertTableCell(value, `compare ${row.axis} ${name}`);
    return `| ${cell(row.axis, "axis")} | ${cell(row.traditional, "traditional")} | ${cell(row.decdn, "decdn")} |`;
  }),
].join("\n");

const methodSteps = METHOD_STEPS.map(
  (step) =>
    `#### ${step.n} ${assertHeadingText(step.word, `method ${step.n} word`)}\n\n${step.body}`,
).join("\n\n");

const faq = FAQ_ITEMS.map(
  ({ q, a }, i) => `#### ${assertHeadingText(q, `faq[${i}] question`)}\n\n${a}`,
).join("\n\n");

const fieldNotes = listPosts()
  .map((meta) => {
    const post = getPost(meta.slug);
    if (!post) {
      throw new Error(`[llms-full.txt] ${meta.slug}: listed but not loadable`);
    }
    return documentBlock(
      post.title,
      `${postUrl(post.slug)} — published ${post.date}`,
      post.summary,
      post.body.trim(),
      `post ${post.slug}`,
    );
  })
  .join("\n\n");

const legal = LEGAL_SLUGS.map((slug) => {
  const doc = getLegalDoc(slug);
  return documentBlock(
    doc.title,
    `${legalUrl(slug)} — effective ${doc.effective}`,
    doc.description,
    doc.body,
    `legal ${slug}`,
  );
}).join("\n\n");

const BODY = `# deCDN — full text

> ${SITE_DESCRIPTION}

This is every page on decdn.org as one document: the homepage copy, the traditional-vs-deCDN comparison, the FAQ, every field note, and the three legal documents. The curated index is at ${SITE_URL}llms.txt, and the protocol documentation lives on its own host at ${DOCS_ORIGIN}/llms-full.txt.

${statusBlock("throughout")}

Two notes on reading this file. Field notes and legal documents are reproduced verbatim except that their headings are demoted to nest under the \`###\` each is given here, so the outline of this document is its own. And the homepage's terminal and fleet-dashboard widgets are not mirrored at all: their figures are invented sample values for demonstration, and plain text strips the framing that marks them as a demo.

## Homepage

### Intro

${HERO_HEADLINE.join(" ")}

${HERO_LEAD}

${figureList(HERO_FIGURES)}

### Side by side

${COMPARE_HEADLINE.join(" ")}

${COMPARE_LEAD}

${compareTable}

### How it works

Stack: ${STACK.join(" · ")}

${figureList(METHOD_FIGURES)}

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

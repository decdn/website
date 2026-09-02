import { describe, expect, it } from "vitest";
import {
  assertHeadingText,
  assertTableCell,
  demoteHeadings,
  GET,
} from "./route";
import { getPost, listPosts } from "@/lib/blog";
import {
  COMPARE_ROWS,
  HERO_FIGURES,
  HERO_LEAD,
  METHOD_FIGURES,
  METHOD_STEPS,
  STACK,
  statusBlock,
} from "@/lib/copy";
import { FAQ_ITEMS } from "@/lib/faq";
import { getLegalDoc, LEGAL_SLUGS } from "@/lib/legal";

const response = GET();
const body = await response.text();
const lines = body.split("\n");

// Post and legal bodies are embedded with their headings demoted, so `owned`
// — the document with those bodies removed — is the text this route actually
// composes. Kept for the placeholder scan below: "undefined" is ordinary
// English inside a post body ("Compliance posture undefined"), so the raw
// document is the wrong thing to search.
const EMBEDDED = [
  ...listPosts().map((meta) =>
    demoteHeadings(getPost(meta.slug)!.body.trim(), "test"),
  ),
  ...LEGAL_SLUGS.map((slug) => demoteHeadings(getLegalDoc(slug).body, "test")),
];
const owned = EMBEDDED.reduce((doc, text) => doc.replace(text, ""), body);

// The only `### ` entries this route writes literally: every other one is
// generated from listPosts() or LEGAL_SLUGS. Spelling these out — and nothing
// else — is what lets the entry count below be derived rather than a magic
// number that goes stale the next time a post is published.
const HOMEPAGE_SUBSECTIONS = [
  "### Intro",
  "### Side by side",
  "### How it works",
  "### FAQ",
  "### Contact",
];

describe("llms-full.txt shape", () => {
  it("serves plain text", () => {
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
  });

  it("uses exactly one H1", () => {
    expect(lines.filter((line) => line.startsWith("# "))).toEqual([
      "# deCDN — full text",
    ]);
  });

  it("points back at the curated index", () => {
    expect(body).toContain("https://decdn.org/llms.txt");
  });

  // The outline is the whole document's, not a mix of this route's headings
  // and every embedded document's — that is what demoteHeadings buys, and it is
  // asserted against the *raw* body rather than `owned`, because the point is
  // that no embedded heading reaches these levels.
  it("has three sections and one entry per document, embedded bodies included", () => {
    expect(lines.filter((line) => line.startsWith("## "))).toEqual([
      "## Homepage",
      "## Field notes",
      "## Legal",
    ]);
    // The homepage's own entries are pinned by name, not by count, so this
    // still catches one being dropped or duplicated; the posts and the legal
    // documents are counted from the loaders that generate them.
    const homepage = lines.slice(
      lines.indexOf("## Homepage"),
      lines.indexOf("## Field notes"),
    );
    expect(homepage.filter((line) => line.startsWith("### "))).toEqual(
      HOMEPAGE_SUBSECTIONS,
    );
    expect(lines.filter((line) => line.startsWith("### "))).toHaveLength(
      HOMEPAGE_SUBSECTIONS.length + listPosts().length + LEGAL_SLUGS.length,
    );
  });

  // The specific inversion this prevents: every legal document uses `## ` for
  // its own sections, and the privacy policy has a `## Contact`. Undemoted,
  // that line closes `## Legal` and strands the terms of use and the
  // disclaimer outside the section that is supposed to contain them.
  it("keeps every legal document inside the Legal section", () => {
    const legalStart = lines.indexOf("## Legal");
    expect(legalStart).toBeGreaterThan(-1);
    const after = lines.slice(legalStart + 1);
    expect(after.some((line) => line.startsWith("## "))).toBe(false);
    for (const slug of LEGAL_SLUGS) {
      expect(after).toContain(`### ${getLegalDoc(slug).title}`);
    }
  });

  it("interpolates no placeholders", () => {
    expect(owned).not.toContain("undefined");
    expect(owned).not.toContain("[object Object]");
  });
});

describe("homepage mirror", () => {
  it("renders the comparison as a markdown table", () => {
    expect(body).toContain("| axis | traditional cdn | decdn |");
    expect(body).toContain("| --- | --- | --- |");
  });

  it.each(COMPARE_ROWS)("has a table row for $axis", (row) => {
    expect(lines).toContain(
      `| ${row.axis} | ${row.traditional} | ${row.decdn} |`,
    );
  });

  it.each(METHOD_STEPS)("has the $word step and its body", (step) => {
    expect(lines).toContain(`#### ${step.n} ${step.word}`);
    expect(body).toContain(step.body);
  });

  it.each(FAQ_ITEMS)("has the FAQ entry $q", ({ q, a }) => {
    expect(lines).toContain(`#### ${q}`);
    expect(body).toContain(a);
  });

  // The scalar homepage strings: without these, deleting `${HERO_LEAD}` from
  // the template leaves every other assertion in this file green.
  it.each([
    ["hero lead", HERO_LEAD],
    ["contact lead", "the network is open. so is our inbox."],
    ["status hedge", statusBlock("throughout")],
  ])("carries the %s", (_name, text) => {
    expect(body).toContain(text);
  });

  // These two lines were hand-written paraphrases of inline JSX until the
  // figures moved into lib/copy.ts. Asserting the serialised form is what
  // makes the mirror provably the same data the page renders.
  it.each([...HERO_FIGURES, ...METHOD_FIGURES])(
    "mirrors the $label figure",
    (figure) => {
      expect(body).toContain(`${figure.label}: ${figure.value}`);
    },
  );

  it("mirrors the stack chips in order", () => {
    expect(lines).toContain(`Stack: ${STACK.join(" · ")}`);
  });

  // The header prose says "the three legal documents" in words, the way
  // Compare.tsx says "seven axes". Pin the count so the prose can't go stale
  // if LEGAL_SLUGS ever grows.
  it("names as many legal documents as it embeds", () => {
    expect(LEGAL_SLUGS).toHaveLength(3);
    expect(body).toContain("the three legal documents");
  });

  // The terminal and fleet-dashboard figures are invented sample values. In
  // HTML they sit inside a captioned <figure>; plain text strips that framing
  // entirely, so mirroring them would be worse than omitting them.
  it.each([
    "15.1 GB/s",
    "$0.151 /s",
    "$0.1309",
    "$0.0055",
    "$0.0411",
    "550 MB",
    "probing 18 peers",
  ])("omits the demo figure %s", (figure) => {
    expect(body).not.toContain(figure);
  });
});

describe("embedded documents", () => {
  it.each(listPosts())("embeds $slug whole", (meta) => {
    const post = getPost(meta.slug);
    expect(lines).toContain(`### ${post!.title}`);
    expect(body).toContain(`https://decdn.org/blog/${meta.slug}/`);
    expect(body).toContain(demoteHeadings(post!.body.trim(), "test"));
  });

  it.each(LEGAL_SLUGS)("embeds the %s document whole", (slug) => {
    const doc = getLegalDoc(slug);
    expect(lines).toContain(`### ${doc.title}`);
    expect(body).toContain(`https://decdn.org/legal/${slug}/`);
    expect(body).toContain(demoteHeadings(doc.body, "test"));
  });

  // Demotion moves the hashes and nothing else — the prose a consumer reads
  // has to survive byte-for-byte.
  it.each(listPosts())("changes only heading lines in $slug", (meta) => {
    const original = getPost(meta.slug)!.body.trim();
    const demoted = demoteHeadings(original, "test");
    const strip = (text: string) =>
      text.split("\n").map((line) => line.replace(/^#+ /, ""));
    expect(strip(demoted)).toEqual(strip(original));
  });
});

describe("demoteHeadings", () => {
  it("nests an embedded heading three levels down", () => {
    expect(demoteHeadings("## A section\n\nprose", "post foo")).toBe(
      "##### A section\n\nprose",
    );
    expect(demoteHeadings("# Title", "post foo")).toBe("#### Title");
  });

  // `#1` and `#tag` are ordinary prose, not headings — the space is what makes
  // a heading, and rewriting them would corrupt a valid post.
  it.each(["#1 in the series", "tagged #tag here", "prose\n#nothashheading"])(
    "leaves %j alone",
    (value) => {
      expect(demoteHeadings(value, "post foo")).toBe(value);
    },
  );

  // content/blog/06-show-me-the-money.mdx already ships fences; a shell
  // snippet's `# install deps` is a comment, not a heading.
  it("does not touch lines inside a fenced block", () => {
    const body = ["```text", "# not a heading", "```", "## real"].join("\n");
    expect(demoteHeadings(body, "post foo")).toBe(
      ["```text", "# not a heading", "```", "##### real"].join("\n"),
    );
  });

  it("throws with field context on a heading too deep to demote", () => {
    expect(() => demoteHeadings("#### too deep", "post foo")).toThrow(
      /post foo/,
    );
  });
});

describe("markdown guards", () => {
  it("passes safe values through", () => {
    expect(assertTableCell("$0.01 /GB", "f")).toBe("$0.01 /GB");
    expect(assertHeadingText("probe", "f")).toBe("probe");
  });

  // A `|` in a cell opens a column the header row doesn't have: every parser
  // misaligns the row instead of failing, and the it.each above would still
  // pass because it builds its expectation from the same corrupted value.
  it.each(["monthly minimums | annual contracts", "two\nlines"])(
    "rejects the table cell %j",
    (value) => {
      expect(() => assertTableCell(value, "compare price traditional")).toThrow(
        /compare price traditional/,
      );
    },
  );

  it("rejects a line break in heading text", () => {
    expect(() => assertHeadingText("a\nb", "faq[0] question")).toThrow(
      /faq\[0\] question/,
    );
  });
});

import { describe, expect, it } from "vitest";
import { assertNoTopLevelHeading, GET } from "./route";
import { getPost, listPosts } from "@/lib/blog";
import { COMPARE_ROWS, METHOD_STEPS } from "@/lib/copy";
import { FAQ_ITEMS } from "@/lib/faq";
import { getLegalDoc, LEGAL_SLUGS } from "@/lib/legal";

const response = GET();
const body = await response.text();
const lines = body.split("\n");

// Post and legal bodies are embedded verbatim, and all ten of them use `## `
// for their own sections — so the raw document carries far more `## ` lines
// than this route writes. `owned` is the document with those verbatim bodies
// removed: the text this route actually composes, and the only part whose
// outline it can promise anything about.
const EMBEDDED = [
  ...listPosts().map((meta) => getPost(meta.slug)!.body.trim()),
  ...LEGAL_SLUGS.map((slug) => getLegalDoc(slug).body),
];
const owned = EMBEDDED.reduce((doc, text) => doc.replace(text, ""), body);
const ownedLines = owned.split("\n");

describe("llms-full.txt shape", () => {
  it("serves plain text", () => {
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
  });

  // Embedded bodies keep their own deeper headings, but the H1 is what says
  // which document this is — there can only be one.
  it("uses exactly one H1", () => {
    expect(lines.filter((line) => line.startsWith("# "))).toEqual([
      "# deCDN — full text",
    ]);
  });

  it("points back at the curated index", () => {
    expect(body).toContain("https://decdn.org/llms.txt");
  });

  it("owns three sections and fifteen entries", () => {
    expect(ownedLines.filter((line) => line.startsWith("## "))).toEqual([
      "## Homepage",
      "## Field notes",
      "## Legal",
    ]);
    // 5 homepage subsections + 7 posts + 3 legal documents.
    expect(ownedLines.filter((line) => line.startsWith("### "))).toHaveLength(
      15,
    );
  });

  // The tradeoff behind emitting bodies verbatim, stated so it is a decision
  // rather than a surprise: a post's own `## ` sections sit at the same level
  // as this document's, which is why the header prose tells a reader that
  // headings inside an embedded document belong to that document.
  it("says so when an embedded document brings its own headings", () => {
    expect(
      lines.filter((line) => line.startsWith("## ")).length,
    ).toBeGreaterThan(3);
    expect(body).toContain(
      "the headings inside them belong to those documents rather than to this outline",
    );
  });

  // Scoped to the composed text: "undefined" is ordinary English and appears
  // in a post body ("Compliance posture undefined"), so the raw document is
  // the wrong thing to search.
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

  // The terminal and fleet-dashboard figures are invented sample values. In
  // HTML they sit inside a captioned <figure>; plain text strips that framing
  // entirely, so mirroring them would be worse than omitting them.
  it.each(["15.1 GB/s", "$0.151 /s", "$0.1309", "probing 18 peers"])(
    "omits the demo figure %s",
    (figure) => {
      expect(body).not.toContain(figure);
    },
  );
});

describe("embedded documents", () => {
  it.each(listPosts())("embeds $slug whole", (meta) => {
    const post = getPost(meta.slug);
    expect(lines).toContain(`### ${post!.title}`);
    expect(body).toContain(`https://decdn.org/blog/${meta.slug}/`);
    expect(body).toContain(post!.body.trim());
  });

  it.each(LEGAL_SLUGS)("embeds the %s document whole", (slug) => {
    const doc = getLegalDoc(slug);
    expect(lines).toContain(`### ${doc.title}`);
    expect(body).toContain(`https://decdn.org/legal/${slug}/`);
    expect(body).toContain(doc.body);
  });
});

describe("assertNoTopLevelHeading", () => {
  it("returns a safe body unchanged", () => {
    const safe = "## A section\n\nSome prose about #1 and #tag.";
    expect(assertNoTopLevelHeading(safe, "post foo")).toBe(safe);
  });

  it.each([
    { name: "a leading", value: "# Title\n\nprose" },
    { name: "a mid-body", value: "prose\n\n# Title\n\nmore" },
  ])("throws with field context on $name top-level heading", ({ value }) => {
    expect(() => assertNoTopLevelHeading(value, "post foo")).toThrow(
      /post foo/,
    );
  });

  // `#1` and `#tag` are ordinary prose, not headings — the space is what makes
  // a heading, and rejecting them would fail the build on a valid post.
  it.each(["#1 in the series", "tagged #tag here", "prose\n#nothashheading"])(
    "allows %j",
    (value) => {
      expect(() => assertNoTopLevelHeading(value, "post foo")).not.toThrow();
    },
  );
});

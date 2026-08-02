// The site's prose, as plain data.
//
// Two consumers need this copy as strings rather than as JSX: the comparison
// table maps over COMPARE_ROWS instead of hand-writing a row per axis, and
// app/llms-full.txt/route.ts serialises the same sentences as markdown. A
// component holding its own prose would drift from the mirror the first time
// someone edited a sentence, so the prose lives here and the components read
// it.
//
// Scope, stated precisely because "homepage copy" is not quite right in either
// direction: SITE_TITLE/SITE_DESCRIPTION are root-layout metadata and schema
// node descriptions, BLOG_TITLE/BLOG_DESCRIPTION belong to /blog/, and the FAQ
// question-and-answer pairs live in lib/faq.ts rather than here because
// `faqPageNode` in lib/schema.ts consumes them as structured data, not as
// prose. Everything the homepage *renders* is here; not everything here is
// rendered by the homepage.
//
// Plain strings only — no JSX, because the mirror emits them as text. Where a
// sentence names the product, write `deCDN` and let `highlightBrand`
// (components/ui/brand.tsx) wrap it at render time; the mirror takes the same
// string verbatim.

export const SITE_TITLE = "deCDN — decentralized CDN for bytes at scale";
export const SITE_DESCRIPTION =
  "A decentralized CDN. Anyone can serve bytes; clients pay per megabyte in USDC. An open market that gets cheaper as it grows, at ~$0.01/GB, up to 90% below legacy CDN list pricing.";

/** The three h1 lines, each its own span — lines 2 and 3 carry their own
 *  indent and line 2 an aria-hidden full stop, so they stay explicit at the
 *  call site rather than being mapped over. */
export const HERO_HEADLINE = [
  "the delivery layer",
  "anyone can serve",
  "priced, not quoted.",
] as const;

export const HERO_LEAD =
  "the first bytes of a 14-gigabyte file posted in berlin reach a client in tokyo in under a second. the client streams from three peers at once, verifies every chunk with blake3, and pays per megabyte in usdc — whether the payload is a linux iso, a dataset, a game patch, a media library, or an ai model. deCDN is demand-shaped, locality-optimised delivery for large files at scale: supply forms around demand, cost collapses as regional traffic concentrates. the code is open. the network is open. the price is posted.";

/** A label/value pair rendered by `components/ui/Figure`. Named `FigureCopy`
 *  rather than `Figure` so a call site can import both the copy and the
 *  component without aliasing.
 *
 *  These were inline JSX attributes until they turned out to be the one part
 *  of the homepage the llms-full.txt mirror restated by hand — the mirror said
 *  "settlement per-MB in USDC · gas overhead under 1%" while the page rendered
 *  "per-MB · usdc" and "<1%". Both now serialise from this array. */
export type FigureCopy = { label: string; value: string };

/** The stat strip under the hero CTAs. */
export const HERO_FIGURES = [
  { label: "target price", value: "$0.01/GB" },
  { label: "p50 latency", value: "50–100 ms" },
  { label: "settlement", value: "per-MB · usdc" },
  { label: "gas overhead", value: "<1%" },
] as const satisfies readonly FigureCopy[];

export const COMPARE_HEADLINE = [
  "information scaled.",
  "supply didn't.",
] as const;

export const COMPARE_LEAD =
  "the pattern repeats whenever something big ships: mirrors fork, cdns rate-limit, small teams burn tens of thousands hosting bytes they don't own. deCDN inverts every axis — supply forms around demand, not allocated to it.";

export type CompareRow = {
  /** Row header — the `<th scope="row">` text. */
  axis: string;
  traditional: string;
  decdn: string;
  /** The price row: display-size typography, legacy value struck through.
   *  Exactly one row carries it, and it must be the first row — the reveal
   *  cascade in components/site/Compare.tsx is keyed on array position, not on
   *  this flag. lib/copy.test.ts pins both halves. */
  emphasis?: true;
};

/** The seven axes the Compare section header promises in prose. Order is the
 *  render order; `price` leads because it is the claim everything else
 *  qualifies.
 *
 *  `as const satisfies` rather than a plain annotation: the annotation widened
 *  `.length` to `number` and the axis names to `string`, which is what let
 *  components/site/Compare.tsx index the last axis without the compiler
 *  knowing the array is non-empty. */
export const COMPARE_ROWS = [
  {
    axis: "price",
    traditional: "$0.04–$0.20 /GB",
    decdn: "$0.01 /GB",
    emphasis: true,
  },
  {
    axis: "delivery",
    traditional: "fixed provisioning",
    decdn: "demand-shaped mesh",
  },
  {
    axis: "billing",
    traditional: "monthly minimums, annual contracts",
    decdn: "per megabyte, in usdc",
  },
  {
    axis: "operators",
    traditional: "three hyperscalers",
    decdn: "home labs to datacenters",
  },
  {
    axis: "integrity",
    traditional: "trust the origin",
    decdn: "blake3, verify every chunk",
  },
  {
    axis: "failure",
    traditional: "pop dies, region 503s",
    decdn: "peer drops, stream continues",
  },
  {
    axis: "scaling",
    traditional: "gets more expensive",
    decdn: "gets cheaper",
  },
] as const satisfies readonly CompareRow[];

/** The axis names, as a union — `COMPARE_ROWS` is `as const`, so this stays in
 *  step with the rows without being restated. */
export type Axis = (typeof COMPARE_ROWS)[number]["axis"];

export type MethodStep = {
  /** Zero-padded ordinal shown in the leading column. */
  n: string;
  word: string;
  body: string;
};

export const METHOD_STEPS: readonly MethodStep[] = [
  {
    n: "01",
    word: "probe",
    body: "in a single handshake, the client asks nearby peers who has the file. peers answer with what they've cached, their rate per megabyte, and how fast they can serve — the roundtrip averages under 100 milliseconds. the client ranks the answers by price, latency, and reputation; the best-priced, fastest, most-reputable peer wins, or several win in parallel for a large file.",
  },
  {
    n: "02",
    word: "swarm",
    body: "bytes flow directly from the chosen node; for files over ten gigabytes the client opens parallel streams to several peers at once and aggregates their throughput — a 1 gbps origin turns into multi-gigabit delivery to the client. every chunk is verified against the blake3 tree hash the instant it lands; tampered bytes trigger immediate disconnect and a fraud proof against the node's stake. trust no node — verify every byte.",
  },
  {
    n: "03",
    word: "settle",
    body: "you pay per megabyte in usdc, automatically, as the bytes arrive — no monthly invoice, no subscription, no whole-file minimum. pay for what you pulled, nothing more.",
  },
];

/** The stack chips under the method steps, rendered with an aria-hidden `·`
 *  between each. Order is the render order. */
export const STACK = ["blake3", "quic", "iroh", "usdc", "evm"] as const;

/** The stat strip beside the stack chips. */
export const METHOD_FIGURES = [
  { label: "language", value: "rust" },
  { label: "transport", value: "quic / iroh" },
  { label: "settlement", value: "chain-agnostic" },
  { label: "currency", value: "usdc · token" },
] as const satisfies readonly FigureCopy[];

/** The target price, as the page and both machine surfaces quote it. */
export const TARGET_RATE = "$0.01/GB";

/**
 * Protocol status and the target-rate hedge, as one block.
 *
 * Both llms.txt and llms-full.txt open with this, differing only in how they
 * refer to the surface the figure is quoted on — so `scope` is the parameter
 * and the claim itself is written once. `serviceNode` in lib/schema.ts carries
 * the same hedge in a different sentence order, because there it is an
 * `Offer`'s `description` rather than prose; if the claim changes, change it
 * in both.
 */
export const statusBlock = (scope: string): string =>
  `Status: testnet v0. The protocol runs end-to-end in a test environment; a public testnet and the open-source release are targeted for Q3 2026. The ${TARGET_RATE} figure quoted ${scope} is a public target rate, not a protocol-enforced price.`;

/**
 * The hedges on the two homepage demo widgets.
 *
 * `aria-hidden` hides the invented figures from assistive tech but does
 * nothing to text extractors, so each panel's caption has to sit outside the
 * hidden subtree and say the numbers are samples. They live here rather than
 * inline so components/ui/DemoFigure.tsx's structural test covers the text
 * too, and so a build-output check can grep for them.
 *
 * Deliberately absent from the llms-full.txt mirror: it excludes the widgets
 * entirely, so there is nothing there for these to caption.
 */
export const DEMO_CAPTIONS = {
  terminal:
    "Illustrative deCDN fetch session. The BLAKE3 hash, peer identifiers, peer count, latency, payload size, chunk count, settled amount, and duration shown are sample values for demonstration, not live network telemetry. See the disclaimer at /legal/disclaimer/ for forward-looking statements.",
  fleet:
    "Illustrative deCDN fleet dashboard. The node identifiers, per-node rates, and aggregate throughput and revenue figures shown are sample values for demonstration, not live network telemetry. See the disclaimer at /legal/disclaimer/ for forward-looking statements.",
} as const;

/** Blog index identity. Read by app/blog/page.tsx for its metadata, by
 *  `blogNode` for the `Blog` schema node, and by the llms.txt index — one
 *  string so the three can't disagree about what the section is. */
export const BLOG_TITLE = "field notes";
export const BLOG_DESCRIPTION = "long-form posts on the deCDN protocol.";

export const CONTACT_LEAD =
  "the network is open. so is our inbox. write us with questions, partnerships, or anything you'd run on a fleet of idle machines. we read everything.";

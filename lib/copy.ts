// Every string the homepage renders, as plain data.
//
// Two consumers need this copy as strings rather than as JSX: the comparison
// table maps over COMPARE_ROWS instead of hand-writing a row per axis, and
// app/llms-full.txt/route.ts serialises the same sentences as markdown. A
// component holding its own prose would drift from the mirror the first time
// someone edited a sentence, so the prose lives here and the components read
// it.
//
// Plain strings only — no JSX, because the mirror emits them as text. Where a
// sentence names the product, write `deCDN` and let `highlightBrand`
// (components/ui/brand.tsx) wrap it at render time; the mirror takes the same
// string verbatim.

export const SITE_TITLE = "deCDN — decentralized CDN for bytes at scale";
export const SITE_DESCRIPTION =
  "A decentralized CDN. Anyone can serve bytes; clients pay per megabyte in USDC. An open market that gets cheaper as it grows, at ~$0.01/GB, up to 90% below legacy CDN list pricing.";

/** The three h1 lines, each its own span — every line carries its own indent
 *  and line 2 an aria-hidden full stop, so they stay explicit at the call
 *  site rather than being mapped over. */
export const HERO_HEADLINE = [
  "the delivery layer",
  "anyone can serve",
  "priced, not quoted.",
] as const;

export const HERO_LEAD =
  "the first bytes of a 14-gigabyte file posted in berlin reach a client in tokyo in under a second. the client streams from three peers at once, verifies every chunk with blake3, and pays per megabyte in usdc — whether the payload is a linux iso, a dataset, a game patch, a media library, or an ai model. deCDN is demand-shaped, locality-optimised delivery for large files at scale: supply forms around demand, cost collapses as regional traffic concentrates. the code is open. the network is open. the price is posted.";

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
   *  Exactly one row carries it. */
  emphasis?: true;
};

/** The seven axes the Compare section header promises in prose. Order is the
 *  render order; `price` leads because it is the claim everything else
 *  qualifies. */
export const COMPARE_ROWS: readonly CompareRow[] = [
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
];

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

export const CONTACT_LEAD =
  "the network is open. so is our inbox. write us with questions, partnerships, or anything you'd run on a fleet of idle machines. we read everything.";

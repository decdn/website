import { TARGET_RATE } from "./copy";
import { EMAIL } from "./links";

/** One question and its answer. The answer is a list of paragraphs: the
 *  homepage renders each as its own <p>, llms-full.txt separates them with a
 *  blank line, and the FAQPage JSON-LD joins them with a space. */
export type FaqEntry = { q: string; a: readonly string[] };

export const FAQ_ITEMS = [
  {
    q: "How do I put my files on deCDN?",
    a: [
      "Set up origin nodes in front of your own storage, whether that is an S3-compatible bucket, an NFS mount or a local disk, and join the network. Your files stay where they are.",
      `Once you get approved, the rest of the network accepts your nodes as origins and caches your content as your users ask for it. To get started, write to us at ${EMAIL}.`,
    ],
  },
  {
    q: "I already have a bucket in S3, R2 or B2. Why add deCDN?",
    a: [
      "Keep the bucket. It becomes the origin behind deCDN, read only on a cache miss and never exposed to the network, so you stop paying its egress on every download.",
      "Your files are served instead by many independent operators close to your users, large files from several of them at once, and when a node drops the download carries on from the next one. Operators compete on every request, so an open market sets your delivery price rather than one vendor's egress rates.",
    ],
  },
  {
    q: "How do my users download?",
    a: [
      "Through your own app. You build downloads into it with the deCDN client SDK, and your users never have to know deCDN is there.",
      "The SDK pulls each file from several nodes at once, checks every piece as it arrives, and picks up where it left off if the connection drops. It runs on macOS, Linux and Windows today, and we are testing phone and browser support.",
    ],
  },
  {
    q: "Do my users need a wallet or crypto?",
    a: [
      "No. You fund a USDC pool and your users download from it, with no wallet, no token and no sign-up.",
      "Each user gets their own allowance, so they can only spend as much as you allow them, and only you can top up or close the pool. The testnet download on this page works the same way.",
    ],
  },
  {
    q: "Who sets the price, and what will I pay?",
    a: [
      "Each node sets its own per-megabyte rate in USDC and signs it into every quote, so you see the price before a byte moves. A node that charges more than it quoted loses part of its bond.",
      `You never pay more than the ceiling you set, and you pay only for bytes that verify, as they arrive, with no minimums or contracts. The network's target is ${TARGET_RATE}.`,
    ],
  },
  {
    q: "What stops illegal content, and what if a file is flagged by mistake?",
    a: [
      "Governance keeps a public, on-chain blacklist of content hashes, network-wide or for a single region. Nodes have 24 hours to stop serving a listed hash, and repeated offenses result in removal from the network.",
      "Every entry is public, so a wrongful one is visible to anyone, and governance can lift it.",
    ],
  },
] as const satisfies readonly FaqEntry[];

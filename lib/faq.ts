import { TARGET_RATE } from "./copy";
import { EMAIL } from "./links";

/** One question and its answer. The answer is a list of paragraphs: the
 *  homepage renders each as its own <p>, llms-full.txt separates them with a
 *  blank line, and the FAQPage JSON-LD joins them with a space. */
export type FaqEntry = { q: string; a: readonly string[] };

export const FAQ_ITEMS = [
  {
    q: "What is deCDN?",
    a: [
      "deCDN is a decentralized content delivery network for large files such as AI models, datasets, Linux images and video. Independent operators run the nodes, post a bond to join, and earn USDC for every megabyte they deliver.",
      "Your files stay in the storage you already use. Clients download each file from several nodes at once and check every chunk against its BLAKE3 hash, so altered bytes are rejected and a node that drops out doesn't stop the download.",
    ],
  },
  {
    q: "How is deCDN different from IPFS or Filecoin?",
    a: [
      "IPFS and Filecoin are built around storing data. deCDN doesn't store your files, it serves them: your origin stays in S3, R2, B2, NFS or a local disk, and nodes cache only what your users actually request.",
      "Delivery is a paid market. Nodes quote a per-megabyte price in USDC and compete for every request, so popular content stays cached because serving it pays, not because volunteers keep it around.",
    ],
  },
  {
    q: "Is deCDN peer-to-peer?",
    a: [
      "Not in the BitTorrent or browser sense. Your users only download: their devices never upload, serve or store anything for anyone else.",
      "The nodes are servers run by operators who have posted a bond. They talk to each other over a peer-to-peer QUIC mesh, so a node that doesn't have a file can pull it from another node and pay for it.",
    ],
  },
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
  {
    q: "Is deCDN censorship-resistant?",
    a: [
      "No, and it isn't designed to be. Governance can add a content hash to the on-chain blacklist, and nodes have 24 hours to stop serving it.",
      "What deCDN does avoid is a single point of failure: no one company runs delivery, and a download keeps going when individual nodes drop out.",
    ],
  },
  {
    q: "Is deCDN live?",
    a: [
      "A public testnet has been running on Arbitrum Sepolia since October 13, 2026, and the code is open source. You can download a real file from it today with the commands on this page.",
      `Testnet figures are not production guarantees, and ${TARGET_RATE} is a public target rate, not a price the protocol enforces.`,
    ],
  },
] as const satisfies readonly FaqEntry[];

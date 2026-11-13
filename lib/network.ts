// Copy for the /network/ explainer, as plain data. Every claim here traces
// to an ADR or doc in the decdn repo; each topic names its source in `src`.
// lib/network.test.ts holds the cross-references (related topics, tour
// steps, tiles) to topics that exist, and keeps every tour step to one line.

export type Hue = "clients" | "net" | "data" | "pay" | "gov" | "brand";

export const TOPIC_IDS = [
  "roles",
  "clients",
  "sdk",
  "http",
  "gateway",
  "network",
  "iroh",
  "cache",
  "dht",
  "origin",
  "data",
  "storage",
  "governance",
  "publishers",
  "staking",
  "blacklist",
  "voting",
  "payment",
  "pool",
  "vouchers",
  "feerouter",
  "sponsor",
] as const;
export type TopicId = (typeof TOPIC_IDS)[number];

export type Topic = {
  hue: Hue;
  eyebrow: string;
  title: string;
  summary: string;
  body: readonly string[];
  facts: readonly (readonly [string, string])[];
  related: readonly TopicId[];
  source: string;
};

export type Role = { name: string; does: string; uses: string };

export const NETWORK_TITLE = "Network layers";
export const NETWORK_HEADLINE = "how deCDN moves content";
export const NETWORK_DESCRIPTION =
  "How deCDN moves content: clients, a delivery network of bonded nodes and each publisher's own storage, with governance and payment reaching every layer.";
export const NETWORK_LEGEND =
  "Arrows show verified bytes moving up. Requests and payment run the other way.";

export const ROLES: readonly Role[] = [
  {
    name: "Downloader",
    does: "Fetches content with an SDK app or through a gateway. Pays only for bytes it has verified.",
    uses: "clients · payment",
  },
  {
    name: "Gateway operator",
    does: "Runs a gateway, funds its pool and serves HTTP to browsers and scripts.",
    uses: "clients · payment",
  },
  {
    name: "Node operator",
    does: "Bonds TOKEN, caches content and earns USDC per MB delivered. Votes with the bytes it served.",
    uses: "delivery · payment · governance",
  },
  {
    name: "Publisher",
    does: "Keeps content in its own storage, seats origin operators for its namespaces and can pay for its users' downloads.",
    uses: "data · governance · payment",
  },
  {
    name: "Origin operator",
    does: "A node operator seated by a publisher, connected to that publisher's storage.",
    uses: "delivery · data · governance",
  },
  {
    name: "Governance",
    does: "Vets publishers, sets bond and fee parameters inside hardcoded bounds, and keeps the blacklist.",
    uses: "governance",
  },
];

export const TOPICS: Record<TopicId, Topic> = {
  roles: {
    hue: "brand",
    eyebrow: "Overview",
    title: "Who takes part",
    summary:
      "Content flows up through three layers: clients who fetch it, a delivery network that caches and moves it, and each publisher's own data layer where it starts. Governance and payment run beside them and reach every layer.",
    body: [],
    facts: [],
    related: ["clients", "network", "data", "governance", "payment"],
    source: "Architecture overview",
  },
  clients: {
    hue: "clients",
    eyebrow: "Layer 1",
    title: "Clients",
    summary:
      "Anyone who wants bytes. Clients check every byte against its hash and pay per MB.",
    body: [
      "There are two ways in. An app built on the deCDN SDK speaks iroh to nodes directly. Anything else, such as a browser, curl or a script, speaks HTTP to a gateway, and the gateway is the client on the network side.",
      "A client probes candidate nodes, picks the one with the lowest measured latency and streams from it. If a node refuses or stalls, the client moves on to another.",
    ],
    facts: [
      ["Pays with", "USDC vouchers, per MB"],
      ["Verifies", "BLAKE3, chunk by chunk"],
      ["Picks nodes by", "measured round-trip time"],
    ],
    related: ["sdk", "gateway", "http", "vouchers"],
    source: "ADR 012 · ADR 037",
  },
  sdk: {
    hue: "clients",
    eyebrow: "Client · direct",
    title: "SDK apps",
    summary: "Native apps that join the network themselves.",
    body: [
      "decdn-client is the Rust SDK behind the decdn CLI and the Android and iOS demo apps. It probes nodes, opens a paid stream to the nearest one and verifies each chunk as it lands.",
      "It signs a voucher for each MiB it has verified, so it never pays for bytes it has not checked.",
    ],
    facts: [
      ["Protocol", "iroh QUIC · cdn/client/v1"],
      ["Examples", "decdn get, Android and iOS demos"],
      ["Holds", "its own key and pool"],
    ],
    related: ["iroh", "cache", "vouchers"],
    source: "ADR 012 · ADR 038",
  },
  http: {
    hue: "clients",
    eyebrow: "Client · over HTTP",
    title: "Browsers, curl and scripts",
    summary:
      "Anything that speaks HTTP can fetch from deCDN through a gateway.",
    body: [
      "These clients hold no key and no USDC. They send GET /<hash> to a gateway and receive the bytes. A bundle of files can be served as a website on its own host name.",
      "The TypeScript and Python SDKs use this same HTTP contract, and a browser extension can rewrite decdn: links to a local gateway.",
    ],
    facts: [
      ["Request", "GET /<hash>[/<path>]"],
      ["Needs", "no wallet, no binary"],
      ["SDKs", "@decdn/client, decdn (PyPI)"],
    ],
    related: ["gateway", "sponsor"],
    source: "Appendix: Public HTTP Gateway",
  },
  gateway: {
    hue: "clients",
    eyebrow: "Client · HTTP bridge",
    title: "Gateways",
    summary: "A gateway is a paying client that serves HTTP.",
    body: [
      "On one side a gateway answers HTTP. On the other it is an ordinary deCDN client: it picks nodes, pays them per MB and verifies the bytes. Nodes see normal paid pulls.",
      "A local gateway runs on your own machine next to a browser extension. A public gateway pays from its operator's pool and caps what it spends with a daily byte allowance.",
    ],
    facts: [
      ["Command", "decdn gateway"],
      ["Default port", "8484"],
      ["Paid by", "the gateway operator's pool"],
    ],
    related: ["http", "iroh", "pool"],
    source: "Appendix: Public HTTP Gateway",
  },
  network: {
    hue: "net",
    eyebrow: "Layer 2 · transport and delivery",
    title: "Delivery network",
    summary:
      "Bonded nodes that cache content and move it between each other over iroh.",
    body: [
      "Every node posts a capacity bond, joins the peer mesh and competes on price and latency. A node serves from its cache. On a miss it finds another holder and pulls the bytes, paying for them like any other client.",
      "Every byte that moves is paid, client to node and node to node. Popular content spreads to where demand is, because each pull leaves a cached copy behind.",
    ],
    facts: [
      ["Protocols", "cdn/probe/v1 · cdn/client/v1 · cdn/dht/v1"],
      ["Entry", "open to anyone who bonds"],
      ["Transport", "iroh QUIC"],
    ],
    related: ["iroh", "cache", "origin", "dht", "staking"],
    source: "ADR 001 · ADR 005",
  },
  iroh: {
    hue: "net",
    eyebrow: "Delivery · transport",
    title: "iroh QUIC",
    summary:
      "Encrypted QUIC links between any two peers, addressed by public key.",
    body: [
      "iroh connects nodes and clients by NodeId, an ed25519 public key, so a peer keeps its identity when its IP address changes. It punches through NATs and falls back to stateless relays when a direct path fails.",
      "Relays only forward encrypted traffic. They cannot read, cache or change content.",
    ],
    facts: [
      ["Identity", "ed25519 NodeId"],
      ["Encryption", "end to end, QUIC/TLS"],
      ["Fallback", "stateless relays"],
    ],
    related: ["cache", "sdk", "gateway"],
    source: "ADR 000 · ADR 001",
  },
  cache: {
    hue: "net",
    eyebrow: "Delivery · open to any bonded operator",
    title: "Cache nodes",
    summary: "Any bonded operator can cache content and serve it for a fee.",
    body: [
      "A cache node serves the blobs it already holds. On a miss it looks up holders in the DHT, probes them and pulls from the best one over a paid stream, then caches the result.",
      "A client that finds only distant holders can route through a nearby node, which fills its cache on the way. That is how copies spread toward demand without anyone prewarming them.",
    ],
    facts: [
      ["Earns", "USDC per MB served"],
      ["Pays", "upstream nodes on a miss"],
      ["Bond", "sized to declared capacity"],
    ],
    related: ["dht", "origin", "vouchers", "staking"],
    source: "ADR 022 · ADR 037 · ADR 040",
  },
  dht: {
    hue: "net",
    eyebrow: "Delivery · discovery",
    title: "DHT",
    summary:
      "A Kademlia table that maps content hashes to the nodes holding them.",
    body: [
      "Nodes publish signed provider records into cdn/dht/v1. Only bonded peers enter the routing table, which keeps it hard to flood or poison.",
      "When the DHT has no holder for every part of a blob, the on-chain origin directory is the last resort. It always points at the publisher's origin nodes.",
    ],
    facts: [
      ["Protocol", "cdn/dht/v1"],
      ["Records", "signed by the provider"],
      ["Fallback", "on-chain origin directory"],
    ],
    related: ["cache", "origin"],
    source: "ADR 022",
  },
  origin: {
    hue: "net",
    eyebrow: "Delivery · seated by a publisher",
    title: "Origin nodes",
    summary:
      "Delivery nodes connected to a publisher's storage, the canonical source for that publisher's content.",
    body: [
      "An origin node is a delivery node with an origin backend configured. On a cache miss it reads the bytes from the publisher's storage and serves them into the network.",
      "The storage address stays private. Clients and other nodes only ever see a hash and a NodeId. A publisher seats its own origin operators for each namespace on-chain, and a node that configures a backend without that seat serves its bytes as an ordinary cache.",
    ],
    facts: [
      ["Seated through", "OriginAssignment"],
      ["Backend", "private, per-node config"],
      ["Read", "only on a cache miss"],
    ],
    related: ["storage", "publishers", "dht"],
    source: "ADR 002 · ADR 011",
  },
  data: {
    hue: "data",
    eyebrow: "Layer 3 · one per publisher",
    title: "Data layer",
    summary: "Each publisher keeps its content in storage it already runs.",
    body: [
      "Every publisher has its own data layer. It connects to the network only through that publisher's origin nodes.",
      "The protocol asks one thing of it: deliver the correct bytes for a given hash. Content is addressed by its BLAKE3 hash, so every copy anywhere in the network can be checked against it.",
    ],
    facts: [
      ["Addressing", "BLAKE3"],
      ["Read by", "the publisher's origin nodes"],
      ["Exposed URL", "none"],
    ],
    related: ["storage", "origin", "publishers"],
    source: "ADR 002",
  },
  storage: {
    hue: "data",
    eyebrow: "Data · origin backends",
    title: "Publisher storage",
    summary: "A filesystem, an S3-compatible object store or an HTTP server.",
    body: [
      "An origin node reads from a local or NFS-mounted directory, any S3-compatible store (AWS S3, Cloudflare R2, Backblaze B2, MinIO) or an HTTP server.",
      "decdn origin import prepares content: it stores each blob next to a verification outboard, so nodes can stream any byte range and prove it matches the hash.",
    ],
    facts: [
      ["Backends", "filesystem, S3, R2, B2, MinIO, HTTP"],
      ["Prepared with", "decdn origin import"],
    ],
    related: ["origin", "data"],
    source: "ADR 038 · Architecture overview",
  },
  governance: {
    hue: "gov",
    eyebrow: "Open to every layer",
    title: "Governance",
    summary:
      "On-chain rules that decide who may take part and what may be served.",
    body: [
      "Governance sits beside the stack because its rules reach every layer, and anyone can read them on the chain. It vets publishers and their origins, sets the bond that delivery nodes post and keeps the content blacklist.",
      "Every governable parameter has a hardcoded safety range, so no vote can push fees to 100% or a bond to zero.",
    ],
    facts: [
      ["Chain", "an EVM blockchain"],
      ["Decides", "origins, bonds, fees, blacklist"],
      ["Bounds", "hardcoded per parameter"],
    ],
    related: ["publishers", "staking", "blacklist", "voting"],
    source: "ADR 009 · ADR 016",
  },
  publishers: {
    hue: "gov",
    eyebrow: "Governance · data layer access",
    title: "Publishers and origins",
    summary:
      "Governance vets a publisher once. The publisher then seats its own origin operators.",
    body: [
      "PublisherRegistry records vetted publisher wallets. Each vetted publisher owns namespaces, and through OriginAssignment it names the operators that act as origin for each one.",
      "Content published without a namespace has no authorized origins. Caching stays open to every bonded node either way.",
    ],
    facts: [
      ["Contracts", "PublisherRegistry · OriginAssignment"],
      ["Governs", "data layer, origin nodes"],
    ],
    related: ["origin", "data", "voting"],
    source: "ADR 002 · ADR 011",
  },
  staking: {
    hue: "gov",
    eyebrow: "Governance · who delivers",
    title: "Staking",
    summary: "Every node posts a TOKEN bond sized to the capacity it declares.",
    body: [
      "CapacityBond is the node registry. A node registers by bonding bond = k × Mbps^α and proving it controls its NodeId, so every active node is slashable from its first byte.",
      "Slashing covers provable offenses: charging more than a signed quote, or serving blacklisted content after the compliance window.",
    ],
    facts: [
      ["Contract", "CapacityBond"],
      ["Curve", "bond = k × Mbps^α"],
      ["Governs", "delivery network"],
    ],
    related: ["cache", "origin", "blacklist", "voting"],
    source: "ADR 014 · ADR 026",
  },
  blacklist: {
    hue: "gov",
    eyebrow: "Governance · what may be served",
    title: "Content blacklist",
    summary: "An on-chain list of hashes that nodes must stop serving.",
    body: [
      "Payment never looks at content. Compliance comes from ContentBlacklist instead: governance and regional bodies list hashes, with an emergency fast path for urgent cases.",
      "After the compliance window, serving a listed hash is slashable. A slashed operator can appeal within 30 days, and a wrongful entry comes off through the ordinary removal path.",
    ],
    facts: [
      ["Contracts", "ContentBlacklist · SlashJudge · SlashAppeal"],
      ["Scope", "global or regional"],
      ["Appeal window", "30 days"],
    ],
    related: ["staking", "cache"],
    source: "ADR 011 · ADR 028",
  },
  voting: {
    hue: "gov",
    eyebrow: "Governance · the DAO",
    title: "Voting",
    summary: "Operators vote with weight earned by the bytes they served.",
    body: [
      "DecdnGovernor weighs each operator's vote by the bytes it served over a trailing window, ramped by age and capped at 5% of the total. A slash zeroes that weight for a while.",
      "Passed changes wait in a 48-hour Timelock before they apply. Control moves from an admin key to a multisig, then to the Governor once the operator set is broad enough.",
    ],
    facts: [
      ["Contracts", "DecdnGovernor · Timelock"],
      ["Weight", "served bytes × age ramp"],
      ["Cap", "5% per operator"],
    ],
    related: ["feerouter", "staking"],
    source: "ADR 009 · ADR 036",
  },
  payment: {
    hue: "pay",
    eyebrow: "Open to every layer",
    title: "Payment",
    summary:
      "USDC moves from whoever downloads to whoever delivers, per MB, mostly off-chain.",
    body: [
      "Payment sits beside the stack because every participant uses it. Clients and gateways fund pools, nodes pay each other on a miss, and publishers can pay for their users.",
      "One on-chain deposit backs many payments, and each MiB is paid with an off-chain voucher. The chain is touched only to fund a pool and to redeem. Payment is content-agnostic: it carries amounts, never content gates.",
    ],
    facts: [
      ["Currency", "USDC"],
      ["Unit", "1 MiB"],
      ["On-chain", "fund and redeem only"],
    ],
    related: ["pool", "vouchers", "feerouter", "sponsor"],
    source: "ADR 003",
  },
  pool: {
    hue: "pay",
    eyebrow: "Payment · contract",
    title: "PaymentPool",
    summary: "One USDC deposit backs many nodes and many signers.",
    body: [
      "A buyer deposits USDC once. The pool authorizes signers with spending caps, and each signer pays any node with vouchers addressed to that node. Nodes redeem on-chain, per lane, when they choose.",
      "The owner can reclaim unspent funds only after a grace window, so a node always has time to redeem what it earned.",
    ],
    facts: [
      ["Contract", "PaymentPool"],
      ["Grace window", "48 h"],
      ["Funded by", "clients, gateways, publishers, nodes"],
    ],
    related: ["vouchers", "feerouter", "sponsor"],
    source: "ADR 003",
  },
  vouchers: {
    hue: "pay",
    eyebrow: "Payment · off-chain",
    title: "Vouchers",
    summary: "Signed IOUs that grow one MiB at a time.",
    body: [
      "As verified bytes arrive, the client signs a voucher carrying the total amount it owes that node. The node keeps only the latest one, and a replayed voucher pays nothing.",
      "A node sends only a small window ahead of payment, and a client never pays for bytes it has not verified. Neither side can lose more than that window.",
    ],
    facts: [
      ["Interval", "1 MiB"],
      ["Amount", "cumulative"],
      ["Replay", "pays 0"],
    ],
    related: ["pool", "sdk", "cache"],
    source: "ADR 003",
  },
  feerouter: {
    hue: "pay",
    eyebrow: "Payment · settlement",
    title: "FeeRouter",
    summary:
      "Splits every redemption between the operator, buyback and the treasury.",
    body: [
      "When a node redeems, FeeRouter splits the USDC in the same transaction. At launch 90% goes to the operator and 10% to the treasury. Governance can switch on the buyback bucket, which moves the split to 60% operator, 30% buyback and burn, 10% treasury.",
      "FeeRouter also counts the bytes each operator served. Those counts are the vote weights in governance.",
    ],
    facts: [
      ["Launch split", "90 / 0 / 10"],
      ["Target split", "60 / 30 / 10"],
      ["Also counts", "bytes served per operator"],
    ],
    related: ["pool", "voting"],
    source: "ADR 026 · ADR 036",
  },
  sponsor: {
    hue: "pay",
    eyebrow: "Payment · publisher pays",
    title: "Sponsorship",
    summary: "A publisher can pay for its users' downloads.",
    body: [
      "sponsord lets a publisher run one pool and hand each user a signed download capability. The user's client pays from the publisher's pool within limits the publisher sets, so the user needs no wallet and no USDC.",
      "The publisher decides who qualifies: any user it has authenticated can be sponsored, through the publisher's own sign-in or its onramp page. The capability is tied to the user's key, capped and time-limited.",
    ],
    facts: [
      ["Daemon", "sponsord"],
      ["Onramp", "sponsord-onramp"],
      ["User needs", "no wallet"],
    ],
    related: ["pool", "http", "sdk"],
    source: "docs/sponsord",
  },
};

/** One box on the map. `span` widens it across the layer's four columns. */
export type Tile = {
  topic: TopicId;
  label: string;
  detail: string;
  tag?: string;
  span?: 2 | 4;
  strip?: boolean;
};

export type Rail = {
  topic: "governance" | "payment";
  eyebrow: string;
  title: string;
  desc: string;
  tiles: readonly Tile[];
  foot: string;
};

export const GOVERNANCE_RAIL: Rail = {
  topic: "governance",
  eyebrow: "Open to every layer",
  title: "governance",
  desc: "On-chain rules for who takes part and what may be served.",
  tiles: [
    {
      topic: "publishers",
      label: "Publishers & origins",
      detail: "Who may act as origin",
      tag: "governs data",
    },
    {
      topic: "staking",
      label: "Staking",
      detail: "Bond to deliver",
      tag: "governs delivery",
    },
    {
      topic: "blacklist",
      label: "Content blacklist",
      detail: "Hashes nodes must drop",
      tag: "governs content",
    },
    {
      topic: "voting",
      label: "Voting",
      detail: "Weighted by bytes served",
      tag: "governs the rules",
    },
  ],
  foot: "EVM blockchain · read by anyone",
};

export const PAYMENT_RAIL: Rail = {
  topic: "payment",
  eyebrow: "Open to every layer",
  title: "payment",
  desc: "How money moves: USDC per MB, from whoever downloads to whoever delivers.",
  tiles: [
    {
      topic: "pool",
      label: "PaymentPool",
      detail: "One deposit, many payees",
      tag: "on-chain",
    },
    {
      topic: "vouchers",
      label: "Vouchers",
      detail: "Signed per verified MiB",
      tag: "off-chain",
    },
    {
      topic: "feerouter",
      label: "FeeRouter",
      detail: "Splits each redemption",
      tag: "on-chain",
    },
    {
      topic: "sponsor",
      label: "Sponsorship",
      detail: "Publishers pay for users",
      tag: "sponsord",
    },
  ],
  foot: "USDC · settled on an EVM blockchain",
};

export type Layer = {
  topic: "clients" | "network" | "data";
  hue: Hue;
  eyebrow: string;
  title: string;
  desc: string;
};

export const LAYERS: Record<Layer["topic"], Layer> = {
  clients: {
    topic: "clients",
    hue: "clients",
    eyebrow: "Layer 1",
    title: "clients",
    desc: "Anyone who fetches content. They verify every byte and pay per MB.",
  },
  network: {
    topic: "network",
    hue: "net",
    eyebrow: "Layer 2",
    title: "delivery network",
    desc: "Bonded nodes that cache content and move it between each other over iroh. Every byte is paid, node to node included.",
  },
  data: {
    topic: "data",
    hue: "data",
    eyebrow: "Layer 3",
    title: "data layer",
    desc: "Each publisher's own storage. One per publisher, hidden from the network.",
  },
};

export const CLIENT_TILES = {
  sdk: {
    topic: "sdk",
    label: "SDK apps",
    detail:
      "CLI, Android and iOS apps on decdn-client. Join the network directly.",
    tag: "iroh · pays nodes",
    span: 2,
  },
  http: {
    topic: "http",
    label: "Browsers, curl, scripts",
    detail: "Plain HTTP. No wallet needed.",
  },
  gateway: {
    topic: "gateway",
    label: "Gateways",
    detail: "A paying client that serves HTTP",
    tag: "iroh · pays nodes",
  },
} as const satisfies Record<string, Tile>;

export const NETWORK_TILES: readonly Tile[] = [
  {
    topic: "iroh",
    label: "iroh QUIC",
    detail: "Encrypted links between any two peers, by NodeId",
    span: 4,
    strip: true,
  },
  {
    topic: "cache",
    label: "Cache node",
    detail: "Serves what it holds, pulls on a miss",
    tag: "earns per MB",
  },
  {
    topic: "cache",
    label: "Cache node",
    detail: "Serves what it holds, pulls on a miss",
    tag: "earns per MB",
  },
  {
    topic: "origin",
    label: "Origin node",
    detail: "Seated by publisher A",
    tag: "source for A",
  },
  {
    topic: "origin",
    label: "Origin node",
    detail: "Seated by publisher B",
    tag: "source for B",
  },
  {
    topic: "dht",
    label: "DHT",
    detail: "Which node holds which hash",
    span: 2,
    strip: true,
  },
];

export const DATA_NOTE =
  "Only a publisher's origin nodes read from its storage. Everyone else sees a content hash.";

export const DATA_TILES: readonly Tile[] = [
  {
    topic: "storage",
    label: "Publisher A",
    detail: "Filesystem, S3",
    tag: "origin backend",
  },
  {
    topic: "storage",
    label: "Publisher B",
    detail: "R2, HTTP",
    tag: "origin backend",
  },
];

export type TourStep = { topics: readonly TopicId[]; text: string };
export type Tour = { name: string; button: string; steps: readonly TourStep[] };

export const TOUR_IDS = ["sponsored", "gateway", "self"] as const;
export type TourId = (typeof TOUR_IDS)[number];

/** Longest tour step, in characters, that still fits the tour bar on one line. */
export const TOUR_STEP_MAX = 76;

export const TOUR_HINT = "Walk through a download step by step. Pick who pays:";

export const TOURS: Record<TourId, Tour> = {
  sponsored: {
    name: "Publisher-funded p2p",
    button: "Publisher-funded p2p",
    steps: [
      {
        topics: ["sponsor", "pool"],
        text: "The publisher funds a PaymentPool and runs sponsord for its users.",
      },
      {
        topics: ["sponsor", "sdk"],
        text: "A user authenticates with the publisher, however the publisher chooses.",
      },
      {
        topics: ["sponsor", "pool"],
        text: "sponsord signs a capped capability to spend from the publisher's pool.",
      },
      {
        topics: ["sdk", "iroh", "cache"],
        text: "The user's app pulls peer to peer from nearby nodes over iroh.",
      },
      {
        topics: ["cache", "dht", "origin", "storage"],
        text: "On a miss, the DHT or the publisher's origin node supplies the bytes.",
      },
      {
        topics: ["sdk", "vouchers", "pool"],
        text: "The client verifies each MiB and pays a voucher from the publisher's pool.",
      },
      {
        topics: ["pool", "feerouter"],
        text: "Nodes redeem the vouchers, and FeeRouter splits each payment.",
      },
    ],
  },
  gateway: {
    name: "Through a gateway",
    button: "Through a gateway",
    steps: [
      {
        topics: ["http", "gateway"],
        text: "A browser sends GET /<hash> to a gateway over plain HTTP.",
      },
      {
        topics: ["gateway", "iroh", "cache"],
        text: "The gateway opens a paid stream to the fastest nearby node.",
      },
      {
        topics: ["cache", "dht"],
        text: "The node misses its cache and asks the DHT who holds the hash.",
      },
      {
        topics: ["origin", "storage", "publishers"],
        text: "Nobody has it yet, so the origin node reads the publisher's storage.",
      },
      {
        topics: ["origin", "cache", "gateway", "http", "vouchers"],
        text: "Bytes flow up. Each hop verifies them and pays a voucher per MiB.",
      },
      {
        topics: ["gateway", "pool", "feerouter"],
        text: "The gateway pays from its operator's pool, within a daily allowance.",
      },
    ],
  },
  self: {
    name: "Self-funded",
    button: "Self-funded",
    steps: [
      {
        topics: ["sdk", "pool"],
        text: "The user deposits USDC into their own PaymentPool, once.",
      },
      {
        topics: ["sdk", "iroh", "cache"],
        text: "The user's app opens a paid stream to the lowest-latency node.",
      },
      {
        topics: ["cache", "dht", "origin"],
        text: "On a miss, that node pays an upstream holder and keeps a copy.",
      },
      {
        topics: ["sdk", "vouchers"],
        text: "Each verified MiB costs one voucher, signed by the user's key.",
      },
      {
        topics: ["pool", "feerouter"],
        text: "Nodes redeem. The user tops up, or reclaims the rest after 48 h.",
      },
      {
        topics: ["staking", "blacklist", "voting"],
        text: "Every node is bonded, so breaking the rules costs it stake.",
      },
    ],
  },
};

export const isTopicId = (s: string): s is TopicId =>
  (TOPIC_IDS as readonly string[]).includes(s);

export const FAQ_ITEMS = [
  {
    q: "How do I join the testnet as a node operator?",
    a: "Onboarding is permissionless: anyone can bond, register and serve on the Arbitrum Sepolia testnet. It runs in four steps. First, prepare a server and keep its clock within 10 seconds of UTC. Second, bond TOKEN and register the node on-chain with its declared capacity, region and addresses; the same signature records your acceptance of the operator terms. Third, start the node, which loads the content blacklist and the node registry before it accepts any connection. From then on it is discoverable and earns USDC for what it delivers. The decdn setup command signs and submits the on-chain steps for you.",
  },
  {
    q: "What hardware and storage does a node need?",
    a: "The recommended starting server is 4 vCPU, 8 GB of RAM, a 1 TB SSD and 5 TB a month of egress. The protocol sets no hardware minimum. What it checks is the capacity you declare, from 10 Mbps up to 200 Gbps, which sets your bond. A 250 Mbps home or server node fits that profile comfortably. The disk is your cache, so more of it means more requests served from bytes you already hold.",
  },
  {
    q: "What operating system and deployment method do you currently recommend — native Linux, Docker, etc.?",
    a: "Linux. The node is a single program, decdn-node, and you can run it directly under systemd or in the official container image. The image carries the exact same binary, so pick whichever fits how you already run servers. Linux builds cover x86_64 and ARM64 and run on Debian 11, Ubuntu 20.04, RHEL 8 or anything newer. Release builds also exist for macOS and Windows. A separate decdn command-line tool handles setup, registration and day-to-day admin.",
  },
  {
    q: "How does the capacity bond work?",
    a: "Every node bonds TOKEN in proportion to the bandwidth it declares, following 12.6 × Mbps^1.2. There is also a network minimum that governance sets and never lowers below 10,000 TOKEN, and you bond whichever is larger. That is about 50,000 TOKEN at 1 Gbps. At 250 Mbps the curve gives about 9,500, below the minimum, so a 250 Mbps node bonds the minimum. The bond locks at registration and can be slashed for only two offenses: quoting a rate other than the one you signed, and serving blacklisted content after its compliance window. A bad delivery isn't slashed; it simply isn't paid. Withdrawing takes a 14-day unbonding period. Besides the bond, you hold a little ETH for gas. USDC is optional.",
  },
  {
    q: "How does the network choose my node, and will a new region get traffic?",
    a: "Registering is enough to make a node discoverable. Clients shortlist nodes in their own region and then rank them by measured round-trip time alone; price and reputation are not part of their ranking. A node fetching a cache miss from another node weighs price, latency and reputation together, and a newcomer starts at a neutral reputation. A region with no copies yet is where a first node counts most. A client whose only holders are far away routes its request through the nearest bonded node. That node pulls the content, serves it and keeps a copy, so it becomes the region's first local source and later clients find it directly. This applies to cache-only nodes; a node set to serve only its own origin declines these requests.",
  },
  {
    q: "How are operators paid, and what share do they keep?",
    a: "Operators are paid per byte actually delivered, in USDC. Clients sign vouchers only for bytes that verify. Your node redeems those vouchers on-chain, and your share arrives in the same transaction. Each operator sets its own per-MB rate, and the target client price is about $0.01/GB. At mainnet launch the split is 90% operator, 0% buyback and 10% treasury. Once governance confirms the activation criteria, it moves to the long-term 60/30/10, with 30% going to a TOKEN buyback-and-burn. Governance can never set the operator share below 40% or above 90%.",
  },
  {
    q: "Can I run a node from home?",
    a: "Yes. You don't need a static IP or a datacenter connection. At home the node usually sits behind a router, and it reaches peers by punching through NAT, with a relay as fallback, so no port forwarding is required. If you forward the node's UDP port, 4433 by default, and register that address, peers get a direct path to you. If your public address changes, run decdn node update-multiaddrs to update the registry. As on any node, keep the machine's clock in sync.",
  },
] as const;

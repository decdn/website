export const FAQ_ITEMS = [
  {
    q: "What about free-egress storage like Cloudflare R2 or Backblaze B2?",
    a: "It's real, and for a small project it's the right call. But that free egress is a revocable vendor arrangement, not a guarantee: R2 is Cloudflare's own loss-leader, repriceable at its discretion, and B2's free egress rides the Bandwidth Alliance, a pact among rivals that any member can exit. Either way you depend on one provider's roadmap, terms, and outage surface. deCDN is the opposite: an open market where operators set their own rates and compete for every request, so the price falls as the network grows, on capacity that's already paid for at the edge rather than in hyperscale datacenters. We don't claim to beat free on the egress line, and no token subsidy props up demand. Against the buyers paying a bill today, AWS CloudFront plus S3 at $0.04 to $0.20 per gigabyte list, we're materially cheaper: around $0.01/GB and trending down.",
  },
  {
    q: "How is byte-level integrity enforced?",
    a: "Every blob is BLAKE3-addressed, so the hash the client is asking for is the same hash they'll be checking on the way in. Verification happens chunk-by-chunk, in flight — mismatched bytes are dropped and the next peer on the list is asked instead. Peers that send garbage lose staked TOKEN via a non-custodial Merkle proof. There is no central arbiter; the math is the arbiter.",
  },
  {
    q: "Can content be gated or taken down?",
    a: "Both. For gating: upload ciphertext instead of plaintext — nodes cache the encrypted blob without ever seeing inside, and your app holds the keys, handing them to clients over a separate authenticated channel. Subscription, paywall, whatever logic fits. For takedown: governance can flag specific BLAKE3 hashes as non-servable, and nodes that keep serving them past a short compliance window lose staked TOKEN — slashing is on-chain, not a human call. Both the key gate and the flag list are auditable; compliance runs end-to-end, from origin onboarding to peer-level slashing, governance-owned and auditable throughout.",
  },
  {
    q: "Why does the network need a token?",
    a: "TOKEN secures the network — operators stake it to participate, and they lose it if they misbehave. Payments, though, happen in USDC, because operators want stable currency they can pay power bills with. Thirty percent of protocol fees flow into a Balancer V3 80/20 TOKEN/USDC buyback, tying token demand to network throughput.",
  },
  {
    q: "Can publishers pay on behalf of users?",
    a: "Yes. Account abstraction lets a publisher fund a payment channel for their audience, so users pull content with no wallet and no subscription — same free-to-download experience as a public mirror, except the publisher pays peers per megabyte instead of one cloud's egress bill. Default flow is client-pays; publisher-pays is the flag you flip when you want to ship widely without per-user payment friction.",
  },
] as const;

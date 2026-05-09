import { FaqItem } from "@/components/ui/FaqItem";
import { Frame } from "@/components/ui/Frame";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const FAQ_ITEMS = [
  {
    q: "How is it 90% cheaper?",
    a: "Legacy CDNs provision for peak traffic and amortise that cost across long contracts, so a popular release gets expensive fast. deCDN is demand-shaped: supply forms around traffic, nodes cache what's hot, and bandwidth gets reused across many pulls. Cost per gigabyte collapses as regional demand concentrates — the opposite of how fixed-provisioning CDNs behave. Target price today: ~$0.01/GB, one cent, per actual gigabyte delivered.",
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
    a: "TOKEN secures the network — operators stake it to participate, and they lose it if they misbehave. Payments, though, happen in USDC, because operators want stable currency they can pay power bills with. Twenty percent of protocol fees flow into a Balancer V3 80/20 TOKEN/USDC buyback, tying token demand to network throughput.",
  },
  {
    q: "Can publishers pay on behalf of users?",
    a: "Yes. Account abstraction lets a publisher fund a payment channel for their audience, so users pull content with no wallet and no subscription — same free-to-download experience as a public mirror, except the publisher pays peers per megabyte instead of one cloud's egress bill. Default flow is client-pays; publisher-pays is the flag you flip when you want to ship widely without per-user payment friction.",
  },
  {
    q: "Does this work well for AI models?",
    a: "Yes — AI is where deCDN's primitives compound. Clients pull large weights from several peers in parallel and saturate their own uplink instead of a single origin's. BLAKE3 chunk addressing lets teams grab one quantisation variant or a single layer without downloading the full checkpoint. And when a model drops and every region pulls it at once, the mesh warms around the demand instead of choking at a central bucket.",
  },
] as const;

export function Faq() {
  return (
    <Frame id="faq" tone="ink">
      <SectionHeader index="04" label="FAQ" timestamp="field notes" />

      <div className="mt-14 flex flex-col gap-10">
        <h2
          data-reveal
          id="faq-h"
          className="hug font-semibold leading-[0.92] tracking-[-0.04em]"
          style={{ fontSize: "var(--fs-h2)" }}
        >
          frequently asked.
        </h2>

        <dl className="flex flex-col divide-y divide-current/20">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem key={item.q} delay={i * 80} q={item.q} a={item.a} />
          ))}
        </dl>
      </div>
    </Frame>
  );
}

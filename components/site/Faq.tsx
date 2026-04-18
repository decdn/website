import { FaqItem } from "@/components/ui/FaqItem";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function Faq() {
  return (
    <section
      id="s-04"
      aria-labelledby="s-04-h"
      className="relative flex min-h-[100svh] scroll-mt-[-48px] flex-col bg-[var(--ink)] px-6 pt-24 pb-12 text-[var(--paper)] sm:px-16 sm:pt-28 sm:pb-16"
    >
      <SectionHeader index="04" label="FAQ" timestamp="field notes" />

      <div className="mt-14 flex flex-col gap-10">
        <h2
          data-reveal
          id="s-04-h"
          className="hug font-semibold leading-[0.92] tracking-[-0.04em]"
          style={{ fontSize: "clamp(34px, 7vw, 104px)" }}
        >
          frequently asked.
        </h2>

        <dl className="flex flex-col divide-y divide-current/20">
          <FaqItem
            delay={0}
            q="How is it 90% cheaper?"
            a="Legacy CDNs provision for peak traffic and amortise that cost across long contracts, so a popular release gets expensive fast. deCDN is demand-shaped: supply forms around traffic, nodes cache what's hot, and bandwidth gets reused across many pulls. Cost per gigabyte collapses as regional demand concentrates — the opposite of how fixed-provisioning CDNs behave. Target price today: ~$0.01/GB, one cent, per actual gigabyte delivered."
          />
          <FaqItem
            delay={80}
            q="How is byte-level integrity enforced?"
            a="Every blob is BLAKE3-addressed, so the hash the client is asking for is the same hash they'll be checking on the way in. Verification happens chunk-by-chunk, in flight — mismatched bytes are dropped and the next peer on the list is asked instead. Peers that send garbage lose staked TOKEN via a non-custodial Merkle proof. There is no central arbiter; the math is the arbiter."
          />
          <FaqItem
            delay={160}
            q="Why does the network need a token?"
            a="TOKEN secures the network — operators stake it to participate, and they lose it if they misbehave. Payments, though, happen in USDC, because operators want stable currency they can pay power bills with. Twenty percent of protocol fees flow into a Balancer V3 80/20 TOKEN/USDC buyback, tying token demand to network throughput."
          />
          <FaqItem
            delay={240}
            q="Who actually pays?"
            a="The client pulling the bytes. When a session starts, the client opens an off-chain USDC channel and streams payment per megabyte as chunks arrive. No subscription, no account, no invoice — when the download finishes, the channel closes and settles. You pay for what you pulled, nothing more."
          />
          <FaqItem
            delay={320}
            q="What happens if a node lies?"
            a="The client detects the BLAKE3 mismatch on the very next chunk, drops the connection, and files a non-custodial Merkle proof against the node's stake. The good node further down the list keeps streaming — the client barely notices. The bad node loses TOKEN on-chain within minutes. There is no central arbiter; the math is the arbiter."
          />
          <FaqItem
            delay={400}
            q="Does this work well for AI models?"
            a="Yes — AI is where deCDN's primitives compound. Clients pull large weights from several peers in parallel and saturate their own uplink instead of a single origin's. BLAKE3 chunk addressing lets teams grab one quantisation variant or a single layer without downloading the full checkpoint. And when a model drops and every region pulls it at once, the mesh warms around the demand instead of choking at a central bucket."
          />
        </dl>
      </div>
    </section>
  );
}

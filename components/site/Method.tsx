import { Figure } from "@/components/ui/Figure";
import { Frame } from "@/components/ui/Frame";
import { MethodRow } from "@/components/ui/MethodRow";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function Method() {
  return (
    <Frame id="method" tone="paper">
      <SectionHeader
        index="03"
        label="How it works"
        timestamp="probe · swarm · settle"
      />

      <h2 id="method-h" className="sr-only">
        How it works
      </h2>

      <div className="mt-14 flex flex-col divide-y divide-current/20">
        <MethodRow
          n="01"
          word="probe"
          delay={0}
          body="in a single handshake, the client asks nearby peers who has the file. peers answer with what they've cached, their rate per megabyte, and how fast they can serve — the roundtrip averages under 100 milliseconds. the client ranks the answers by price, latency, and reputation; the best-priced, fastest, most-reputable peer wins, or several win in parallel for a large file."
        />
        <MethodRow
          n="02"
          word="swarm"
          delay={120}
          body="bytes flow directly from the chosen node; for files over ten gigabytes the client opens parallel streams to several peers at once and aggregates their throughput — a 1 gbps origin turns into multi-gigabit delivery to the client. every chunk is verified against the blake3 tree hash the instant it lands; tampered bytes trigger immediate disconnect and a fraud proof against the node's stake. trust no node — verify every byte."
        />
        <MethodRow
          n="03"
          word="settle"
          delay={240}
          body="you pay per megabyte in usdc, automatically, as the bytes arrive — no monthly invoice, no subscription, no whole-file minimum. pay for what you pulled, nothing more."
        />
      </div>

      <div data-reveal className="mt-auto pt-20">
        <span className="meta mb-3 block opacity-60">stack</span>
        <div
          className="hug flex flex-wrap items-baseline gap-x-5 gap-y-2 font-semibold tracking-[-0.03em]"
          style={{ fontSize: "var(--fs-h3)" }}
        >
          <span>blake3</span>
          <span aria-hidden className="opacity-30">
            ·
          </span>
          <span>quic</span>
          <span aria-hidden className="opacity-30">
            ·
          </span>
          <span>iroh</span>
          <span aria-hidden className="opacity-30">
            ·
          </span>
          <span>usdc</span>
          <span aria-hidden className="opacity-30">
            ·
          </span>
          <span>evm</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-y-4 @xl:grid-cols-4">
          <Figure label="language" value="rust" />
          <Figure label="transport" value="quic / iroh" />
          <Figure label="settlement" value="chain-agnostic" />
          <Figure label="currency" value="usdc · token" />
        </div>
      </div>
    </Frame>
  );
}

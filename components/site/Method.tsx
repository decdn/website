import { Figure } from "@/components/ui/Figure";
import { MethodRow } from "@/components/ui/MethodRow";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function Method() {
  return (
    <section
      id="s-03"
      aria-labelledby="s-03-h"
      className="relative flex min-h-[100svh] scroll-mt-[-48px] flex-col bg-[var(--paper)] px-6 pt-24 pb-12 text-[var(--ink)] sm:px-16 sm:pt-28 sm:pb-16"
    >
      <SectionHeader
        index="03"
        label="How it works"
        timestamp="probe · stream · settle"
      />

      <h2 id="s-03-h" className="sr-only">
        How it works
      </h2>

      <div className="mt-14 flex flex-col divide-y divide-current/20">
        <MethodRow
          n="01"
          word="probe"
          delay={0}
          body="the client broadcasts a blake3 hash over quic 0-rtt. within about thirty milliseconds every nearby node replies with a price and a latency estimate. the client picks one — or several in parallel — by reputation, stake, and the number the operator is willing to quote today."
        />
        <MethodRow
          n="02"
          word="stream"
          delay={120}
          body="the winning node streams chunks as fast as its uplink can move them. the client verifies each chunk the moment it arrives; mismatched bytes get discarded and re-pulled from the next peer on the list. a node that returns garbage loses its staked token on the spot. trust no node — verify each one."
        />
        <MethodRow
          n="03"
          word="settle"
          delay={240}
          body="payment happens per megabyte, in usdc, through an off-chain channel opened at session start. operators hold real stable currency they can spend on electricity and bandwidth. the channel settles on arbitrum at session close — gas is a rounding error next to the bytes delivered."
        />
      </div>

      <div data-reveal className="mt-auto pt-12">
        <span className="meta mb-3 block opacity-60">stack</span>
        <div
          className="hug flex flex-wrap items-baseline gap-x-5 gap-y-2 font-semibold tracking-[-0.03em]"
          style={{ fontSize: "clamp(22px, 4vw, 56px)" }}
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
          <span>arbitrum</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-y-4 sm:grid-cols-4">
          <Figure label="language" value="rust" />
          <Figure label="transport" value="quic / iroh" />
          <Figure label="settlement" value="arbitrum" />
          <Figure label="currency" value="usdc · token" />
        </div>
      </div>
    </section>
  );
}

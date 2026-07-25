import { METHOD_STEPS } from "@/lib/copy";
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
        {/* Reproduces the previous hand-written 0 / 120 / 240 cascade. */}
        {METHOD_STEPS.map((step, i) => (
          <MethodRow
            key={step.n}
            n={step.n}
            word={step.word}
            body={step.body}
            delay={i * 120}
          />
        ))}
      </div>

      <div data-reveal className="mt-auto pt-12">
        <span className="meta mb-3 block opacity-60">stack</span>
        <div className="hug flex flex-wrap items-baseline gap-x-5 gap-y-2 text-h3 font-semibold tracking-[-0.03em]">
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

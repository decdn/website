import { ComparisonRow } from "@/components/ui/ComparisonRow";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function Comparison() {
  return (
    <section
      id="s-02"
      aria-labelledby="s-02-h"
      className="relative flex min-h-[100svh] scroll-mt-[-48px] flex-col bg-[var(--ink)] px-6 pt-24 pb-12 text-[var(--paper)] sm:px-16 sm:pt-28 sm:pb-16"
    >
      <SectionHeader
        index="02"
        label="Side by side"
        timestamp="legacy vs decdn · seven axes"
      />

      <div className="mt-14 flex flex-col gap-10">
        <h2
          data-reveal
          id="s-02-h"
          className="hug flex flex-col font-semibold leading-[0.92] tracking-[-0.04em]"
          style={{ fontSize: "clamp(34px, 7vw, 104px)" }}
        >
          <span>open information scaled.</span>
          <span className="pl-[3vw] opacity-60">its plumbing didn&apos;t.</span>
        </h2>

        <p
          data-reveal
          style={{ ["--reveal-delay" as string]: "120ms" }}
          className="max-w-[62ch] text-[15px] leading-[1.7] text-paper/75 sm:text-[17px]"
        >
          the pattern repeats whenever something big ships: mirrors fork, cdns
          rate-limit, small teams burn tens of thousands hosting bytes they
          don&apos;t own. <span style={{ color: "var(--whisper)" }}>deCDN</span>{" "}
          inverts every axis — supply forms around demand, not allocated to it.
        </p>
      </div>

      <div className="mt-auto flex flex-col pt-12">
        <div
          data-reveal
          style={{ ["--reveal-delay" as string]: "260ms" }}
          className="grid gap-2 pb-3 sm:grid-cols-12 sm:gap-8"
        >
          <div className="meta opacity-0 sm:col-span-2 sm:block">axis</div>
          <div className="grid grid-cols-2 gap-4 sm:contents">
            <div className="meta opacity-55 sm:col-span-5">legacy cdn</div>
            <div className="meta sm:col-span-5">
              decdn
              <span className="ml-2 opacity-60">/ peer-to-peer</span>
            </div>
          </div>
        </div>

        {/* big price row */}
        <div
          data-reveal
          style={{ ["--reveal-delay" as string]: "340ms" }}
          className="grid gap-3 border-t border-current/25 py-5 sm:grid-cols-12 sm:gap-8 sm:py-8"
        >
          <div className="meta opacity-60 sm:col-span-2 sm:pt-2">price</div>
          <div className="grid grid-cols-2 gap-4 sm:contents">
            <div className="sm:col-span-5">
              <div
                className="hug relative inline-flex font-semibold tracking-[-0.04em]"
                style={{
                  fontSize: "clamp(18px, 5vw, 64px)",
                  lineHeight: "0.96",
                }}
              >
                <span className="opacity-55">
                  $0.085–$0.17
                  <span className="meta ml-1 align-baseline opacity-70">
                    /GB
                  </span>
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 sm:h-[4px]"
                  style={{ background: "var(--paper)" }}
                />
              </div>
            </div>
            <div className="sm:col-span-5">
              <div
                className="hug font-semibold tracking-[-0.04em]"
                style={{
                  fontSize: "clamp(18px, 5vw, 64px)",
                  lineHeight: "0.96",
                }}
              >
                $0.01
                <span className="meta ml-1 align-baseline opacity-70">/GB</span>
              </div>
            </div>
          </div>
        </div>

        <ComparisonRow
          label="delivery"
          legacy="fixed provisioning"
          decdn="demand-shaped mesh"
          delay={420}
        />
        <ComparisonRow
          label="billing"
          legacy="monthly minimums, annual contracts"
          decdn="per megabyte, in usdc"
          delay={480}
        />
        <ComparisonRow
          label="operators"
          legacy="three hyperscalers"
          decdn="anyone with a node"
          delay={540}
        />
        <ComparisonRow
          label="integrity"
          legacy="trust the origin"
          decdn="blake3, verify every chunk"
          delay={600}
        />
        <ComparisonRow
          label="failure"
          legacy="pop dies, region 503s"
          decdn="peer drops, stream continues"
          delay={660}
        />
        <ComparisonRow
          label="scaling"
          legacy="gets more expensive"
          decdn="gets cheaper"
          delay={720}
        />
      </div>
    </section>
  );
}

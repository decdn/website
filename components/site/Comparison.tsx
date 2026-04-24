import { ComparisonRow } from "@/components/ui/ComparisonRow";
import { Frame } from "@/components/ui/Frame";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function Comparison() {
  return (
    <Frame id="compare" tone="ink">
      <SectionHeader
        index="02"
        label="Side by side"
        timestamp="legacy vs decdn · seven axes"
      />

      <div className="mt-14 flex flex-col gap-10">
        <h2
          data-reveal
          id="compare-h"
          className="hug flex flex-col font-semibold leading-[0.92] tracking-[-0.04em]"
          style={{ fontSize: "var(--fs-h2)" }}
        >
          <span>information scaled.</span>
          <span className="pl-[3vw] opacity-60">supply didn&apos;t.</span>
        </h2>

        <p
          data-reveal
          style={{
            ["--reveal-delay" as string]: "120ms",
            fontSize: "var(--fs-body)",
          }}
          className="mt-6 max-w-[62ch] leading-[1.7] text-paper/75"
        >
          the pattern repeats whenever something big ships: mirrors fork, cdns
          rate-limit, small teams burn tens of thousands hosting bytes they
          don&apos;t own. <span style={{ color: "var(--whisper)" }}>deCDN</span>{" "}
          inverts every axis — supply forms around demand, not allocated to it.
        </p>
      </div>

      <div className="mt-auto flex flex-col pt-20">
        <div
          data-reveal
          style={{ ["--reveal-delay" as string]: "260ms" }}
          className="grid gap-2 pb-3 @xl:grid-cols-12 @xl:gap-8"
        >
          <div className="meta opacity-0 @xl:col-span-2 @xl:block">axis</div>
          <div className="grid grid-cols-2 gap-4 @xl:contents">
            <div className="meta opacity-55 @xl:col-span-5">legacy cdn</div>
            <div className="meta @xl:col-span-5">
              decdn
              <span className="ml-2 opacity-60">/ peer-to-peer</span>
            </div>
          </div>
        </div>

        {/* big price row */}
        <div
          data-reveal
          style={{ ["--reveal-delay" as string]: "340ms" }}
          className="grid gap-3 border-t border-current/25 py-5 @xl:grid-cols-12 @xl:gap-8 @xl:py-8"
        >
          <div className="meta opacity-60 @xl:col-span-2 @xl:pt-2">price</div>
          <div className="grid grid-cols-2 gap-4 @xl:contents">
            <div className="@xl:col-span-5">
              <div
                className="hug relative inline-flex font-semibold tracking-[-0.04em]"
                style={{
                  fontSize: "var(--fs-price)",
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
                  className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 @xl:h-[4px]"
                  style={{ background: "var(--paper)" }}
                />
              </div>
            </div>
            <div className="@xl:col-span-5">
              <div
                className="hug font-semibold tracking-[-0.04em]"
                style={{
                  fontSize: "var(--fs-price)",
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
          decdn="home labs to datacenters"
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
    </Frame>
  );
}

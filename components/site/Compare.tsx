import { ComparisonRow } from "@/components/ui/ComparisonRow";
import { Frame } from "@/components/ui/Frame";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function Compare() {
  return (
    <Frame id="compare" tone="ink">
      <SectionHeader
        index="02"
        label="Side by side"
        timestamp="traditional vs decdn · seven axes"
      />

      <div className="mt-14 flex flex-col gap-10">
        <h2
          data-reveal
          id="compare-h"
          className="hug flex flex-col text-h2 leading-[0.92] font-semibold tracking-[-0.04em]"
        >
          <span>information scaled.</span>
          <span className="pl-[3vw] opacity-60">supply didn&apos;t.</span>
        </h2>

        <p
          data-reveal
          style={{ "--reveal-delay": "120ms" }}
          className="max-w-[62ch] text-body leading-[1.7] text-paper/75"
        >
          the pattern repeats whenever something big ships: mirrors fork, cdns
          rate-limit, small teams burn tens of thousands hosting bytes they
          don&apos;t own. <span className="text-whisper">deCDN</span> inverts
          every axis — supply forms around demand, not allocated to it.
        </p>
      </div>

      <div className="mt-auto flex flex-col pt-12">
        <div
          data-reveal
          style={{ "--reveal-delay": "260ms" }}
          className="grid gap-2 pb-3 @xl:grid-cols-12 @xl:gap-8"
        >
          <div className="meta opacity-0 @xl:col-span-2 @xl:block">axis</div>
          <div className="grid grid-cols-2 gap-4 @xl:contents">
            <div className="meta opacity-55 @xl:col-span-5">
              traditional cdn
            </div>
            <div className="meta @xl:col-span-5">
              decdn
              <span className="ml-2 opacity-60">/ decentralized</span>
            </div>
          </div>
        </div>

        {/* big price row */}
        <div
          data-reveal
          style={{ "--reveal-delay": "340ms" }}
          className="grid gap-3 border-t border-current/25 py-5 @xl:grid-cols-12 @xl:gap-8 @xl:py-8"
        >
          <div className="meta opacity-60 @xl:col-span-2 @xl:pt-2">price</div>
          <div className="grid grid-cols-2 gap-4 @xl:contents">
            <div className="@xl:col-span-5">
              <div className="hug relative inline-flex text-price leading-[0.96] font-semibold tracking-[-0.04em]">
                <span className="opacity-55">
                  $0.085–$0.17
                  <span className="meta ml-1 align-baseline opacity-70">
                    /GB
                  </span>
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-paper @xl:h-[4px]"
                />
              </div>
            </div>
            <div className="@xl:col-span-5">
              <div className="hug text-price leading-[0.96] font-semibold tracking-[-0.04em]">
                $0.01
                <span className="meta ml-1 align-baseline opacity-70">/GB</span>
              </div>
            </div>
          </div>
        </div>

        <ComparisonRow
          label="delivery"
          traditional="fixed provisioning"
          decdn="demand-shaped mesh"
          delay={420}
        />
        <ComparisonRow
          label="billing"
          traditional="monthly minimums, annual contracts"
          decdn="per megabyte, in usdc"
          delay={480}
        />
        <ComparisonRow
          label="operators"
          traditional="three hyperscalers"
          decdn="home labs to datacenters"
          delay={540}
        />
        <ComparisonRow
          label="integrity"
          traditional="trust the origin"
          decdn="blake3, verify every chunk"
          delay={600}
        />
        <ComparisonRow
          label="failure"
          traditional="pop dies, region 503s"
          decdn="peer drops, stream continues"
          delay={660}
        />
        <ComparisonRow
          label="scaling"
          traditional="gets more expensive"
          decdn="gets cheaper"
          delay={720}
        />
      </div>
    </Frame>
  );
}

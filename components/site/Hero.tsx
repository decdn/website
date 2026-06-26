import { links } from "@/lib/links";
import { Figure } from "@/components/ui/Figure";
import { Frame } from "@/components/ui/Frame";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { HeroTerminal } from "@/components/site/HeroTerminal";

export function Hero() {
  return (
    <Frame id="intro" tone="paper" className="overflow-hidden">
      <SectionHeader index="01" label="Hero" timestamp="testnet · v0" />

      <div className="mt-10 flex flex-col gap-8 @4xl:gap-12">
        <h1
          id="intro-h"
          className="hug flex flex-col pl-[8vw] text-h1 leading-[0.9] font-semibold tracking-[-0.04em]"
        >
          <span className="rise rise-1">the delivery layer</span>
          <span className="rise rise-2 pl-[7vw]">
            anyone can serve
            <span aria-hidden className="text-whisper">
              .
            </span>
          </span>
          <span className="rise rise-2 pl-[12vw]">priced, not quoted.</span>
        </h1>

        <div className="grid gap-10 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)] @4xl:items-end @4xl:gap-12">
          <div className="flex flex-col gap-8 @4xl:gap-12">
            <p className="rise rise-3 max-w-[64ch] text-body leading-[1.65]">
              the first bytes of a 14-gigabyte file posted in berlin reach a
              client in tokyo in under a second. the client streams from three
              peers at once, verifies every chunk with blake3, and pays per
              megabyte in usdc — whether the payload is a linux iso, a dataset,
              a game patch, a media library, or an ai model.{" "}
              <span className="text-whisper">deCDN</span> is demand-shaped,
              locality-optimised delivery for large files at scale: supply forms
              around demand, cost collapses as regional traffic concentrates.
              the code is open. the network is open. the price is posted.
            </p>

            <div className="rise rise-4 flex flex-col flex-wrap gap-x-8 gap-y-3 @md:flex-row @md:items-end">
              <a
                className="underline-brutal text-cta font-semibold tracking-[0.14em] uppercase"
                href={links.litepaper}
                target="_blank"
                rel="noopener noreferrer"
              >
                read the litepaper
                <span className="arrow" aria-hidden>
                  →
                </span>
              </a>
              <a
                className="underline-brutal text-cta font-semibold tracking-[0.14em] uppercase"
                href={links.docs}
              >
                read the docs
                <span className="arrow" aria-hidden>
                  →
                </span>
              </a>
              <a
                className="underline-brutal text-cta font-semibold tracking-[0.14em] uppercase"
                href={links.github}
              >
                source
                <span className="arrow" aria-hidden>
                  →
                </span>
              </a>
            </div>

            <div className="rise rise-5 grid grid-cols-2 gap-y-4 @xl:grid-cols-4">
              <Figure label="target price" value="$0.01/GB" />
              <Figure label="p50 latency" value="50–100 ms" />
              <Figure label="settlement" value="per-MB · usdc" />
              <Figure label="gas overhead" value="<1%" />
            </div>
          </div>

          <HeroTerminal className="block w-full" />
        </div>
      </div>
    </Frame>
  );
}

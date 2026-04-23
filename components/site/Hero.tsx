import { links } from "@/lib/links";
import { Figure } from "@/components/ui/Figure";
import { Frame } from "@/components/ui/Frame";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { HeroTerminal } from "@/components/site/HeroTerminal";

export function Hero() {
  return (
    <Frame id="intro" tone="paper" className="overflow-hidden">
      <SectionHeader
        index="01"
        label="Hero"
        timestamp="2026-04 · devnet v0.0.0"
      />

      <div className="mt-auto grid gap-10 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)] @4xl:items-end @4xl:gap-12">
        <div className="flex flex-col gap-8 @4xl:gap-12">
          <div className="rise rise-0 flex flex-wrap items-center gap-3">
            <span className="meta inline-flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block h-[8px] w-[8px] rounded-full"
                style={{ background: "var(--whisper)" }}
              />
              <span>live</span>
            </span>
            <span className="meta opacity-50" aria-hidden>
              ·
            </span>
            <span className="meta opacity-70">epoch 00042</span>
            <span className="meta opacity-50" aria-hidden>
              ·
            </span>
            <span className="meta opacity-70">quic / blake3</span>
          </div>

          <h1
            id="intro-h"
            className="hug flex flex-col font-semibold leading-[0.9] tracking-[-0.04em]"
            style={{ fontSize: "var(--fs-h1)" }}
          >
            <span className="rise rise-1">the delivery layer</span>
            <span className="rise rise-2 pl-[4vw]">
              for information<span style={{ color: "var(--whisper)" }}>.</span>
            </span>
            <span className="rise rise-2 pl-[8vw]">shaped by demand.</span>
          </h1>

          <p
            className="rise rise-3 max-w-[64ch] leading-[1.65]"
            style={{ fontSize: "var(--fs-body)" }}
          >
            a 14-gigabyte file posted in berlin reaches a client in tokyo in
            under a second. the client streams from three peers at once,
            verifies every chunk with blake3, and pays per megabyte in usdc —
            whether the payload is a linux iso, an open dataset, a game patch, a
            media library, or an ai model.{" "}
            <span style={{ color: "var(--whisper)" }}>deCDN</span> is
            demand-shaped, locality-optimised delivery for large files at scale:
            supply forms around demand, cost collapses as regional traffic
            concentrates. the code is open. the network is open. the price is
            posted.
          </p>

          <div className="rise rise-4 flex flex-col flex-wrap gap-x-8 gap-y-3 @md:flex-row @md:items-end">
            <a
              className="underline-brutal font-semibold tracking-[0.14em] uppercase"
              style={{ fontSize: "var(--fs-cta)" }}
              href={links.whitepaper}
              target="_blank"
              rel="noopener noreferrer"
            >
              read the whitepaper
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
            <a
              className="underline-brutal font-semibold tracking-[0.14em] uppercase"
              style={{ fontSize: "var(--fs-cta)" }}
              href={links.runNode}
            >
              run a node
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
            <a
              className="underline-brutal font-semibold tracking-[0.14em] uppercase opacity-55 hover:opacity-100"
              style={{ fontSize: "var(--fs-cta)" }}
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
    </Frame>
  );
}

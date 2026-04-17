import { links } from "@/lib/links";
import { Figure } from "@/components/ui/Figure";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { HeroTerminal } from "@/components/site/HeroTerminal";

export function Hero() {
  return (
    <section
      id="s-01"
      aria-labelledby="s-01-h"
      className="relative flex min-h-[100svh] scroll-mt-[-48px] flex-col overflow-hidden bg-[var(--paper)] px-4 pt-24 pb-12 text-[var(--ink)] sm:px-10 sm:pt-28 sm:pb-16"
    >
      <HeroTerminal className="pointer-events-none absolute top-[24rem] right-4 z-0 hidden w-[min(44vw,520px)] sm:top-[30rem] sm:right-8 md:block" />

      <div className="relative z-10 flex w-full flex-1 flex-col">
        <SectionHeader
          index="01"
          label="Hero"
          timestamp="2026-04 · devnet v0.0.0"
        />

        <div className="mt-auto flex flex-col gap-8 sm:gap-12">
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
            id="s-01-h"
            className="hug flex flex-col font-semibold leading-[0.9] tracking-[-0.04em]"
            style={{ fontSize: "clamp(40px, 8.4vw, 124px)" }}
          >
            <span className="rise rise-1">the delivery layer</span>
            <span className="rise rise-2 pl-[4vw]">
              for open<span style={{ color: "var(--whisper)" }}>.</span>
            </span>
            <span className="rise rise-2 pl-[8vw]">information.</span>
          </h1>

          <p className="rise rise-3 max-w-[64ch] text-[14px] leading-[1.65] sm:text-[15px]">
            a 14-gigabyte file posted in berlin reaches a client in tokyo in
            under a second. the client streams from three peers at once,
            verifies every chunk with blake3, and pays per megabyte in usdc —
            whether the payload is a linux iso, an open dataset, a game patch, a
            scientific archive, or an ai model. decdn is a peer-to-peer delivery
            layer built for open information at scale. the code is open. the
            network is open. the price is posted.
          </p>

          <div className="rise rise-4 flex flex-col flex-wrap gap-x-8 gap-y-3 sm:flex-row sm:items-end">
            <a
              className="underline-brutal text-[12px] font-semibold tracking-[0.14em] uppercase sm:text-[13px]"
              href={links.whitepaper}
            >
              read the whitepaper
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
            <a
              className="underline-brutal text-[12px] font-semibold tracking-[0.14em] uppercase sm:text-[13px]"
              href={links.runNode}
            >
              run a node
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
            <a
              className="underline-brutal text-[12px] font-semibold tracking-[0.14em] uppercase opacity-55 hover:opacity-100 sm:text-[13px]"
              href={links.github}
            >
              source
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
          </div>
        </div>

        <div className="rise rise-5 mt-12 grid grid-cols-2 gap-y-4 sm:grid-cols-4">
          <Figure k="target price" v="$0.01/GB" />
          <Figure k="p50 latency" v="50–100 ms" />
          <Figure k="margin" v="64–83%" />
          <Figure k="gas overhead" v="<1%" />
        </div>
      </div>
    </section>
  );
}

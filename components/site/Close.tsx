import { links } from "@/lib/links";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function Close() {
  return (
    <section
      id="s-05"
      aria-labelledby="s-05-h"
      className="relative flex min-h-[100svh] scroll-mt-[-48px] flex-col bg-[var(--paper)] px-4 pt-24 pb-10 text-[var(--ink)] sm:px-10 sm:pt-28 sm:pb-12"
    >
      <SectionHeader
        index="05"
        label="Contact"
        timestamp="open source · open network"
      />

      <div className="mt-14 flex flex-col gap-12">
        <h2 id="s-05-h" className="sr-only">
          Contact
        </h2>

        <div
          data-reveal
          className="hug flex items-baseline gap-2 font-semibold tracking-[-0.05em]"
          style={{ fontSize: "clamp(56px, 14vw, 200px)", lineHeight: "0.86" }}
        >
          <span>decdn</span>
          <span aria-hidden style={{ color: "var(--whisper)" }}>
            .
          </span>
        </div>

        <p
          data-reveal
          style={{ ["--reveal-delay" as string]: "120ms" }}
          className="max-w-[64ch] text-[14px] leading-[1.7] sm:text-[15px]"
        >
          decdn is a peer-to-peer delivery layer for large files — open
          datasets, scientific archives, linux distros, game builds, video
          libraries, open-weight ai models, anything meant to be pulled a
          million times and that shouldn&apos;t depend on one bucket. the code
          is open. the network is open. the price is posted.
        </p>

        <div
          data-reveal
          style={{ ["--reveal-delay" as string]: "220ms" }}
          className="flex flex-col flex-wrap gap-x-10 gap-y-4 sm:flex-row sm:items-baseline"
        >
          <a
            className="underline-brutal text-[14px] font-semibold tracking-[0.02em] sm:text-[16px]"
            href={links.whitepaper}
          >
            read the whitepaper
            <span className="arrow" aria-hidden>
              →
            </span>
          </a>
          <a
            className="underline-brutal text-[14px] font-semibold tracking-[0.02em] sm:text-[16px]"
            href={links.runNode}
          >
            run a node
            <span className="arrow" aria-hidden>
              →
            </span>
          </a>
          <a
            className="underline-brutal text-[14px] font-semibold tracking-[0.02em] sm:text-[16px]"
            href={links.github}
          >
            source on github
            <span className="arrow" aria-hidden>
              →
            </span>
          </a>
        </div>
      </div>

      <footer className="mt-auto flex flex-col gap-3 pt-16">
        <span aria-hidden className="rule opacity-40" />
        <div className="grid grid-cols-1 gap-2 text-[11px] tracking-[0.2em] uppercase opacity-80 sm:grid-cols-3 sm:items-center">
          <span>© mmxxvi · decdn labs</span>
          <span className="sm:text-center">
            built in rust · rendered in geist
          </span>
          <span className="tabular-nums sm:text-right">node-001 / v0.0.0</span>
        </div>
      </footer>
    </section>
  );
}

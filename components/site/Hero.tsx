import { links } from "@/lib/links";
import {
  HERO_FIGURES,
  HERO_HEADLINE,
  HERO_LEAD,
  HERO_STATUS,
} from "@/lib/copy";
import { highlightBrand } from "@/components/ui/brand";
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
          className="hug flex flex-col text-h1 leading-[0.9] font-semibold tracking-[-0.04em]"
        >
          <span className="rise rise-1">{HERO_HEADLINE[0]}</span>
          <span className="rise rise-2 pl-[7vw]">
            {HERO_HEADLINE[1]}
            <span aria-hidden className="text-whisper">
              .
            </span>
          </span>
        </h1>

        {/* Stats and the status link share the grid's second row so they
            baseline-align on desktop; on mobile the DOM order stacks the
            link under the stats and the terminal last. */}
        <div className="grid gap-y-10 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)] @4xl:items-start @4xl:gap-x-12 @4xl:gap-y-14">
          <div className="flex flex-col gap-10 @4xl:col-start-1 @4xl:row-start-1 @4xl:gap-16">
            <p className="rise rise-3 max-w-[64ch] text-body leading-[1.65]">
              {highlightBrand(HERO_LEAD)}
            </p>

            {/* One primary action; docs and source sit beside it as quieter
                text links so the eye lands on the litepaper first. */}
            <div className="rise rise-4 flex flex-col items-start gap-x-8 gap-y-5 @md:flex-row @md:items-center">
              <a
                className="cta-primary"
                href={links.litepaper}
                target="_blank"
                rel="noopener noreferrer"
              >
                read the litepaper
                <span className="arrow" aria-hidden>
                  →
                </span>
              </a>
              <div className="flex gap-x-8">
                <a
                  className="underline-brutal text-cta font-medium tracking-[0.14em] uppercase opacity-70 hover:opacity-100"
                  href={links.docs}
                >
                  read the docs
                  <span className="arrow" aria-hidden>
                    →
                  </span>
                </a>
                <a
                  className="underline-brutal text-cta font-medium tracking-[0.14em] uppercase opacity-70 hover:opacity-100"
                  href={links.github}
                >
                  source
                  <span className="arrow" aria-hidden>
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className="rise rise-5 grid grid-cols-2 gap-y-4 @xl:grid-cols-4 @4xl:col-start-1 @4xl:row-start-2 @4xl:self-baseline">
            {HERO_FIGURES.map((figure) => (
              <Figure key={figure.label} {...figure} />
            ))}
          </div>

          {/* Mirrors Figure's label/value lines so it baseline-aligns with
              the stat strip beside it. */}
          <a
            className="hero-status rise rise-5 flex flex-col gap-1 justify-self-start @4xl:col-start-2 @4xl:row-start-2 @4xl:self-baseline"
            href={links.stats}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="meta opacity-60">{HERO_STATUS.label}</span>
            <span className="flex items-center gap-3 text-body font-medium tracking-[-0.01em]">
              <span aria-hidden className="status-live" />
              <span className="hero-status-text">
                {HERO_STATUS.value}
                <span className="arrow" aria-hidden>
                  →
                </span>
              </span>
            </span>
          </a>

          <HeroTerminal className="block w-full @4xl:col-start-2 @4xl:row-start-1" />
        </div>
      </div>
    </Frame>
  );
}

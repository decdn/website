import { Ledger } from "@/components/ui/Ledger";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function Problem() {
  return (
    <section
      id="s-02"
      aria-labelledby="s-02-h"
      className="relative flex min-h-[100svh] scroll-mt-[-48px] flex-col bg-[var(--ink)] px-4 pt-24 pb-12 text-[var(--paper)] sm:px-10 sm:pt-28 sm:pb-16"
    >
      <SectionHeader
        index="02"
        label="The delivery layer failed"
        timestamp="problem · persistent"
      />

      <div className="mt-14 flex flex-col gap-12">
        <h2
          data-reveal
          id="s-02-h"
          className="hug flex flex-col font-semibold leading-[0.92] tracking-[-0.04em]"
          style={{ fontSize: "clamp(34px, 7vw, 104px)" }}
        >
          <span>open information scaled.</span>
          <span className="pl-[3vw] opacity-60">its plumbing didn&apos;t.</span>
        </h2>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-12 sm:gap-10">
          <p
            data-reveal
            style={{
              color: "rgb(255 255 255 / 0.75)",
              ["--reveal-delay" as string]: "120ms",
            }}
            className="max-w-[62ch] text-[14px] leading-[1.7] sm:col-span-7 sm:text-[15px]"
          >
            the pattern repeats whenever something big ships. a fresh linux iso,
            a 200-gigabyte game patch, an open-science dataset, the latest
            open-weight ai model — the url gets hammered, mirrors fork, cdns
            rate-limit. small teams burn tens of thousands a month hosting bytes
            they don&apos;t own. cloudflare, aws, akamai run the pipes. their
            pricing is a toll booth on open information:{" "}
            <strong className="font-semibold">$0.085–$0.17 per gigabyte</strong>
            , fixed provisioning, monthly minimums. the infrastructure layer
            concentrates exactly where the apps promise to decentralise.
          </p>

          <ul
            data-reveal
            style={{ ["--reveal-delay" as string]: "220ms" }}
            className="flex flex-col gap-3 text-[13px] sm:col-span-5"
          >
            <Ledger k="legacy price" v="$0.085–$0.17 / GB" />
            <Ledger k="delivery model" v="fixed provisioning" />
            <Ledger k="counterparties" v="3 hyperscalers" />
            <Ledger k="subscription" v="monthly, flat" />
            <Ledger k="sovereignty" v="custodial" />
          </ul>
        </div>
      </div>

      <div data-reveal className="mt-auto flex flex-col gap-5 pt-12">
        <div className="flex flex-col gap-2">
          <span className="meta opacity-60">before</span>
          <div
            className="hug relative inline-flex font-semibold tracking-[-0.05em]"
            style={{
              fontSize: "clamp(40px, 8vw, 112px)",
              lineHeight: "0.92",
            }}
          >
            <span className="relative">
              $0.085–$0.17/GB
              <span
                aria-hidden
                className="absolute inset-x-0 top-1/2 h-[4px] -translate-y-1/2 sm:h-[6px]"
                style={{ background: "var(--paper)" }}
              />
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 pl-[4vw]">
          <span className="meta">after · decdn</span>
          <div
            className="hug font-semibold tracking-[-0.05em]"
            style={{
              fontSize: "clamp(48px, 11vw, 160px)",
              lineHeight: "0.9",
            }}
          >
            <span aria-hidden className="pr-3 opacity-60">
              →
            </span>
            $0.01/GB
          </div>
        </div>
      </div>
    </section>
  );
}

import { links } from "@/lib/links";
import { Frame } from "@/components/ui/Frame";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FleetStatus } from "@/components/site/FleetStatus";

export function Close() {
  return (
    <Frame id="s-05" tone="paper" className="overflow-hidden">
      <SectionHeader
        index="05"
        label="Contact"
        timestamp="open source · open network"
      />

      <div className="mt-14 grid gap-12 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,460px)] @4xl:items-start @4xl:gap-14">
        <div className="flex flex-col gap-12">
          <h2 id="s-05-h" className="sr-only">
            Contact
          </h2>

          <div
            data-reveal
            className="hug flex items-baseline gap-2 font-semibold tracking-[-0.05em]"
            style={{ fontSize: "var(--fs-display)", lineHeight: "0.86" }}
          >
            <span>decdn</span>
            <span aria-hidden style={{ color: "var(--whisper)" }}>
              .
            </span>
          </div>

          <p
            data-reveal
            style={{
              ["--reveal-delay" as string]: "120ms",
              fontSize: "var(--fs-body)",
            }}
            className="max-w-[64ch] leading-[1.7]"
          >
            <span style={{ color: "var(--whisper)" }}>deCDN</span> is a
            peer-to-peer delivery layer for large files — software releases,
            datasets, media libraries, ai models, anything meant to be pulled a
            million times and that shouldn&apos;t depend on one bucket. the code
            is open. the network is open. the price is posted.
          </p>

          <div
            data-reveal
            style={{ ["--reveal-delay" as string]: "220ms" }}
            className="flex flex-col flex-wrap gap-x-10 gap-y-4 @md:flex-row @md:items-baseline"
          >
            <a
              className="underline-brutal font-semibold tracking-[0.02em]"
              style={{ fontSize: "var(--fs-lead)" }}
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
              className="underline-brutal font-semibold tracking-[0.02em]"
              style={{ fontSize: "var(--fs-lead)" }}
              href={links.runNode}
            >
              run a node
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
            <a
              className="underline-brutal font-semibold tracking-[0.02em]"
              style={{ fontSize: "var(--fs-lead)" }}
              href={links.github}
            >
              source on github
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
          </div>
        </div>

        <FleetStatus className="block w-full" />
      </div>

      <footer className="mt-auto flex flex-col gap-3 pt-16">
        <span aria-hidden className="rule opacity-40" />
        <div
          className="grid grid-cols-1 gap-2 tracking-[0.2em] uppercase opacity-80 @md:grid-cols-3 @md:items-center"
          style={{ fontSize: "var(--fs-micro)" }}
        >
          <span>© mmxxvi · decdn labs</span>
          <span className="@md:text-center">
            built in rust · rendered in geist
          </span>
          <span className="tabular-nums @md:text-right">node-001 / v0.0.0</span>
        </div>
      </footer>
    </Frame>
  );
}

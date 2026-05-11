import { links } from "@/lib/links";
import { Frame } from "@/components/ui/Frame";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FleetStatus } from "@/components/site/FleetStatus";

export function Close() {
  return (
    <Frame id="contact" tone="paper" className="overflow-hidden">
      <SectionHeader
        index="05"
        label="Contact"
        timestamp="open source · open network"
      />

      <div className="mt-14 grid gap-12 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,460px)] @4xl:items-start @4xl:gap-14">
        <div className="flex flex-col gap-12">
          <h2 id="contact-h" className="sr-only">
            Contact
          </h2>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-reveal
            src="/wordmark-light.svg"
            alt="decdn"
            width={411}
            height={110}
            className="block"
            style={{
              "--wordmark-h": "clamp(4.75rem, 14vw, 11.5rem)",
              height: "var(--wordmark-h)",
              width: "auto",
              marginLeft: "calc(var(--wordmark-h) * -0.18)",
            }}
          />

          {/* prettier-ignore */}
          <p
            data-reveal
            style={{
              "--reveal-delay": "120ms",
              fontSize: "var(--fs-body)",
            }}
            className="max-w-[64ch] leading-[1.7]"
          >
            <span style={{ color: "var(--whisper)" }}>deCDN</span>{" "}is a peer-to-peer delivery layer for large files — software releases, datasets, media libraries, ai models, anything meant to be pulled a million times and that shouldn&apos;t depend on one bucket. the code is open. the network is open. the price is posted.
          </p>

          <div
            data-reveal
            style={{ "--reveal-delay": "220ms" }}
            className="flex flex-col flex-wrap gap-x-10 gap-y-4 @md:flex-row @md:items-baseline"
          >
            <a
              className="underline-brutal font-semibold tracking-[0.02em]"
              style={{ fontSize: "var(--fs-lead)" }}
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
    </Frame>
  );
}

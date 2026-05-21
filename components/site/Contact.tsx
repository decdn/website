import { links } from "@/lib/links";
import { Frame } from "@/components/ui/Frame";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FleetStatus } from "@/components/site/FleetStatus";

const wordmarkH = "clamp(4.75rem, 14vw, 11.5rem)";

export function Contact() {
  return (
    <Frame id="contact" tone="paper" className="overflow-hidden" fill={false}>
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
              height: wordmarkH,
              width: "auto",
              marginLeft: `calc(${wordmarkH} * -0.18)`,
            }}
          />

          <p
            data-reveal
            style={{ "--reveal-delay": "120ms" }}
            className="max-w-[64ch] text-body leading-[1.7]"
          >
            the network is open. so is our inbox. write us with questions,
            partnerships, or anything you&apos;d run on a fleet of idle
            machines. we read everything.
          </p>

          <div
            data-reveal
            style={{ "--reveal-delay": "220ms" }}
            className="flex flex-col flex-wrap gap-x-10 gap-y-4 @md:flex-row @md:items-baseline"
          >
            <a
              className="underline-brutal text-lead font-semibold tracking-[0.02em]"
              href={links.contact}
            >
              info@decdn.org
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
            <a
              className="underline-brutal text-lead font-semibold tracking-[0.02em]"
              href={links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              linkedin
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
            <a
              className="underline-brutal text-lead font-semibold tracking-[0.02em]"
              href={links.x}
              target="_blank"
              rel="noopener noreferrer"
            >
              x
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

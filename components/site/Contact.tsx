import { EMAIL, links } from "@/lib/links";
import { Frame } from "@/components/ui/Frame";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FleetStatus } from "@/components/site/FleetStatus";

const wordmarkH = "clamp(4.75rem, 14vw, 11.5rem)";

// Solid monochrome glyphs leading each contact link. Decorative — every link
// carries its own visible text label — so each <svg> is aria-hidden. iconClass
// sizes them in em (1.05×), so each glyph scales with its link's font-size;
// shrink-0 keeps the box from compressing in the inline-flex link. The
// envelope is an original geometric glyph; the X and LinkedIn glyphs are from
// Simple Icons (CC0 / public domain) — the marks are trademarks of their
// owners, shown nominatively as links to our own profiles. The GitHub glyph is
// likewise from Simple Icons (CC0 / public domain).
const iconClass = "size-[1.05em] shrink-0";

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={iconClass}
    >
      <path
        fillRule="evenodd"
        d="M2.5 5H21.5V19H2.5ZM3.6 6.2 12 12.6 20.4 6.2 20.4 8 12 14.4 3.6 8Z"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={iconClass}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={iconClass}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={iconClass}
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

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
            className="flex flex-col gap-y-8"
          >
            <div className="flex flex-col flex-wrap gap-x-10 gap-y-4 @md:flex-row @md:items-baseline">
              <a
                className="underline-brutal text-lead font-semibold tracking-[0.02em]"
                href={links.contact}
              >
                <MailIcon />
                {EMAIL}
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
                <LinkedInIcon />
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
                <XIcon />x (twitter)
                <span className="arrow" aria-hidden>
                  →
                </span>
              </a>
            </div>
            <div className="flex flex-col flex-wrap gap-x-10 gap-y-4 @md:flex-row @md:items-baseline">
              <a
                className="underline-brutal text-lead font-semibold tracking-[0.02em]"
                href={links.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon />
                github
                <span className="arrow" aria-hidden>
                  →
                </span>
              </a>
            </div>
          </div>
        </div>

        <FleetStatus className="block w-full" />
      </div>
    </Frame>
  );
}

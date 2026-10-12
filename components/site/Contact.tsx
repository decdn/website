import { EMAIL, links } from "@/lib/links";
import { CONTACT_HEADLINE, CONTACT_LEAD } from "@/lib/copy";
import { highlightBrand } from "@/components/ui/brand";
import { Frame } from "@/components/ui/Frame";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FleetStatus } from "@/components/site/FleetStatus";

// Solid monochrome glyphs leading each contact link. Decorative — every link
// carries its own visible text label — so each <svg> is aria-hidden. iconClass
// sizes them in em (1.05×), so each glyph scales with its link's font-size;
// shrink-0 keeps the box from compressing in the inline-flex link. The
// envelope is an original geometric glyph; the X and LinkedIn glyphs are from
// Simple Icons (CC0 / public domain) — the marks are trademarks of their
// owners, shown nominatively as links to our own profiles. The GitHub and
// Discord glyphs are likewise from Simple Icons (CC0 / public domain).
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

function DiscordIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={iconClass}
    >
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
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
    <Frame id="contact" tone="paper" className="overflow-hidden">
      <SectionHeader
        index="06"
        label="Contact"
        timestamp="open source · open network"
      />

      <div className="mt-14 grid gap-12 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,460px)] @4xl:items-start @4xl:gap-14">
        <div className="flex flex-col gap-12">
          {/* A display line, not the wordmark: the nav already carries the
              logo, and repeating it at 11rem said nothing about the section. */}
          <h2
            data-reveal
            id="contact-h"
            className="hug flex flex-col text-h2 leading-[0.92] font-semibold"
          >
            <span>{CONTACT_HEADLINE[0]}</span>
            {/* Whisper, not the dimmed second voice Compare uses: the fleet
                panel beside this greys out offline nodes and pulses live
                ones green, so a grey "open" line read as offline. */}
            <span className="pl-[3vw] text-whisper-text">
              {CONTACT_HEADLINE[1]}
            </span>
          </h2>

          <p
            data-reveal
            style={{ "--reveal-delay": "120ms" }}
            className="max-w-[64ch] text-body leading-[1.7]"
          >
            {highlightBrand(CONTACT_LEAD)}
          </p>

          <div
            data-reveal
            style={{ "--reveal-delay": "220ms" }}
            className="flex flex-col gap-y-4 @md:gap-y-8"
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
                <XIcon />X
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
              <a
                className="underline-brutal text-lead font-semibold tracking-[0.02em]"
                href={links.discord}
                target="_blank"
                rel="noopener noreferrer"
              >
                <DiscordIcon />
                discord
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

import type { ReactElement } from "react";
import { EMAIL, links } from "@/lib/links";
import {
  CONTACT_HEADLINE,
  CONTACT_LEAD,
  CONTACT_RUN_NODE,
  CONTACT_SOCIALS,
} from "@/lib/copy";
import { highlightBrand } from "@/components/home/brand";
import { Frame } from "@/components/ui/Frame";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FleetStatus } from "@/components/home/contact/FleetStatus";
import {
  DiscordIcon,
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
  XIcon,
} from "@/components/ui/icons";

// The list and its order live in CONTACT_SOCIALS (lib/copy.ts); this only
// pairs each entry with its glyph.
const SOCIAL_ICONS: Record<
  (typeof CONTACT_SOCIALS)[number]["link"],
  () => ReactElement
> = {
  github: GitHubIcon,
  discord: DiscordIcon,
  linkedin: LinkedInIcon,
  x: XIcon,
};

export function Contact() {
  return (
    <Frame id="contact" tone="ink" className="overflow-hidden max-md:pb-2">
      <SectionHeader
        index="06"
        label="Contact us"
        timestamp="open source · open network"
      />

      <div className="mt-14 grid gap-12 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,460px)] @4xl:items-start @4xl:gap-14">
        <div className="flex flex-col gap-12">
          {/* A display line, not the wordmark: the nav already carries the
              logo, and repeating it at 11rem said nothing about the section. */}
          <h2
            data-reveal
            id="contact-h"
            className="contact-h hug flex flex-col text-h2 leading-[0.92] font-semibold"
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
            <div className="flex">
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
            </div>
            {/* Icon-only at rest; the name slides in on mouse hover or
                keyboard focus only (see a.social-pill in globals.css), so a
                tap on touch navigates straight away. */}
            <ul className="flex flex-wrap gap-3" aria-label="decdn elsewhere">
              {CONTACT_SOCIALS.map(({ link, name }) => {
                const Icon = SOCIAL_ICONS[link];
                return (
                  <li key={name}>
                    <a
                      className="social-pill"
                      href={links[link]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`decdn on ${name}`}
                    >
                      <Icon />
                      <span className="social-pill-label">
                        <span>{name}</span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4">
          <FleetStatus className="block w-full" />
          {/* A footnote to the panel in its label register, so it does not
              compete with the contact links on the left. */}
          <a
            data-reveal
            style={{ "--reveal-delay": "320ms" }}
            className="meta inline-flex items-center gap-2 text-paper/60 transition-colors duration-200 ease-(--ease-soft) hover:text-paper focus-visible:text-paper"
            href={links.runNode}
            target="_blank"
            rel="noopener noreferrer"
          >
            {CONTACT_RUN_NODE}
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </Frame>
  );
}

import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Mono } from "@/components/ui/Mono";
import { links } from "@/lib/links";

const milestones = [
  {
    label: "Now",
    body: "PoC on Arbitrum Sepolia. Tens of nodes, public code.",
  },
  {
    label: "Next",
    body: "Multi-token payments via governance allowlist; content-takedown policy.",
  },
  {
    label: "Later",
    body: "Move to Arbitrum One. Liquidity via Balancer V3 80/20 TOKEN/USDC.",
  },
];

export function Status() {
  return (
    <Section id="status" eyebrow="Status & roadmap">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
        <div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Early, public, Rust.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Five-crate workspace covering <Mono>node</Mono>,{" "}
            <Mono>protocol</Mono>, <Mono>cache</Mono>, <Mono>incentive</Mono>,
            and <Mono>reputation</Mono>. We&apos;re looking for node operators,
            early integrators, and infrastructure-minded contributors.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href={links.github} variant="primary">
              Read the code
            </Button>
            <Button href={links.contact} variant="secondary">
              Get in touch
            </Button>
          </div>
        </div>
        <ol className="space-y-6">
          {milestones.map((m) => (
            <li
              key={m.label}
              className="grid grid-cols-[auto_1fr] gap-6 border-t border-line pt-6 first:border-t-0 first:pt-0"
            >
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                {m.label}
              </span>
              <span className="text-sm leading-relaxed text-muted">
                {m.body}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

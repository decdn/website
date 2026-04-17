import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Mono } from "@/components/ui/Mono";
import { links } from "@/lib/links";

type Entry = {
  stamp: string;
  tag: string;
  tone: "live" | "next" | "later";
  body: string;
};

const changelog: Entry[] = [
  {
    stamp: "2026-Q2",
    tag: "LIVE",
    tone: "live",
    body: "PoC on Arbitrum Sepolia. Tens of nodes, public code.",
  },
  {
    stamp: "2026-Q3",
    tag: "NEXT",
    tone: "next",
    body: "Multi-token payments via governance allowlist; content-takedown policy.",
  },
  {
    stamp: "2026-Q4",
    tag: "LATER",
    tone: "later",
    body: "Move to Arbitrum One. Liquidity via Balancer V3 80/20 TOKEN/USDC.",
  },
];

const toneColor: Record<Entry["tone"], string> = {
  live: "text-[color:var(--color-phosphor)]",
  next: "text-[color:var(--color-amber)]",
  later: "text-[color:var(--color-muted)]",
};

export function Status() {
  return (
    <Section id="status" eyebrow="05 · status & roadmap">
      <div className="grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <div>
          <h2 className="font-display text-4xl leading-[0.95] tracking-wide text-[color:var(--color-ink)] uppercase sm:text-6xl">
            Early.{" "}
            <span className="text-[color:var(--color-phosphor)] bloom">
              Public.
            </span>{" "}
            <span className="text-[color:var(--color-amber)] bloom-amber">
              Rust.
            </span>
          </h2>
          <p className="mt-8 max-w-xl text-[14px] leading-relaxed text-[color:var(--color-ink)]/85">
            Five-crate workspace covering <Mono>node</Mono>,{" "}
            <Mono>protocol</Mono>, <Mono>cache</Mono>, <Mono>incentive</Mono>,
            and <Mono>reputation</Mono>. We&apos;re looking for node operators,
            early integrators, and infrastructure-minded contributors.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href={links.github} variant="primary">
              read the code
            </Button>
            <Button href={links.contact} variant="secondary">
              say hello
            </Button>
          </div>
        </div>

        <div className="border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)]/60 font-mono">
          <div className="flex items-center justify-between border-b border-[color:var(--color-line)] px-5 py-2.5 text-[11px] tracking-[0.2em] text-[color:var(--color-muted)] uppercase">
            <span>
              <span className="text-[color:var(--color-phosphor-dim)]">$</span>{" "}
              cat CHANGELOG.md
            </span>
            <span className="hidden text-[color:var(--color-phosphor-dim)] sm:inline">
              v0.1 · main
            </span>
          </div>
          <ol className="divide-y divide-[color:var(--color-line)]">
            {changelog.map((e) => (
              <li key={e.stamp} className="px-5 py-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] tracking-[0.16em] uppercase">
                  <span className="text-[color:var(--color-muted)]">
                    [{e.stamp}]
                  </span>
                  <span className={`${toneColor[e.tone]}`}>{e.tag}</span>
                  <span className="h-px flex-1 bg-[color:var(--color-line)]" />
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-[color:var(--color-ink)]/85 normal-case">
                  {e.body}
                </p>
              </li>
            ))}
            <li className="px-5 py-5">
              <div className="flex items-center gap-3 text-[12px] tracking-[0.16em] text-[color:var(--color-phosphor-dim)] uppercase">
                <span className="cursor text-[color:var(--color-phosphor)]">
                  EOF
                </span>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </Section>
  );
}

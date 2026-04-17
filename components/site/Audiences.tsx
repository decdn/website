import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Mono } from "@/components/ui/Mono";
import { links } from "@/lib/links";

type Entry = {
  page: string;
  section: string;
  name: string;
  headline: string;
  description: React.ReactNode;
  seeAlso: string;
  cta: { href: string; label: string };
};

const entries: Entry[] = [
  {
    page: "DECDN(1)",
    section: "User Commands",
    name: "decdn-fetch",
    headline: "Drop-in, transparent, verifiable",
    description: (
      <>
        Fetch <Mono>BLAKE3</Mono>-addressed URLs from any peer. Integrity is
        checked by the hash, not the hostname. Failover is automatic — clients
        re-probe and re-route when a node disappears or slows.
      </>
    ),
    seeAlso: "blake3(3), quic(7), decdn-client(1)",
    cta: { href: links.docs, label: "man decdn-fetch" },
  },
  {
    page: "DECDN(8)",
    section: "System Operator",
    name: "decdn-node",
    headline: "Stake, serve, get paid",
    description: (
      <>
        Run the Rust node on commodity hardware. Stake <Mono>TOKEN</Mono>, set
        your rate, earn <Mono>USDC</Mono> per MB served. Reputation compounds —
        faster nodes get picked more, and get paid more.
      </>
    ),
    seeAlso: "slashing(7), reputation(7), decdn-config(5)",
    cta: { href: links.runNode, label: "$ run-node --stake" },
  },
];

export function Audiences() {
  return (
    <Section eyebrow="04 · who it's for">
      <h2 className="font-display max-w-3xl text-4xl leading-[0.95] tracking-wide text-[color:var(--color-ink)] uppercase sm:text-6xl">
        Ship content.{" "}
        <span className="text-[color:var(--color-amber)] bloom-amber">
          Or earn
        </span>
        <br />
        serving it.
      </h2>
      <div className="mt-14 grid gap-8 md:grid-cols-2">
        {entries.map((e) => (
          <article
            key={e.name}
            className="flex flex-col border border-[color:var(--color-line)] bg-[color:var(--color-bg)]"
          >
            <header className="flex items-center justify-between border-b border-[color:var(--color-line)] px-6 py-3 font-mono text-[11px] tracking-[0.18em] text-[color:var(--color-muted)] uppercase">
              <span className="text-[color:var(--color-phosphor)]">
                {e.page}
              </span>
              <span>deCDN · manual</span>
              <span className="hidden sm:inline">{e.page}</span>
            </header>
            <div className="flex flex-col gap-5 px-6 py-7">
              <ManSection label="NAME">
                <span className="text-[color:var(--color-phosphor)]">
                  {e.name}
                </span>
                <span className="mx-2 text-[color:var(--color-muted)]">—</span>
                <span>{e.headline}</span>
              </ManSection>

              <ManSection label="DESCRIPTION">
                <span className="text-[color:var(--color-ink)]/85">
                  {e.description}
                </span>
              </ManSection>

              <ManSection label="SEE ALSO">
                <span className="text-[color:var(--color-amber)]">
                  {e.seeAlso}
                </span>
              </ManSection>

              <div className="pt-3">
                <Button href={e.cta.href} variant="secondary">
                  {e.cta.label}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function ManSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[90px_1fr] gap-5 text-[13px] leading-relaxed sm:grid-cols-[110px_1fr]">
      <div className="pt-0.5 font-mono text-[10px] tracking-[0.22em] text-[color:var(--color-phosphor-dim)] uppercase">
        {label}
      </div>
      <div className="text-[color:var(--color-ink)]/85">{children}</div>
    </div>
  );
}

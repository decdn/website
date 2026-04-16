import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Mono } from "@/components/ui/Mono";
import { links } from "@/lib/links";

export function Audiences() {
  return (
    <Section eyebrow="Who it's for">
      <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        Ship content. Or earn serving it.
      </h2>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="flex flex-col rounded-lg border border-line p-8">
          <div className="font-mono text-xs tracking-[0.18em] text-muted">
            FOR DEVELOPERS
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-ink">
            Drop-in, transparent, verifiable
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Fetch <Mono>BLAKE3</Mono>-addressed URLs from any peer. Integrity is
            checked by the hash, not the hostname. Failover is automatic —
            clients re-probe and re-route when a node disappears or slows.
          </p>
          <div className="mt-8">
            <Button href={links.docs} variant="secondary">
              Integration docs →
            </Button>
          </div>
        </div>
        <div className="flex flex-col rounded-lg border border-line p-8">
          <div className="font-mono text-xs tracking-[0.18em] text-muted">
            FOR OPERATORS
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-ink">
            Stake, serve, get paid
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Run the Rust node on commodity hardware. Stake <Mono>TOKEN</Mono>,
            set your rate, earn <Mono>USDC</Mono> per MB served. Reputation
            compounds: faster nodes get picked more, and get paid more.
          </p>
          <div className="mt-8">
            <Button href={links.runNode} variant="secondary">
              Run a node →
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}

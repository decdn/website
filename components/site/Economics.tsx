import { Section } from "@/components/ui/Section";
import { Mono } from "@/components/ui/Mono";

export function Economics() {
  return (
    <Section id="economics" eyebrow="Economics">
      <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        Two tokens. One does the work.
      </h2>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface p-8">
          <div className="font-mono text-xs tracking-[0.18em] text-muted">
            STAKING &amp; GOVERNANCE
          </div>
          <div className="mt-3 font-mono text-3xl font-semibold tracking-tight text-ink">
            TOKEN
          </div>
          <p className="mt-6 text-sm leading-relaxed text-muted">
            Nodes stake <Mono>TOKEN</Mono> to earn the right to serve.
            Misbehavior is slashed. Holders steer protocol parameters — the
            ERC-20 allowlist, watchtower policy, regional takedown governance.
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-8">
          <div className="font-mono text-xs tracking-[0.18em] text-muted">
            DELIVERY &amp; SETTLEMENT
          </div>
          <div className="mt-3 font-mono text-3xl font-semibold tracking-tight text-ink">
            USDC
          </div>
          <p className="mt-6 text-sm leading-relaxed text-muted">
            Every probe, every served byte is paid for in <Mono>USDC</Mono>{" "}
            through a bilateral channel. Channels settle on L2 so the unit
            economics survive small files and short sessions.
          </p>
        </div>
      </div>
      <p className="mt-10 max-w-2xl text-sm leading-relaxed text-muted">
        Reputation propagates through a gossip mesh. Good nodes get routed to
        without a central registry; bad ones get priced out.
      </p>
    </Section>
  );
}

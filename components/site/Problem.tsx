import { Section } from "@/components/ui/Section";
import { Stat } from "@/components/ui/Stat";

export function Problem() {
  return (
    <Section eyebrow="The problem">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-24">
        <div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            CDNs are a three-provider oligopoly.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Today&apos;s web depends on a handful of operators, priced opaquely
            and concentrated at a few physical chokepoints. deCDN is a
            peer-to-peer alternative: anyone with bandwidth can run a node, and
            any client can route around failure or censorship by picking a
            different peer.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-8 self-end border-t border-line pt-8 lg:grid-cols-1 lg:border-0 lg:pt-0">
          <Stat label="Topology" value="P2P mesh" />
          <Stat label="Transport" value="QUIC" />
          <Stat label="Billing" value="per MB" />
        </div>
      </div>
    </Section>
  );
}

import { Section } from "@/components/ui/Section";
import { Mono } from "@/components/ui/Mono";

type Step = {
  n: string;
  title: string;
  body: React.ReactNode;
};

const steps: Step[] = [
  {
    n: "01",
    title: "Nodes stake and advertise",
    body: (
      <>
        Operators stake <Mono>TOKEN</Mono> on-chain and broadcast their rate and
        supported content over a gossip mesh. Slashing keeps them honest.
      </>
    ),
  },
  {
    n: "02",
    title: "Clients probe and rank",
    body: (
      <>
        A client probes candidate nodes and picks the best by{" "}
        <Mono>rate_per_mb × rtt_ms</Mono>. No central registry; the mesh
        decides.
      </>
    ),
  },
  {
    n: "03",
    title: "Encrypted delivery",
    body: (
      <>
        Content is envelope-encrypted with epoch-rotated keys. Nodes serve{" "}
        <Mono>BLAKE3</Mono>-addressed ciphertext — they never see plaintext.
      </>
    ),
  },
  {
    n: "04",
    title: "Metered payment",
    body: (
      <>
        Every byte is paid for via an off-chain <Mono>USDC</Mono> channel.
        Watchtowers monitor disputes non-custodially so settlement stays cheap.
      </>
    ),
  },
];

export function HowItWorks() {
  return (
    <Section id="how" eyebrow="How it works">
      <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        Cache-addressed content, metered delivery.
      </h2>
      <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
        {steps.map((s) => (
          <div
            key={s.n}
            className="flex flex-col gap-3 bg-canvas p-8 transition-colors hover:bg-surface"
          >
            <span className="font-mono text-xs tracking-[0.18em] text-accent">
              {s.n}
            </span>
            <h3 className="text-lg font-semibold tracking-tight text-ink">
              {s.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted">{s.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

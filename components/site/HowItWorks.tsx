import { Section } from "@/components/ui/Section";
import { Mono } from "@/components/ui/Mono";

type Step = {
  n: string;
  title: string;
  proc: string;
  body: React.ReactNode;
  gauge: string;
};

const steps: Step[] = [
  {
    n: "01",
    proc: "stake.advertise",
    title: "Nodes stake and advertise",
    body: (
      <>
        Operators stake <Mono>TOKEN</Mono> on-chain and broadcast their rate and
        supported content over a gossip mesh. Slashing keeps them honest.
      </>
    ),
    gauge: "████████████░░░░░░░░",
  },
  {
    n: "02",
    proc: "probe.rank",
    title: "Clients probe and rank",
    body: (
      <>
        A client probes candidate nodes and picks the best by{" "}
        <Mono>rate_per_mb × rtt_ms</Mono>. No central registry — the mesh
        decides.
      </>
    ),
    gauge: "█████████████████░░░",
  },
  {
    n: "03",
    proc: "encrypt.deliver",
    title: "Encrypted delivery",
    body: (
      <>
        Content is envelope-encrypted with epoch-rotated keys. Nodes serve{" "}
        <Mono>BLAKE3</Mono>-addressed ciphertext — they never see plaintext.
      </>
    ),
    gauge: "██████████████░░░░░░",
  },
  {
    n: "04",
    proc: "meter.settle",
    title: "Metered payment",
    body: (
      <>
        Every byte is paid for via an off-chain <Mono>USDC</Mono> channel.
        Watchtowers monitor disputes non-custodially so settlement stays cheap.
      </>
    ),
    gauge: "██████████████████░░",
  },
];

const asciiFlow = String.raw`
  ┌─────────┐        ┌───────────┐        ┌──────────────┐        ┌───────────┐
  │ client  │ ─prb─▶ │ mesh probe│ ─rnk─▶ │ picked peer  │ ─get─▶ │ delivery  │
  └─────────┘        └───────────┘        └──────────────┘        └───────────┘
        │                                        │                       │
        │                                        ▼                       ▼
        │                                 ┌──────────────┐        ┌───────────┐
        └────── pay-per-mb, off-chain ───▶│ usdc channel │ ─stl─▶ │ settle L2 │
                                          └──────────────┘        └───────────┘
`;

export function HowItWorks() {
  return (
    <Section id="how" eyebrow="02 · how it works">
      <h2 className="font-display max-w-3xl text-4xl leading-[0.95] tracking-wide text-[color:var(--color-ink)] uppercase sm:text-6xl">
        Cache-addressed content,
        <br />
        <span className="text-[color:var(--color-phosphor)] bloom">
          metered delivery.
        </span>
      </h2>

      <pre
        aria-hidden="true"
        className="ascii mt-12 hidden overflow-x-auto border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)]/60 p-6 text-[11px] md:block"
      >
        {asciiFlow.trim()}
      </pre>

      <div className="mt-10 grid gap-px border border-[color:var(--color-line)] bg-[color:var(--color-line)] sm:grid-cols-2">
        {steps.map((s, i) => (
          <article
            key={s.n}
            className="cell flex flex-col gap-4 border-[color:var(--color-line)] bg-[color:var(--color-bg)] p-8"
          >
            <header className="flex items-center justify-between font-mono text-[11px] tracking-[0.18em] uppercase">
              <span className="text-[color:var(--color-muted)]">
                <span className="text-[color:var(--color-phosphor-dim)]">
                  [
                </span>
                <span className="text-[color:var(--color-amber)]">
                  {s.n}/04
                </span>
                <span className="text-[color:var(--color-phosphor-dim)]">
                  ]
                </span>
                <span className="mx-2 text-[color:var(--color-muted)]">
                  PROC
                </span>
                <span className="text-[color:var(--color-phosphor)]">
                  {s.proc}
                </span>
              </span>
              <span className="text-[color:var(--color-phosphor-dim)]">
                pid·{1041 + i}
              </span>
            </header>
            <h3 className="font-display text-2xl leading-tight tracking-wide text-[color:var(--color-ink)] uppercase">
              {s.title}
            </h3>
            <p className="text-[13px] leading-relaxed text-[color:var(--color-ink)]/80">
              {s.body}
            </p>
            <div className="mt-auto flex items-center gap-3 pt-4 font-mono text-[10px] tracking-[0.18em] uppercase">
              <span className="text-[color:var(--color-muted)]">load</span>
              <span
                aria-hidden="true"
                className="text-[color:var(--color-phosphor)]"
              >
                {s.gauge}
              </span>
              <span className="text-[color:var(--color-phosphor-dim)]">OK</span>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

import { Section } from "@/components/ui/Section";
import { Mono } from "@/components/ui/Mono";

type Register = {
  label: string;
  ticker: string;
  role: string;
  body: React.ReactNode;
  gauge: string;
  share: string;
};

const registers: Register[] = [
  {
    label: "Staking & Governance",
    ticker: "TOKEN",
    role: "secures the mesh",
    body: (
      <>
        Nodes stake <Mono>TOKEN</Mono> to earn the right to serve. Misbehavior
        is slashed. Holders steer protocol parameters — the ERC-20 allowlist,
        watchtower policy, regional takedown governance.
      </>
    ),
    gauge: "█████████████░░░░░░░░░░░",
    share: "55 %",
  },
  {
    label: "Delivery & Settlement",
    ticker: "USDC",
    role: "pays for every byte",
    body: (
      <>
        Every probe, every served byte is paid for in <Mono>USDC</Mono> through
        a bilateral channel. Channels settle on L2 so the unit economics survive
        small files and short sessions.
      </>
    ),
    gauge: "██████████████████████░░░",
    share: "89 %",
  },
];

export function Economics() {
  return (
    <Section id="economics" eyebrow="03 · economics">
      <h2 className="font-display max-w-3xl text-4xl leading-[0.95] tracking-wide text-[color:var(--color-ink)] uppercase sm:text-6xl">
        Two tokens.{" "}
        <span className="text-[color:var(--color-amber)] bloom-amber">
          One does
        </span>
        <br />
        the work.
      </h2>
      <div className="mt-14 grid gap-8 md:grid-cols-2">
        {registers.map((r) => (
          <article
            key={r.ticker}
            className="relative flex flex-col border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)]/70"
          >
            {/* bracketed register label */}
            <header className="flex items-center justify-between border-b border-[color:var(--color-line)] px-6 py-3 font-mono text-[11px] tracking-[0.2em] uppercase">
              <span className="text-[color:var(--color-muted)]">
                <span className="text-[color:var(--color-phosphor-dim)]">
                  [
                </span>
                <span className="text-[color:var(--color-amber)]">
                  {r.label}
                </span>
                <span className="text-[color:var(--color-phosphor-dim)]">
                  ]
                </span>
              </span>
              <span className="text-[color:var(--color-phosphor-dim)]">
                reg·0x
                {r.ticker === "TOKEN" ? "01" : "02"}
              </span>
            </header>

            <div className="px-6 pt-8 pb-6">
              <div className="flex items-end justify-between gap-4">
                <span className="font-display text-6xl leading-none tracking-[0.04em] text-[color:var(--color-phosphor)] uppercase sm:text-7xl bloom">
                  {r.ticker}
                </span>
                <span className="pb-1 font-mono text-[11px] tracking-[0.18em] text-[color:var(--color-muted)] uppercase">
                  {r.role}
                </span>
              </div>

              <p className="mt-8 text-[13px] leading-relaxed text-[color:var(--color-ink)]/80">
                {r.body}
              </p>
            </div>

            <footer className="mt-auto grid grid-cols-[1fr_auto] items-center gap-4 border-t border-[color:var(--color-line)] px-6 py-4 font-mono text-[11px] tracking-[0.18em] uppercase">
              <span className="flex items-center gap-3">
                <span className="text-[color:var(--color-muted)]">
                  throughput
                </span>
                <span
                  aria-hidden="true"
                  className="text-[color:var(--color-phosphor)]"
                >
                  {r.gauge}
                </span>
              </span>
              <span className="text-[color:var(--color-amber)]">{r.share}</span>
            </footer>
          </article>
        ))}
      </div>
      <p className="mt-12 max-w-2xl text-[14px] leading-relaxed text-[color:var(--color-ink)]/75">
        Reputation propagates through a gossip mesh. Good nodes get routed to
        without a central registry; bad ones get priced out.
      </p>
    </Section>
  );
}

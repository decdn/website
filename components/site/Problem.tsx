import { Section } from "@/components/ui/Section";
import { Stat } from "@/components/ui/Stat";

const asciiChart = String.raw`
    market share  ·  top three vs everyone else

    akamai     ████████████████████████░░░░░░░░░░░░░░░░░░░░   32%
    cloudflare ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░   26%
    aws        ███████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   21%
    ·····································  ──  ────────────
    fastly     █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    6%
    bunny      ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    3%
    ~everyone  ██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   12%

    ── deCDN proposes a different picture ─────────────────
    · · · · · · · · · · · · · · · · · · · · · · · · · · ·
    ·   ·     ·   ·   ·       ·   ·     ·   ·   ·     ·
      ·   ·     ·     ·   ·     ·     ·   ·   ·   ·
    · · · · · · · ·  anyone with bandwidth  · · · · · · ·
`;

export function Problem() {
  return (
    <Section eyebrow="01 · the problem">
      <div className="grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <div>
          <h2 className="font-display text-4xl leading-[0.95] tracking-wide text-[color:var(--color-ink)] uppercase sm:text-6xl">
            CDNs are a{" "}
            <span className="text-[color:var(--color-amber)] bloom-amber">
              three-provider
            </span>
            <br />
            oligopoly.
          </h2>
          <p className="mt-8 max-w-xl text-[14px] leading-relaxed text-[color:var(--color-ink)]/85">
            Today&apos;s web depends on a handful of operators — priced opaquely
            and concentrated at a few physical chokepoints. deCDN is a
            peer-to-peer alternative: anyone with bandwidth can run a node, and
            any client can route around failure or censorship by picking a
            different peer.
          </p>
          <pre
            aria-hidden="true"
            className="ascii mt-10 hidden overflow-x-auto border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)]/60 p-6 text-[11px] sm:block"
          >
            {asciiChart.trim()}
          </pre>
        </div>
        <div className="grid grid-cols-3 gap-8 self-start border-t border-[color:var(--color-line)] pt-10 lg:grid-cols-1 lg:gap-10 lg:border-0 lg:pt-0">
          <Stat label="Topology" value="P2P mesh" />
          <Stat label="Transport" value="QUIC" />
          <Stat label="Billing" value="per MB" />
        </div>
      </div>
    </Section>
  );
}

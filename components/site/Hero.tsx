import { Button } from "@/components/ui/Button";
import { Mono } from "@/components/ui/Mono";
import { links } from "@/lib/links";

const bootLines: { prefix: string; text: string; tone?: "ok" | "warn" }[] = [
  { prefix: ">", text: "decdn /boot --release 0.1.0 --net arbitrum-sepolia" },
  {
    prefix: "··",
    text: "loading protocol ................. ok",
    tone: "ok",
  },
  {
    prefix: "··",
    text: "gossip mesh ...................... 142 peers online",
    tone: "ok",
  },
  {
    prefix: "··",
    text: "channel manager .................. usdc opened",
    tone: "ok",
  },
  { prefix: ">", text: "ready. stake. serve. get paid." },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* phosphor radial wash behind the poster */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(800px circle at 18% 20%, rgba(124,246,196,0.12) 0%, transparent 55%), radial-gradient(500px circle at 90% 60%, rgba(244,195,112,0.08) 0%, transparent 55%)",
        }}
      />
      <div className="mx-auto w-full max-w-5xl px-6 pt-16 pb-28 sm:px-8 sm:pt-24 sm:pb-36">
        {/* Terminal boot window */}
        <div className="border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)]/60 font-mono text-[12px] leading-relaxed">
          <div className="flex items-center justify-between border-b border-[color:var(--color-line)] px-4 py-2 text-[color:var(--color-muted)]">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-[color:var(--color-rose)]/80"
              />
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-[color:var(--color-amber)]/80"
              />
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-[color:var(--color-phosphor)]/80"
              />
              <span className="ml-3 tracking-[0.14em] uppercase">
                decdn@edge · /dev/ttyS0
              </span>
            </div>
            <span className="hidden tracking-[0.14em] text-[color:var(--color-phosphor-dim)] uppercase sm:inline">
              live
            </span>
          </div>
          <div className="px-4 py-4 sm:px-5">
            <ol>
              {bootLines.map((line, i) => (
                <li key={i} data-delay={i + 1} className="boot-line flex gap-3">
                  <span
                    aria-hidden="true"
                    className="text-[color:var(--color-phosphor-dim)]"
                  >
                    {line.prefix}
                  </span>
                  <span
                    className={
                      line.tone === "ok"
                        ? "text-[color:var(--color-ink)]"
                        : "text-[color:var(--color-phosphor)]"
                    }
                  >
                    {line.text}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Poster headline */}
        <h1 className="crt-title font-display mt-12 max-w-4xl text-[56px] leading-[0.95] tracking-[0.01em] uppercase sm:text-[104px] sm:leading-[0.92]">
          A decentralized
          <br />
          CDN{" "}
          <span className="text-[color:var(--color-amber)] bloom-amber">
            paid per
          </span>
          <br />
          megabyte
          <span
            aria-hidden="true"
            className="ml-2 inline-block align-baseline text-[color:var(--color-phosphor)]"
          >
            _
          </span>
        </h1>

        {/* Subhead */}
        <p className="reveal mt-10 max-w-2xl text-[15px] leading-relaxed text-[color:var(--color-ink)]/85">
          Stake-secured nodes cache and serve <Mono>BLAKE3</Mono>-addressed
          content over <Mono>QUIC</Mono>. Clients pay per&nbsp;MB in{" "}
          <Mono>USDC</Mono> through off-chain payment channels. No hyperscaler
          required.
        </p>

        {/* Metadata strip */}
        <dl className="reveal mt-8 grid grid-cols-2 gap-x-8 gap-y-3 font-mono text-[11px] tracking-[0.12em] uppercase sm:grid-cols-4">
          {[
            { k: "TRANSPORT", v: "QUIC / UDP" },
            { k: "ADDRESSING", v: "BLAKE3" },
            { k: "SETTLEMENT", v: "USDC / L2" },
            { k: "TOPOLOGY", v: "P2P MESH" },
          ].map(({ k, v }) => (
            <div key={k} className="flex flex-col gap-1">
              <dt className="text-[color:var(--color-muted)]">{k}</dt>
              <dd className="text-[color:var(--color-phosphor)]">{v}</dd>
            </div>
          ))}
        </dl>

        {/* CTAs */}
        <div className="reveal mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button href={links.whitepaper} variant="primary">
            read whitepaper
          </Button>
          <Button href={links.github} variant="secondary">
            git clone decdn
          </Button>
          <span className="mt-1 ml-0 font-mono text-[11px] tracking-[0.14em] text-[color:var(--color-muted)] uppercase sm:mt-0 sm:ml-4">
            · poc live on arbitrum sepolia
          </span>
        </div>
      </div>
    </section>
  );
}

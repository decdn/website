import { links } from "@/lib/links";

export default function Home() {
  return (
    <main>
      {/* ═══════════════════════════════════════════════════════════ §01 HERO */}
      <section
        id="s-01"
        aria-labelledby="s-01-h"
        className="relative flex min-h-[100svh] scroll-mt-[-48px] flex-col bg-[var(--paper)] px-4 pt-24 pb-12 text-[var(--ink)] sm:px-10 sm:pt-28 sm:pb-16"
      >
        <SectionHeader
          index="01"
          label="Hero"
          timestamp="2026-04 · devnet v0.0.0"
        />

        <div className="mt-auto flex flex-col gap-8 sm:gap-12">
          <div className="rise rise-0 flex flex-wrap items-center gap-3">
            <span className="meta inline-flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block h-[8px] w-[8px] rounded-full"
                style={{ background: "var(--whisper)" }}
              />
              <span>live</span>
            </span>
            <span className="meta opacity-50" aria-hidden>
              ·
            </span>
            <span className="meta opacity-70">epoch 00042</span>
            <span className="meta opacity-50" aria-hidden>
              ·
            </span>
            <span className="meta opacity-70">quic / blake3</span>
          </div>

          <h1
            id="s-01-h"
            className="hug flex flex-col font-semibold leading-[0.9] tracking-[-0.04em]"
            style={{ fontSize: "clamp(40px, 8.4vw, 124px)" }}
          >
            <span className="rise rise-1">the delivery layer</span>
            <span className="rise rise-2 pl-[4vw]">
              for open<span style={{ color: "var(--whisper)" }}>.</span>
            </span>
            <span className="rise rise-2 pl-[8vw]">information.</span>
          </h1>

          <p className="rise rise-3 max-w-[64ch] text-[14px] leading-[1.65] sm:text-[15px]">
            a 14-gigabyte file posted in berlin reaches a client in tokyo in
            under a second. the client streams from three peers at once,
            verifies every chunk with blake3, and pays per megabyte in usdc —
            whether the payload is a linux iso, an open dataset, a game patch, a
            scientific archive, or an ai model. decdn is a peer-to-peer delivery
            layer built for open information at scale. the code is open. the
            network is open. the price is posted.
          </p>

          <div className="rise rise-4 flex flex-col flex-wrap gap-x-8 gap-y-3 sm:flex-row sm:items-end">
            <a
              className="underline-brutal text-[12px] font-semibold tracking-[0.14em] uppercase sm:text-[13px]"
              href={links.whitepaper}
            >
              read the whitepaper
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
            <a
              className="underline-brutal text-[12px] font-semibold tracking-[0.14em] uppercase sm:text-[13px]"
              href={links.runNode}
            >
              run a node
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
            <a
              className="underline-brutal text-[12px] font-semibold tracking-[0.14em] uppercase opacity-55 hover:opacity-100 sm:text-[13px]"
              href={links.github}
            >
              source
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
          </div>
        </div>

        <div className="rise rise-5 mt-12 grid grid-cols-2 gap-y-4 sm:grid-cols-4">
          <Figure k="target price" v="$0.01/GB" />
          <Figure k="p50 latency" v="50–100 ms" />
          <Figure k="margin" v="64–83%" />
          <Figure k="gas overhead" v="<1%" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ §02 PROBLEM */}
      <section
        id="s-02"
        aria-labelledby="s-02-h"
        className="relative flex min-h-[100svh] scroll-mt-[-48px] flex-col bg-[var(--ink)] px-4 pt-24 pb-12 text-[var(--paper)] sm:px-10 sm:pt-28 sm:pb-16"
      >
        <SectionHeader
          index="02"
          label="The delivery layer failed"
          timestamp="problem · persistent"
        />

        <div className="mt-14 flex flex-col gap-12">
          <h2
            data-reveal
            id="s-02-h"
            className="hug flex flex-col font-semibold leading-[0.92] tracking-[-0.04em]"
            style={{ fontSize: "clamp(34px, 7vw, 104px)" }}
          >
            <span>open information scaled.</span>
            <span className="pl-[3vw] opacity-60">
              its plumbing didn&apos;t.
            </span>
          </h2>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-12 sm:gap-10">
            <p
              data-reveal
              style={{
                color: "rgb(255 255 255 / 0.75)",
                ["--reveal-delay" as string]: "120ms",
              }}
              className="max-w-[62ch] text-[14px] leading-[1.7] sm:col-span-7 sm:text-[15px]"
            >
              the pattern repeats whenever something big ships. a fresh linux
              iso, a 200-gigabyte game patch, an open-science dataset, the
              latest open-weight ai model — the url gets hammered, mirrors fork,
              cdns rate-limit. small teams burn tens of thousands a month
              hosting bytes they don&apos;t own. cloudflare, aws, akamai run the
              pipes. their pricing is a toll booth on open information:{" "}
              <strong className="font-semibold">
                $0.085–$0.17 per gigabyte
              </strong>
              , fixed provisioning, monthly minimums. the infrastructure layer
              concentrates exactly where the apps promise to decentralise.
            </p>

            <ul
              data-reveal
              style={{ ["--reveal-delay" as string]: "220ms" }}
              className="flex flex-col gap-3 text-[13px] sm:col-span-5"
            >
              <Ledger k="legacy price" v="$0.085–$0.17 / GB" />
              <Ledger k="delivery model" v="fixed provisioning" />
              <Ledger k="counterparties" v="3 hyperscalers" />
              <Ledger k="subscription" v="monthly, flat" />
              <Ledger k="sovereignty" v="custodial" />
            </ul>
          </div>
        </div>

        <div data-reveal className="mt-auto flex flex-col gap-5 pt-12">
          <div className="flex flex-col gap-2">
            <span className="meta opacity-60">before</span>
            <div
              className="hug relative inline-flex font-semibold tracking-[-0.05em]"
              style={{
                fontSize: "clamp(40px, 8vw, 112px)",
                lineHeight: "0.92",
              }}
            >
              <span className="relative">
                $0.085–$0.17/GB
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-1/2 h-[4px] -translate-y-1/2 sm:h-[6px]"
                  style={{ background: "var(--paper)" }}
                />
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 pl-[4vw]">
            <span className="meta">after · decdn</span>
            <div
              className="hug font-semibold tracking-[-0.05em]"
              style={{
                fontSize: "clamp(48px, 11vw, 160px)",
                lineHeight: "0.9",
              }}
            >
              <span aria-hidden className="pr-3 opacity-60">
                →
              </span>
              $0.01/GB
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ §03 METHOD */}
      <section
        id="s-03"
        aria-labelledby="s-03-h"
        className="relative flex min-h-[100svh] scroll-mt-[-48px] flex-col bg-[var(--paper)] px-4 pt-24 pb-12 text-[var(--ink)] sm:px-10 sm:pt-28 sm:pb-16"
      >
        <SectionHeader
          index="03"
          label="How it works"
          timestamp="probe · stream · settle"
        />

        <h2 id="s-03-h" className="sr-only">
          How it works
        </h2>

        <div className="mt-14 flex flex-col divide-y divide-current/20">
          <MethodRow
            n="01"
            word="probe"
            delay={0}
            body="the client broadcasts a blake3 hash over quic 0-rtt. within about thirty milliseconds every nearby node replies with a price and a latency estimate. the client picks one — or several in parallel — by reputation, stake, and the number the operator is willing to quote today."
          />
          <MethodRow
            n="02"
            word="stream"
            delay={120}
            body="the winning node streams chunks as fast as its uplink can move them. the client verifies each chunk the moment it arrives; mismatched bytes get discarded and re-pulled from the next peer on the list. a node that returns garbage loses its staked token on the spot. trust no node — verify each one."
          />
          <MethodRow
            n="03"
            word="settle"
            delay={240}
            body="payment happens per megabyte, in usdc, through an off-chain channel opened at session start. operators hold real stable currency they can spend on electricity and bandwidth. the channel settles on arbitrum at session close — gas is a rounding error next to the bytes delivered."
          />
        </div>

        <div data-reveal className="mt-auto pt-12">
          <span className="meta mb-3 block opacity-60">stack</span>
          <div
            className="hug flex flex-wrap items-baseline gap-x-5 gap-y-2 font-semibold tracking-[-0.03em]"
            style={{ fontSize: "clamp(22px, 4vw, 56px)" }}
          >
            <span>blake3</span>
            <span aria-hidden className="opacity-30">
              ·
            </span>
            <span>quic</span>
            <span aria-hidden className="opacity-30">
              ·
            </span>
            <span>iroh</span>
            <span aria-hidden className="opacity-30">
              ·
            </span>
            <span>usdc</span>
            <span aria-hidden className="opacity-30">
              ·
            </span>
            <span>arbitrum</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-y-4 sm:grid-cols-4">
            <Figure k="language" v="rust" />
            <Figure k="transport" v="quic / iroh" />
            <Figure k="settlement" v="arbitrum" />
            <Figure k="currency" v="usdc · token" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ §04 FAQ */}
      <section
        id="s-04"
        aria-labelledby="s-04-h"
        className="relative flex min-h-[100svh] scroll-mt-[-48px] flex-col bg-[var(--ink)] px-4 pt-24 pb-12 text-[var(--paper)] sm:px-10 sm:pt-28 sm:pb-16"
      >
        <SectionHeader index="04" label="FAQ" timestamp="field notes" />

        <div className="mt-14 flex flex-col gap-10">
          <h2
            data-reveal
            id="s-04-h"
            className="hug font-semibold leading-[0.92] tracking-[-0.04em]"
            style={{ fontSize: "clamp(34px, 7vw, 104px)" }}
          >
            frequently asked.
          </h2>

          <dl className="flex flex-col divide-y divide-current/20">
            <FAQ
              delay={0}
              q="How is it 90% cheaper?"
              a="Legacy CDNs provision for peak traffic and amortise that cost across long contracts, so a popular release gets expensive fast. deCDN's supply forms around demand — nodes cache what's hot, clients pay only for what they pull, and cost per gigabyte decreases as regional demand concentrates instead of increasing. Target price today: ~$0.01/GB, one cent, per actual gigabyte delivered."
            />
            <FAQ
              delay={80}
              q="How is byte-level integrity enforced?"
              a="Every blob is BLAKE3-addressed, so the hash the client is asking for is the same hash they'll be checking on the way in. Verification happens chunk-by-chunk, in flight — mismatched bytes are dropped and the next peer on the list is asked instead. Peers that send garbage lose staked TOKEN via a non-custodial Merkle proof. There is no central arbiter; the math is the arbiter."
            />
            <FAQ
              delay={160}
              q="Why does the network need a token?"
              a="TOKEN secures the network — operators stake it to participate, and they lose it if they misbehave. Payments, though, happen in USDC, because operators want stable currency they can pay power bills with. Twenty percent of protocol fees flow into a Balancer V3 80/20 TOKEN/USDC buyback, tying token demand to network throughput."
            />
            <FAQ
              delay={240}
              q="Who actually pays?"
              a="The client pulling the bytes. When a session starts, the client opens an off-chain USDC channel and streams payment per megabyte as chunks arrive. No subscription, no account, no invoice — when the download finishes, the channel closes and settles. You pay for what you pulled, nothing more."
            />
            <FAQ
              delay={320}
              q="What happens if a node lies?"
              a="The client detects the BLAKE3 mismatch on the very next chunk, drops the connection, and files a Merkle proof against the node's stake. The good node further down the list keeps streaming — the client barely notices. The bad node loses TOKEN on-chain within minutes. Misbehaviour is expensive by construction."
            />
            <FAQ
              delay={400}
              q="Can I just use S3 and skip all this?"
              a="Sure, until the traffic piles on — a surprise open dataset, a hyped game patch, a trending ai model, a press mention that breaks the server — and you're paying AWS $0.09 per gigabyte to 200,000 downloaders in forty-eight hours. deCDN is built for the moment the origin can't keep up — the network self-heals around demand instead of collapsing under it, and the per-request price goes down, not up."
            />
          </dl>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ §05 CLOSE */}
      <section
        id="s-05"
        aria-labelledby="s-05-h"
        className="relative flex min-h-[100svh] scroll-mt-[-48px] flex-col bg-[var(--paper)] px-4 pt-24 pb-10 text-[var(--ink)] sm:px-10 sm:pt-28 sm:pb-12"
      >
        <SectionHeader
          index="05"
          label="Contact"
          timestamp="open source · open network"
        />

        <div className="mt-14 flex flex-col gap-12">
          <h2 id="s-05-h" className="sr-only">
            Contact
          </h2>

          <div
            data-reveal
            className="hug flex items-baseline gap-2 font-semibold tracking-[-0.05em]"
            style={{ fontSize: "clamp(56px, 14vw, 200px)", lineHeight: "0.86" }}
          >
            <span>decdn</span>
            <span aria-hidden style={{ color: "var(--whisper)" }}>
              .
            </span>
          </div>

          <p
            data-reveal
            style={{ ["--reveal-delay" as string]: "120ms" }}
            className="max-w-[64ch] text-[14px] leading-[1.7] sm:text-[15px]"
          >
            decdn is a peer-to-peer delivery layer for large files — open
            datasets, scientific archives, linux distros, game builds, video
            libraries, open-weight ai models, anything meant to be pulled a
            million times and that shouldn&apos;t depend on one bucket. the code
            is open. the network is open. the price is posted.
          </p>

          <div
            data-reveal
            style={{ ["--reveal-delay" as string]: "220ms" }}
            className="flex flex-col flex-wrap gap-x-10 gap-y-4 sm:flex-row sm:items-baseline"
          >
            <a
              className="underline-brutal text-[14px] font-semibold tracking-[0.02em] sm:text-[16px]"
              href={links.whitepaper}
            >
              read the whitepaper
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
            <a
              className="underline-brutal text-[14px] font-semibold tracking-[0.02em] sm:text-[16px]"
              href={links.runNode}
            >
              run a node
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
            <a
              className="underline-brutal text-[14px] font-semibold tracking-[0.02em] sm:text-[16px]"
              href={links.github}
            >
              source on github
              <span className="arrow" aria-hidden>
                →
              </span>
            </a>
          </div>
        </div>

        <footer className="mt-auto flex flex-col gap-3 pt-16">
          <span aria-hidden className="rule opacity-40" />
          <div className="grid grid-cols-1 gap-2 text-[11px] tracking-[0.2em] uppercase opacity-80 sm:grid-cols-3 sm:items-center">
            <span>© mmxxvi · decdn labs</span>
            <span className="sm:text-center">
              built in rust · rendered in geist
            </span>
            <span className="tabular-nums sm:text-right">
              node-001 / v0.0.0
            </span>
          </div>
        </footer>
      </section>
    </main>
  );
}

/* ─────────────────────────────────────────────────────────── helpers ── */

function SectionHeader({
  index,
  label,
  timestamp,
}: {
  index: string;
  label: string;
  timestamp: string;
}) {
  return (
    <header className="flex flex-col gap-3">
      <span aria-hidden className="rule opacity-50" />
      <div className="flex items-baseline justify-between gap-6 text-[11px] font-medium tracking-[0.22em] uppercase">
        <span>
          § {index} / {label}
        </span>
        <span className="tabular-nums opacity-60">{timestamp}</span>
      </div>
    </header>
  );
}

function Figure({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="meta opacity-60">{k}</span>
      <span
        className="text-[15px] font-medium tabular-nums sm:text-[17px]"
        style={{ letterSpacing: "-0.01em" }}
      >
        {v}
      </span>
    </div>
  );
}

function Ledger({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-t border-current/20 pt-2">
      <span className="meta opacity-60">{k}</span>
      <span className="tabular-nums">{v}</span>
    </li>
  );
}

function MethodRow({
  n,
  word,
  body,
  delay = 0,
}: {
  n: string;
  word: string;
  body: string;
  delay?: number;
}) {
  return (
    <div
      data-reveal
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
      className="grid grid-cols-1 gap-4 py-7 sm:grid-cols-12 sm:gap-10 sm:py-10"
    >
      <div className="meta tabular-nums opacity-60 sm:col-span-1">{n}</div>
      <div
        className="hug font-semibold tracking-[-0.05em] sm:col-span-5"
        style={{ fontSize: "clamp(32px, 6.5vw, 96px)", lineHeight: "0.9" }}
      >
        {word}
      </div>
      <p className="max-w-[56ch] text-[14px] leading-[1.65] sm:col-span-6 sm:text-[15px]">
        {body}
      </p>
    </div>
  );
}

function FAQ({ q, a, delay = 0 }: { q: string; a: string; delay?: number }) {
  return (
    <div
      data-reveal
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
      className="grid grid-cols-1 gap-3 py-6 sm:grid-cols-12 sm:gap-8 sm:py-8"
    >
      <div className="text-[16px] font-semibold tracking-[-0.01em] sm:col-span-5 sm:text-[18px]">
        {q}
      </div>
      <p
        className="max-w-[60ch] text-[14px] leading-[1.7] sm:col-span-7 sm:text-[15px]"
        style={{ color: "rgb(255 255 255 / 0.75)" }}
      >
        {a}
      </p>
    </div>
  );
}

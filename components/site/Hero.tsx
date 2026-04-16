import { Button } from "@/components/ui/Button";
import { Mono } from "@/components/ui/Mono";
import { links } from "@/lib/links";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(600px circle at 20% 10%, var(--color-accent) 0%, transparent 45%), radial-gradient(500px circle at 85% 40%, var(--color-line) 0%, transparent 55%)",
        }}
      />
      <div className="mx-auto w-full max-w-5xl px-6 pt-24 pb-32 sm:px-8 sm:pt-32 sm:pb-40">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 font-mono text-xs text-muted">
          <span
            className="h-1.5 w-1.5 rounded-full bg-accent"
            aria-hidden="true"
          />
          PoC live on Arbitrum Sepolia
        </div>
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          A decentralized CDN
          <br className="hidden sm:block" />{" "}
          <span className="text-muted">paid per megabyte.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
          Stake-secured nodes cache and serve <Mono>BLAKE3</Mono>-addressed
          content over <Mono>QUIC</Mono>. Clients pay per&nbsp;MB in{" "}
          <Mono>USDC</Mono> through off-chain payment channels. No hyperscaler
          required.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button href={links.whitepaper} variant="primary">
            Read the whitepaper
          </Button>
          <Button href={links.github} variant="secondary">
            View on GitHub →
          </Button>
        </div>
      </div>
    </section>
  );
}

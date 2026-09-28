"use client";

import { HERO_STATUS } from "@/lib/copy";
import { STATUS_URL } from "@/lib/links";
import { FLEET_WINDOW_HOURS, fleetView, type StatsResult } from "@/lib/stats";
import { useStats } from "@/lib/use-stats";

// Flat strip until the stats load.
const FLAT = Array<number>(FLEET_WINDOW_HOURS).fill(0);

/**
 * The link itself, from a stats result. Split from `HeroStatus` so the
 * rendering is a plain function a test can walk without a React renderer;
 * `HeroStatus` only adds the fetch. Mirrors `Figure`'s label/value lines so it
 * baseline-aligns with the hero stat strip beside it.
 */
export function HeroStatusLink({
  result,
  className,
}: {
  result: StatsResult;
  className?: string;
}) {
  const ok = result.status === "ok";
  // The last 24h of USDC settled, per hour — the same series as the fleet
  // panel's settled strip.
  const levels = ok ? fleetView(result.stats).settledSpark : FLAT;
  // Only claim "live" when the indexer is current.
  const live = ok && result.stats.caughtUp;

  return (
    <a
      className={`hero-status flex flex-col gap-1 ${className ?? ""}`}
      href={STATUS_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="meta opacity-60">{HERO_STATUS.label}</span>
      <span className="flex items-center gap-3 text-body font-medium tracking-[-0.01em]">
        <span
          aria-hidden
          className={live ? "status-live status-live-active" : "status-live"}
        />
        <span className="hero-status-text">
          {HERO_STATUS.value}
          <span className="arrow" aria-hidden>
            →
          </span>
        </span>
        <span aria-hidden className="status-strip">
          {levels.map((level, i) => (
            <span key={i} style={{ "--level": level }} />
          ))}
        </span>
      </span>
    </a>
  );
}

export function HeroStatus({ className }: { className?: string }) {
  return <HeroStatusLink result={useStats()} className={className} />;
}

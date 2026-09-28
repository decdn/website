"use client";

import { HERO_STATUS } from "@/lib/copy";
import { STATUS_URL } from "@/lib/links";
import type { StatsResult } from "@/lib/stats";
import { useStats } from "@/lib/use-stats";

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
  // Only claim "live" when the indexer is current.
  const live = result.status === "ok" && result.stats.caughtUp;

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
      </span>
    </a>
  );
}

export function HeroStatus({ className }: { className?: string }) {
  return <HeroStatusLink result={useStats()} className={className} />;
}

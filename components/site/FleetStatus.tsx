"use client";

import { PanelFigure } from "@/components/ui/PanelFigure";
import { PANEL_CAPTIONS } from "@/lib/copy";
import { FLEET_WINDOW_HOURS, fleetView, type StatsResult } from "@/lib/stats";
import { useStats } from "@/lib/use-stats";

const EMPTY_LABEL = {
  loading: "loading",
  error: "stats unavailable",
} as const;

// Flat strips until the stats load.
const FLAT = Array<number>(FLEET_WINDOW_HOURS).fill(0);

/** One hourly spark strip: a cell per hour, its height the hour's share of
 *  the window's busiest hour. */
function Spark({ levels }: { levels: number[] }) {
  return (
    <div className="fleet-spark">
      {levels.map((level, i) => (
        <span
          key={i}
          className="fleet-spark-cell"
          style={{ "--level": level }}
        />
      ))}
    </div>
  );
}

/**
 * The panel itself, from a stats result. Split from `FleetStatus` so the
 * rendering is a plain function a test can walk without a React renderer;
 * `FleetStatus` only adds the fetch.
 */
export function FleetPanel({
  result,
  className,
}: {
  result: StatsResult;
  className?: string;
}) {
  const view = result.status === "ok" ? fleetView(result.stats) : null;
  return (
    <PanelFigure
      className={className}
      panelClassName="fleet"
      caption={PANEL_CAPTIONS.fleet}
    >
      <div className="fleet-head">
        <span className="fleet-dot" />
        <span className="fleet-dot" />
        <span className="fleet-dot" />
        <span className="fleet-head-label">
          decdn · fleet · arbitrum sepolia
          {view && !view.caughtUp ? " · catching up" : ""}
        </span>
      </div>

      <div className="fleet-body">
        <div className="fleet-summary">
          <span className="fleet-value">{view ? view.registered : "—"}</span>
          <span className="fleet-dim">nodes registered</span>
        </div>

        {view ? (
          view.regions.length > 0 ? (
            view.regions.map((r, i) => (
              <div key={r.code} className="fleet-row">
                <span className="fleet-code">{r.code}</span>
                <span
                  className={
                    r.nodes > 0
                      ? `fleet-pulse fleet-pulse-active pulse-${i % 6}`
                      : "fleet-pulse"
                  }
                />
                <span
                  className={
                    r.nodes > 0 ? "fleet-rate" : "fleet-rate fleet-dim"
                  }
                >
                  <span className="fleet-dim">
                    {r.nodes} {r.nodes === 1 ? "node" : "nodes"} ·{" "}
                  </span>
                  {r.served}
                </span>
              </div>
            ))
          ) : (
            <div className="fleet-note">no nodes registered yet</div>
          )
        ) : (
          <div className="fleet-note">
            {EMPTY_LABEL[result.status as keyof typeof EMPTY_LABEL]}
          </div>
        )}
        {view && view.moreRegions > 0 && (
          <div className="fleet-note">
            + {view.moreRegions} more{" "}
            {view.moreRegions === 1 ? "region" : "regions"}
          </div>
        )}

        <div className="fleet-divider" />

        <div className="fleet-agg">
          <span className="fleet-dim">Σ served · 24h</span>
          <span className="fleet-value">{view ? view.served24h : "—"}</span>
        </div>
        <Spark levels={view ? view.servedSpark : FLAT} />

        <div className="fleet-agg">
          <span className="fleet-dim">Σ settled · 24h</span>
          <span className="fleet-value">{view ? view.settled24h : "—"}</span>
        </div>
        <Spark levels={view ? view.settledSpark : FLAT} />
      </div>
    </PanelFigure>
  );
}

// Every figure is read from the live stats file (lib/stats.ts) after mount;
// the static HTML carries the loading state.
export function FleetStatus({ className }: { className?: string }) {
  return <FleetPanel result={useStats()} className={className} />;
}

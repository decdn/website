"use client";

import { PanelFigure } from "@/components/ui/PanelFigure";
import { PANEL_CAPTIONS } from "@/lib/copy";
import {
  FLEET_WINDOW_HOURS,
  fleetView,
  type StatsResult,
  timeAgo,
} from "@/lib/stats";
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
          view.nodes.length > 0 ? (
            view.nodes.map((n, i) => (
              <div key={n.key} className="fleet-row">
                <span className="fleet-code">{n.region}</span>
                <span
                  className={
                    n.lastSettled !== null
                      ? `fleet-pulse fleet-pulse-active pulse-${i % 6}`
                      : "fleet-pulse"
                  }
                />
                <span className="fleet-rate">
                  {n.operator}
                  <span className="fleet-dim">
                    {" · "}
                    {n.lastSettled !== null && result.status === "ok"
                      ? `settled ${timeAgo(n.lastSettled, result.fetchedAt)}`
                      : "idle"}
                  </span>
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
        {view && view.moreNodes > 0 && (
          <div className="fleet-note">
            + {view.moreNodes} more {view.moreNodes === 1 ? "node" : "nodes"}
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

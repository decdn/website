"use client";

import { useEffect, useState } from "react";
import { PanelFigure } from "@/components/ui/PanelFigure";
import { PANEL_CAPTIONS } from "@/lib/copy";
import { STATS_URL, terminalSessions, timeAgo } from "@/lib/stats";
import { useStats } from "@/lib/use-stats";

const CYCLE_MS = 4500;

export function HeroTerminal({ className }: { className?: string }) {
  const result = useStats();
  const sessions = result.status === "ok" ? terminalSessions(result.stats) : [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (sessions.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % sessions.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [sessions.length]);

  const s = sessions.length > 0 ? sessions[index % sessions.length] : null;
  const catchingUp = result.status === "ok" && !result.stats.caughtUp;

  return (
    // Every figure below is a real FeeRouter `Settled` log from the stats
    // file; PanelFigure carries the caption that says so, outside the
    // aria-hidden subtree.
    <PanelFigure
      className={className}
      panelClassName="terminal"
      caption={PANEL_CAPTIONS.terminal}
    >
      <div className="terminal-head">
        <span className="terminal-dot" />
        <span className="terminal-dot" />
        <span className="terminal-dot" />
        <span className="terminal-label">
          arbitrum sepolia ~ settled{catchingUp ? " · catching up" : ""}
        </span>
      </div>

      {/* key forces a remount every cycle so the CSS line cascade
            and progress bar restart cleanly when the session flips. */}
      {s ? (
        <div className="terminal-body" key={s.key}>
          <div className="tl tl-0">
            <span className="prompt">$</span>
            <span> settled </span>
            <span className="hash">tx {s.tx}</span>
          </div>

          <div className="tl tl-1">
            <span className="arrow">→</span>
            <span> block {s.block}</span>
            <span className="dim"> · epoch {s.epoch}</span>
          </div>

          <div className="tl tl-2">
            <span className="arrow">→</span>
            <span> operator {s.operator}</span>
            {s.region && <span className="dim"> · {s.region}</span>}
          </div>

          <div className="tl tl-3">
            <span className="arrow">→</span>
            <span> delivered {s.size} </span>
            <span className="progress" aria-hidden>
              <span className="progress-fill" />
            </span>
          </div>

          <div className="tl tl-4">
            <span className="ok">✓</span>
            <span> paid </span>
            <span className="amount">{s.amount}</span>
            <span className="dim"> usdc</span>
          </div>

          <div className="tl tl-5">
            <span className="ok">✓</span>
            <span> on-chain </span>
            <span className="dim">
              {result.status === "ok" && timeAgo(s.timestamp, result.fetchedAt)}
            </span>
          </div>

          <div className="tl tl-6">
            <span className="prompt">$</span>
            <span className="cursor" aria-hidden />
          </div>
        </div>
      ) : (
        <div className="terminal-body">
          <div className="tl tl-0">
            <span className="prompt">$</span>
            <span> read </span>
            <span className="hash">{STATS_URL.replace("https://", "")}</span>
          </div>
          <div className="tl tl-1">
            <span className="arrow">→</span>
            <span className="dim">
              {result.status === "loading"
                ? " loading"
                : result.status === "error"
                  ? " stats unavailable"
                  : " no settlements indexed yet"}
            </span>
          </div>
          {/* Blank lines hold the panel at its seven-line height, so the
              hero doesn't shift when the first settlement lands. */}
          {[2, 3, 4, 5].map((n) => (
            <div key={n} className={`tl tl-${n}`}>
              {"\u00a0"}
            </div>
          ))}
          <div className="tl tl-6">
            <span className="prompt">$</span>
            <span className="cursor" aria-hidden />
          </div>
        </div>
      )}
    </PanelFigure>
  );
}

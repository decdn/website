"use client";

import { useEffect, useState } from "react";

type Session = {
  hash: string;
  peerCount: string;
  probeMs: string;
  peers: string;
  size: string;
  chunks: string;
  price: string;
  duration: string;
};

const SESSIONS: readonly Session[] = [
  {
    hash: "c4a8f93142e1…9b37",
    peerCount: "18",
    probeMs: "41",
    peers: "dxb-02, jnb-01, syd-08",
    size: "13.4 GB",
    chunks: "1712",
    price: "$0.1309",
    duration: "1.27s",
  },
  {
    hash: "3f8c1ab4e92d…d55a",
    peerCount: "12",
    probeMs: "34",
    peers: "ber-14, icn-03, sfo-22",
    size: "550 MB",
    chunks: "86",
    price: "$0.0055",
    duration: "0.48s",
  },
  {
    hash: "9c21f088a774…3bde",
    peerCount: "14",
    probeMs: "28",
    peers: "nyc-07, fra-11, sgp-02",
    size: "4.2 GB",
    chunks: "672",
    price: "$0.0411",
    duration: "0.89s",
  },
];

const CYCLE_MS = 4500;

export function HeroTerminal({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SESSIONS.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, []);

  // Defensive: if SESSIONS length shrinks across an HMR reload while
  // index is stale, modulo keeps it within bounds.
  const s = SESSIONS[index % SESSIONS.length];

  return (
    <div aria-hidden className={className}>
      <div className="terminal">
        <div className="terminal-head">
          <span className="terminal-dot" />
          <span className="terminal-dot" />
          <span className="terminal-dot" />
          <span className="terminal-label">decdn@node-001 ~ fetch</span>
        </div>

        {/* key forces a remount every cycle so the CSS line cascade
            and progress bar restart cleanly when the session flips. */}
        <div className="terminal-body" key={index}>
          <div className="tl tl-0">
            <span className="prompt">$</span>
            <span> decdn fetch </span>
            <span className="hash">blake3:{s.hash}</span>
          </div>

          <div className="tl tl-1">
            <span className="arrow">→</span>
            <span> probing {s.peerCount} peers</span>
            <span className="dim"> · {s.probeMs} ms</span>
          </div>

          <div className="tl tl-2">
            <span className="arrow">→</span>
            <span> selected: {s.peers}</span>
          </div>

          <div className="tl tl-3">
            <span className="arrow">→</span>
            <span> streaming {s.size} </span>
            <span className="progress" aria-hidden>
              <span className="progress-fill" />
            </span>
          </div>

          <div className="tl tl-4">
            <span className="ok">✓</span>
            <span> verified {s.chunks} chunks </span>
            <span className="dim">blake3</span>
          </div>

          <div className="tl tl-5">
            <span className="ok">✓</span>
            <span> settled </span>
            <span className="amount">{s.price}</span>
            <span> in </span>
            <span className="amount">{s.duration}</span>
          </div>

          <div className="tl tl-6">
            <span className="prompt">$</span>
            <span className="cursor" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}

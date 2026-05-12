"use client";

import { useEffect, useState } from "react";

const MIN = 0.02;
const MAX = 0.1;
const SPAN = MAX - MIN;
/** Minimum gap between consecutive quotes so every re-quote is visibly different. */
const MIN_STEP = 0.012;

const HOLD_MIN_MS = 900;
const HOLD_JITTER_MS = 500;

/** A fresh 3-decimal quote in [MIN, MAX], at least MIN_STEP away from `prev`. */
function nextQuote(prev: number): number {
  let next = prev;
  // Terminates fast: only a thin band around `prev` is ever rejected.
  while (Math.abs(next - prev) < MIN_STEP) {
    next = Math.round((MIN + Math.random() * SPAN) * 1000) / 1000;
  }
  return next;
}

/**
 * Legacy CDN price as a never-settling quote: holds a value for ~1s, then snaps
 * to a new one in $0.02–$0.10 — the volatile foil to deCDN's flat $0.01 in the
 * comparison table. Mirrors HeroTerminal's pattern: a deterministic first paint
 * (also the no-JS / static-export value) so hydration matches, with the timer
 * started in an effect and reduced motion respected.
 */
export function LegacyPriceTicker() {
  // 0.085 is in range and a wink at the copy this replaced ("$0.085–$0.17").
  const [value, setValue] = useState(0.085);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let holdId: number;
    const tick = () => {
      setValue(nextQuote);
      holdId = window.setTimeout(
        tick,
        HOLD_MIN_MS + Math.random() * HOLD_JITTER_MS,
      );
    };
    holdId = window.setTimeout(
      tick,
      HOLD_MIN_MS + Math.random() * HOLD_JITTER_MS,
    );
    return () => window.clearTimeout(holdId);
  }, []);

  return (
    <>
      <span aria-hidden className="opacity-55">
        {`$${value.toFixed(3)}`}
        <span className="meta ml-1 align-baseline opacity-70">/GB</span>
      </span>
      <span className="sr-only">approximately $0.02 to $0.10 per gigabyte</span>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { FaqItem } from "@/components/ui/FaqItem";
import { FAQ_ITEMS } from "@/lib/faq";

export type FaqState = {
  /** The answer on the desktop card: always one, the last one opened. */
  selected: number;
  /** The answers open at phone width, where each one sits under its question. */
  open: ReadonlySet<number>;
};

// Index 0 in both layouts, on server and client, so the static HTML matches
// hydration whichever layout the reader ends up in.
export const INITIAL_FAQ_STATE: FaqState = { selected: 0, open: new Set([0]) };

// At phone width a tap toggles only its own answer and never closes another.
// Closing an answer above the tapped question would pull the question up the
// screen, and scrolling to make up for it would move the page instead; either
// way the reader loses their place. Opening or closing an answer under its
// own question changes nothing above it, so nothing on screen moves.
//
// The desktop card has to show something, so there a tap selects, and the
// phone set follows the card so narrowing the window shows the same answer.
export function nextFaqState(
  state: FaqState,
  index: number,
  stacked: boolean,
): FaqState {
  if (!stacked) return { selected: index, open: new Set([index]) };
  const open = new Set(state.open);
  if (open.delete(index)) return { ...state, open };
  open.add(index);
  return { selected: index, open };
}

// Whether the grid is in its one-column phone layout. The breakpoint is a
// container query in globals.css, so read the layout the CSS chose rather
// than restating the width here.
function isStacked(grid: HTMLElement) {
  return getComputedStyle(grid).gridTemplateColumns.split(" ").length === 1;
}

export function FaqList({ section }: { section: string }) {
  const [state, setState] = useState(INITIAL_FAQ_STATE);
  // Drives the ARIA and styling. False until measured: the desktop reading of
  // INITIAL_FAQ_STATE is the one the static HTML was rendered with.
  const [stacked, setStacked] = useState(false);
  const gridRef = useRef<HTMLDListElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const ro = new ResizeObserver(() => setStacked(isStacked(grid)));
    ro.observe(grid);
    return () => ro.disconnect();
  }, []);

  // A tap reads the layout itself rather than trusting `stacked`, so what it
  // does never depends on the observer having reported yet.
  const select = (index: number) => {
    const grid = gridRef.current;
    if (!grid) return;
    const nowStacked = isStacked(grid);
    setStacked(nowStacked);
    // The desktop card's own question has nothing to change.
    if (!nowStacked && state.selected === index) return;
    setState((s) => nextFaqState(s, index, nowStacked));
  };

  return (
    <dl
      ref={gridRef}
      className="faq-grid"
      style={{ "--faq-n": FAQ_ITEMS.length }}
    >
      {FAQ_ITEMS.map((item, i) => (
        <FaqItem
          key={item.q}
          index={i}
          ordinal={`${section}.${i + 1}`}
          q={item.q}
          a={item.a}
          selected={stacked ? state.open.has(i) : state.selected === i}
          locked={!stacked && state.selected === i}
          onSelect={select}
          delay={i * 80}
        />
      ))}
    </dl>
  );
}

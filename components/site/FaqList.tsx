"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { FaqItem } from "@/components/ui/FaqItem";
import { FAQ_ITEMS } from "@/lib/faq";
import { scrollInstantly } from "@/lib/scroll";

// The spacers left after a tap: the tapped answer is never one, and the
// answer it closed becomes one when it has to keep its space.
export function nextSpacers(
  spacers: ReadonlySet<number>,
  tapped: number,
  closing: number,
  keepClosing: boolean,
): ReadonlySet<number> {
  const next = new Set(spacers);
  next.delete(tapped);
  if (keepClosing) next.add(closing);
  return next;
}

// Whether the grid is in its one-column phone layout. The breakpoint is a
// container query in globals.css, so read the layout the CSS chose rather
// than restating the width here.
function isStacked(grid: HTMLElement) {
  return getComputedStyle(grid).gridTemplateColumns.split(" ").length === 1;
}

// Runs a layout change, then scrolls by however far `read` moved, so the
// thing it measures stays put on screen.
function keepInPlace(read: () => number, change: () => void) {
  const before = read();
  flushSync(change);
  const shift = read() - before;
  if (shift !== 0) scrollInstantly(window.scrollY + shift);
}

// How long scrolling has to pause before off-screen spacers collapse, so the
// correcting scroll never lands mid-fling (on iOS it would stop the fling).
const SETTLE_MS = 150;

// Exactly one answer is open at all times: the card on the right has to show
// something, and the same rule keeps the phone-width accordion predictable.
// Index 0 on both server and client, so the static HTML matches hydration.
export function FaqList({ section }: { section: string }) {
  const [selected, setSelected] = useState(0);
  // At phone width, closed answers still holding their space (see select).
  const [spacers, setSpacers] = useState<ReadonlySet<number>>(new Set());
  const gridRef = useRef<HTMLDListElement>(null);

  // At phone width each answer opens under its own question, so closing the
  // open answer above the tapped question would pull the question up the
  // screen, and scrolling to hold the question still would slide everything
  // above it down instead. So when that answer is on screen it doesn't
  // collapse: it turns into an invisible spacer of the same height and
  // nothing moves. When it is already scrolled off the top it collapses at
  // once and keepInPlace holds the question, out of sight of the reader. An
  // answer below the tapped question collapses without moving anything above
  // it. On the desktop grid the questions never move, so nothing scrolls.
  // `.faq-grid` sets `overflow-anchor: none` so the browser doesn't also
  // anchor on a row in the list and shift the page a second time.
  const select = (i: number) => {
    const grid = gridRef.current;
    const question = grid?.querySelector(`[aria-controls="faq-a-${i}"]`);
    if (!grid || !question) return;
    const closing = selected;
    let keepClosing = false;
    if (isStacked(grid)) {
      const card = document.getElementById(`faq-a-${closing}`);
      const bottom = card?.getBoundingClientRect().bottom ?? 0;
      keepClosing =
        bottom > 0 && bottom <= question.getBoundingClientRect().top;
    }
    keepInPlace(
      () => question.getBoundingClientRect().top,
      () => {
        setSelected(i);
        setSpacers((s) => nextSpacers(s, i, closing, keepClosing));
      },
    );
  };

  // Once scrolling settles, spacers that are fully off screen collapse. Below
  // the screen nothing visible moves; above it, keepInPlace holds the rest of
  // the list where it was.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || spacers.size === 0) return;
    let timer = 0;
    const collapse = () => {
      const above: number[] = [];
      const below: number[] = [];
      for (const i of spacers) {
        const r = document
          .getElementById(`faq-a-${i}`)
          ?.getBoundingClientRect();
        if (!r || r.top >= window.innerHeight) below.push(i);
        else if (r.bottom <= 0) above.push(i);
      }
      const without = (gone: number[]) => (s: ReadonlySet<number>) =>
        new Set([...s].filter((i) => !gone.includes(i)));
      if (below.length > 0) flushSync(() => setSpacers(without(below)));
      if (above.length > 0)
        keepInPlace(
          () => grid.getBoundingClientRect().bottom,
          () => setSpacers(without(above)),
        );
    };
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(collapse, SETTLE_MS);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [spacers]);

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
          selected={i === selected}
          spacer={spacers.has(i)}
          onSelect={select}
          delay={i * 80}
        />
      ))}
    </dl>
  );
}

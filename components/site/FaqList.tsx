"use client";

import { useState } from "react";
import { FaqItem } from "@/components/ui/FaqItem";
import { FAQ_ITEMS } from "@/lib/faq";

// Exactly one answer is open at all times: the card on the right has to show
// something, and the same rule keeps the phone-width accordion predictable.
// Index 0 on both server and client, so the static HTML matches hydration.
//
// Toggling never scrolls the page. At phone width the closing answer shrinks
// while the opening one grows (globals.css, .faq-card), so when the closing
// answer sits above the tapped question the question slides up smoothly
// rather than jumping; `.faq-grid` sets `overflow-anchor: none` so the
// browser doesn't scroll to compensate either.
export function FaqList({ section }: { section: string }) {
  const [selected, setSelected] = useState(0);

  return (
    <dl className="faq-grid" style={{ "--faq-n": FAQ_ITEMS.length }}>
      {FAQ_ITEMS.map((item, i) => (
        <FaqItem
          key={item.q}
          index={i}
          ordinal={`${section}.${i + 1}`}
          q={item.q}
          a={item.a}
          selected={i === selected}
          onSelect={setSelected}
          delay={i * 80}
        />
      ))}
    </dl>
  );
}

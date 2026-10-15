"use client";

import { useState } from "react";
import { flushSync } from "react-dom";
import { FaqItem } from "@/components/ui/FaqItem";
import { FAQ_ITEMS } from "@/lib/faq";
import { scrollInstantly } from "@/lib/scroll";

// Exactly one answer is open at all times: the card on the right has to show
// something, and the same rule keeps the phone-width accordion predictable.
// Index 0 on both server and client, so the static HTML matches hydration.
export function FaqList({ section }: { section: string }) {
  const [selected, setSelected] = useState(0);

  // At phone width each answer opens under its own question, so opening one
  // below the open answer collapses that answer above it and the tapped
  // question jumps up the screen. Committing the change synchronously and
  // scrolling by the tapped question's shift keeps it where the reader's
  // thumb was. On the desktop grid the questions never move, so the shift is
  // zero and nothing scrolls. scrollInstantly, not `behavior: "instant"`:
  // older iOS Safari ignores that enum and would animate the correction
  // after the jump. `.faq-grid` opts out of scroll anchoring so the browser
  // can't correct a second time on top of this one.
  const select = (i: number) => {
    const question = document.querySelector(`[aria-controls="faq-a-${i}"]`);
    const before = question?.getBoundingClientRect().top;
    flushSync(() => setSelected(i));
    if (!question || before === undefined) return;
    const shift = question.getBoundingClientRect().top - before;
    if (shift !== 0) scrollInstantly(window.scrollY + shift);
  };

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
          onSelect={select}
          delay={i * 80}
        />
      ))}
    </dl>
  );
}

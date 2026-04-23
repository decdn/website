"use client";

import { useEffect, useState } from "react";
import { links } from "@/lib/links";

const SECTION_IDS = ["intro", "compare", "method", "faq", "contact"] as const;
const NAV = [
  { id: "compare", label: "compare" },
  { id: "method", label: "method" },
  { id: "faq", label: "faq" },
  { id: "contact", label: "contact" },
] as const;

// Ids of sections that paint on a dark background — used to flip the
// navbar text color per-section instead of relying on
// `mix-blend-mode: difference`, which silently fails on Safari / iOS
// when applied to `position: fixed` elements (the nav would vanish).
const DARK_SECTIONS: ReadonlySet<(typeof SECTION_IDS)[number]> = new Set([
  "compare",
  "faq",
]);

export function Chrome() {
  const [active, setActive] = useState<(typeof SECTION_IDS)[number]>("intro");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const nodes = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (n): n is HTMLElement => n !== null,
    );
    if (nodes.length === 0) return;

    // Track intersection ratio for every observed section across callbacks —
    // IO only delivers entries whose intersection changed, so using `entries`
    // alone can flicker when the most-visible section didn't change this tick.
    const visibility = new Map<(typeof SECTION_IDS)[number], number>(
      SECTION_IDS.map((id) => [id, 0]),
    );

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const { id } = entry.target;
          if ((SECTION_IDS as readonly string[]).includes(id)) {
            visibility.set(
              id as (typeof SECTION_IDS)[number],
              entry.isIntersecting ? entry.intersectionRatio : 0,
            );
          }
        }

        let next: (typeof SECTION_IDS)[number] | null = null;
        let maxRatio = 0;
        visibility.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            next = id;
          }
        });
        if (next !== null) setActive(next);
      },
      { threshold: [0.3, 0.6] },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onDark = DARK_SECTIONS.has(active);

  return (
    <nav
      aria-label="Primary"
      data-scrolled={scrolled ? "true" : undefined}
      data-tone={onDark ? "ink" : "paper"}
      className={`chrome-nav fixed inset-x-0 top-0 z-50 py-5 ${
        onDark ? "text-[var(--paper)]" : "text-[var(--ink)]"
      }`}
      style={{ paddingInline: "var(--frame-gutter)" }}
    >
      <div
        className="mx-auto flex w-full items-center justify-between gap-4"
        style={{ maxWidth: "var(--frame-max)" }}
      >
        <a href="#intro" className="flex items-baseline gap-3 no-underline">
          <span className="text-[15px] font-semibold tracking-[-0.02em] lowercase">
            deCDN
          </span>
          <span className="meta hidden opacity-70 sm:inline">
            labs · mmxxvi
          </span>
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className="nav-item"
                >
                  <span className="nav-label">{item.label}</span>
                  <span aria-hidden className="nav-underline" />
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-5">
          <a
            href={links.docs}
            target="_blank"
            rel="noopener noreferrer"
            className="meta flex items-center gap-2 no-underline"
            style={{ borderBottom: "1px solid currentColor", paddingBottom: 2 }}
          >
            <span>Docs</span>
            <span aria-hidden>→</span>
          </a>
          <a
            href={links.litepaper}
            target="_blank"
            rel="noopener noreferrer"
            className="meta flex items-center gap-2 no-underline"
            style={{ borderBottom: "1px solid currentColor", paddingBottom: 2 }}
          >
            <span>Litepaper</span>
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </nav>
  );
}

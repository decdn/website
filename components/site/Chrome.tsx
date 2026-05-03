"use client";

import { useEffect, useRef, useState } from "react";
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
  const navRef = useRef<HTMLElement>(null);

  // Active section = the one whose vertical span includes the navbar's bottom
  // edge. This makes the tone flip happen exactly when a section's top crosses
  // under the navbar — synchronous with the visual background change behind it.
  useEffect(() => {
    const nodes = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (n): n is HTMLElement => n !== null,
    );
    if (nodes.length === 0) return;

    let raf = 0;
    const compute = () => {
      raf = 0;
      const line = (navRef.current?.offsetHeight ?? 0) + 1;
      let next: (typeof SECTION_IDS)[number] | null = null;
      for (const node of nodes) {
        const rect = node.getBoundingClientRect();
        if (rect.top <= line && rect.bottom > line) {
          next = node.id as (typeof SECTION_IDS)[number];
          break;
        }
      }
      if (next !== null) setActive(next);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
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
      ref={navRef}
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
        <a href="#intro" className="flex items-center gap-3 no-underline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/white-nav-logo.png"
            alt="decdn_"
            style={{
              height: "20px",
              width: "auto",
              display: onDark ? "none" : "block",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/black-nav-logo.png"
            alt=""
            aria-hidden="true"
            style={{
              height: "20px",
              width: "auto",
              display: onDark ? "block" : "none",
            }}
          />
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

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollReveal() {
  // Re-run on path change: this component lives in the root layout (which
  // never remounts and has no template.tsx), so a `next/link` client-side
  // nav swaps the page DOM without re-firing a `[]`-deps effect — the new
  // route's `[data-reveal]` nodes would never get observed and would sit
  // at opacity:0 on browsers that fall back to this observer (Firefox,
  // Safari < 26; the modern path is the CSS `animation-timeline: view()`
  // in globals.css). Effects run after the new DOM is committed, so the
  // re-run query picks the new nodes up. Hash-only links (`/#compare`)
  // leave `pathname` unchanged, so they don't trigger a needless rebuild.
  const pathname = usePathname();

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "true");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}

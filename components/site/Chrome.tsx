"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { links } from "@/lib/links";
import { MobileMenu } from "@/components/site/MobileMenu";
import {
  DARK_SECTIONS,
  NAV_SECTIONS as NAV,
  SECTION_IDS,
  type SectionId,
} from "@/lib/sections";

// Sections that paint on a dark background drive the navbar's
// per-section tone flip — `DARK_SECTIONS` from lib/sections. We
// avoid `mix-blend-mode: difference` because it silently fails on
// Safari / iOS when applied to `position: fixed` elements (the nav
// would vanish).

export function Chrome() {
  const [active, setActive] = useState<SectionId>("intro");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const handleMobileOpenChange = useCallback(
    (open: boolean) => setMobileOpen(open),
    [],
  );

  // Active section = whichever one paints the strip directly under the
  // navbar. We collapse the IO root into a 1px horizontal slice at y =
  // navbar.offsetHeight via rootMargin — the section currently
  // intersecting that slice is the one whose background sits behind the
  // nav, so the tone flip happens exactly when its top crosses under.
  //
  // The slice depends on window.innerHeight AND navbar.offsetHeight, so
  // the IO is rebuilt on (a) window resize and (b) nav-size changes
  // (e.g. webfont swap). Rebuilds are rAF-coalesced so a resize burst
  // collapses to one rebuild per frame. When two adjacent sections
  // share the slice (subpixel rounding at boundaries), we pick the
  // entry with the largest boundingClientRect.top — the section whose
  // top has just crossed under the nav.
  useEffect(() => {
    const nodes = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (n): n is HTMLElement => n !== null,
    );
    if (nodes.length === 0) return;

    let io: IntersectionObserver | null = null;
    const build = () => {
      io?.disconnect();
      const rawNavH = navRef.current?.offsetHeight ?? 0;
      // Clamp prevents an inverted rootMargin in pathological viewports
      // (rawNavH ≥ innerHeight); IO would otherwise stop firing.
      const navH = Math.min(rawNavH, Math.max(0, window.innerHeight - 1));
      const bottomInset = Math.max(0, window.innerHeight - navH - 1);
      const margin = `-${navH}px 0px -${bottomInset}px 0px`;
      io = new IntersectionObserver(
        (entries) => {
          let bestId: SectionId | null = null;
          let bestTop = -Infinity;
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const { id } = entry.target;
            if (!(SECTION_IDS as readonly string[]).includes(id)) continue;
            const top = entry.boundingClientRect.top;
            if (top > bestTop) {
              bestTop = top;
              bestId = id as SectionId;
            }
          }
          if (bestId !== null) setActive(bestId);
        },
        { rootMargin: margin, threshold: 0 },
      );
      nodes.forEach((n) => io!.observe(n));
    };

    let resizeRaf = 0;
    const onResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        build();
      });
    };

    build();
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(onResize)
        : null;
    if (ro && navRef.current) ro.observe(navRef.current);
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      ro?.disconnect();
      io?.disconnect();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onDark = DARK_SECTIONS.has(active);
  // While the mobile drawer is open the top-right corner of the nav
  // sits visually on top of the paper drawer, so force a paper tone
  // (ink text) so the toggle / wordmark stay legible regardless of
  // which section is hiding behind the overlay.
  const navTone = mobileOpen ? "paper" : onDark ? "ink" : "paper";
  const navTextClass =
    !mobileOpen && onDark ? "text-[var(--paper)]" : "text-[var(--ink)]";

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      data-scrolled={scrolled ? "true" : undefined}
      data-tone={navTone}
      className={`chrome-nav fixed inset-x-0 top-0 z-50 py-5 ${navTextClass}`}
      style={{ paddingInline: "var(--frame-gutter)" }}
    >
      <div
        className="mx-auto grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4"
        style={{ maxWidth: "var(--frame-max)" }}
      >
        <a
          href="#intro"
          className="col-start-1 flex items-center gap-3 no-underline"
        >
          {/* Both variants stay mounted and toggled via `display` so the
              tone flip never flashes — browsers fetch hidden <img> tags
              eagerly enough that the swap-in variant is already in cache. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/wordmark-light.svg"
            alt="decdn"
            width={112}
            height={30}
            className={onDark ? "hidden" : "block"}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/wordmark-dark.svg"
            alt="decdn"
            width={112}
            height={30}
            className={onDark ? "block" : "hidden"}
          />
          <span className="meta hidden opacity-70 sm:inline">labs</span>
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

        <div className="col-start-3 flex items-center gap-5 justify-self-end">
          <a
            href={links.docs}
            className="meta hidden items-center gap-2 no-underline md:flex"
            style={{ borderBottom: "1px solid currentColor", paddingBottom: 2 }}
          >
            <span>Docs</span>
            <span aria-hidden>→</span>
          </a>
          <a
            href={links.litepaper}
            target="_blank"
            rel="noopener noreferrer"
            className="meta hidden items-center gap-2 no-underline md:flex"
            style={{ borderBottom: "1px solid currentColor", paddingBottom: 2 }}
          >
            <span>Litepaper</span>
            <span aria-hidden>→</span>
          </a>
          <MobileMenu
            activeSection={active}
            tone={navTone}
            onOpenChange={handleMobileOpenChange}
          />
        </div>
      </div>
    </nav>
  );
}

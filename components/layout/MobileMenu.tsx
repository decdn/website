"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { links } from "@/lib/links";
import {
  HOME_SECTION_ID,
  focusSection,
  queueSectionFocus,
  scrollInstantly,
  scrollToAnchor,
} from "@/lib/scroll";

type SectionId = "intro" | "compare" | "method" | "try" | "faq" | "contact";

type Props = {
  activeSection: SectionId;
  tone: "ink" | "paper";
  onOpenChange: (open: boolean) => void;
};

const SECTIONS: readonly { id: SectionId; label: string }[] = [
  { id: "compare", label: "compare" },
  { id: "method", label: "method" },
  { id: "faq", label: "faq" },
  { id: "try", label: "try it" },
  { id: "contact", label: "contact" },
] as const;

type DrawerLink = {
  href: string;
  label: string;
  kind: "internal" | "external";
};

const EXTERNAL: readonly DrawerLink[] = [
  { kind: "internal", href: links.docs, label: "docs" },
  { kind: "internal", href: links.blog, label: "blog" },
  { kind: "external", href: links.litepaper, label: "litepaper" },
  { kind: "external", href: links.stats, label: "network stats" },
] as const;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileMenu({ activeSection, tone, onOpenChange }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // iOS Safari leaks scroll through `overflow: hidden` on the body. Pin
  // the body via `position: fixed; top: -y` instead — the layout
  // viewport moves with us so there's nothing to scroll.
  const prevBodyStyleRef = useRef<{
    position: string;
    top: string;
    left: string;
    right: string;
    width: string;
    overflow: string;
  } | null>(null);
  const scrollYRef = useRef(0);
  // When the drawer closes via an in-page anchor tap, the cleanup must
  // scroll (or, off-route, soft-nav) to that target instead of restoring
  // the prior scroll position — otherwise the body unlock would override
  // the anchor jump.
  const pendingAnchorRef = useRef<string | null>(null);
  // A section-select close moves focus into the target section — at once
  // from the scroll-lock effect's cleanup when the target is in this DOM,
  // or after the route commits (Chrome's arrival effect) when it isn't.
  // That cleanup runs *before* the toggle-refocus effect's setup in the
  // same commit. This flag — set in that cleanup, consumed by the
  // toggle-refocus effect — stops it from yanking focus back to the
  // hamburger.
  const focusMovedToSectionRef = useRef(false);

  useEffect(() => {
    onOpenChange(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    scrollYRef.current = scrollY;
    const style = document.body.style;
    prevBodyStyleRef.current = {
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
      overflow: style.overflow,
    };
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    style.overflow = "hidden";

    // Menu content doesn't change while open, so no need to re-query on
    // every Tab keystroke. The toggle lives outside the panel but just
    // before it in DOM order, so it is prepended: the trap then wraps
    // last row → × and × → last row, and the browser handles × ↔ first
    // row itself. Without it, Tab past the last row would land on page
    // content hidden behind the panel.
    const panel = panelRef.current!;
    const panelFocusables = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    const focusables = toggleRef.current
      ? [toggleRef.current, ...panelFocusables]
      : panelFocusables;

    // rAF before the initial focus so the panel's open transition is in
    // flight first — otherwise iOS Safari scrolls the focused element
    // into view through the transform.
    const raf = requestAnimationFrame(() => {
      panelFocusables[0]?.focus({ preventScroll: true });
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const activeEl = document.activeElement as HTMLElement | null;

      if (e.shiftKey && activeEl === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      // Removing `position: fixed` leaves the viewport at y=0 — the
      // negative `top` was the only thing holding it.
      const prev = prevBodyStyleRef.current!;
      const style = document.body.style;
      style.position = prev.position;
      style.top = prev.top;
      style.left = prev.left;
      style.right = prev.right;
      style.width = prev.width;
      style.overflow = prev.overflow;
      prevBodyStyleRef.current = null;

      const anchor = pendingAnchorRef.current;
      pendingAnchorRef.current = null;
      // intro is the top of the page, not a section deep-link: go to the
      // very top and clear the hash rather than writing #intro.
      const isHome = anchor === HOME_SECTION_ID;
      const targetEl = anchor ? document.getElementById(anchor) : null;

      if (anchor && !targetEl) {
        // Drawer opened from a different route (e.g. /blog/*), so the
        // section isn't in this DOM: soft-nav home and let the router
        // scroll to the hash. Home -> "/", section -> "/#anchor". Must
        // run after the body unlock above — the router's hash scroll is a
        // no-op against a still-pinned body. Historically a full reload,
        // because soft-nav hash handling under output: "export" was
        // untrusted; its one concrete failure, `/#id#id` (#116), was fixed
        // upstream in Next 16.3.8. Skip the local restore — the router
        // owns scroll and the URL. A section can't be focused until the
        // route commits, so queue it for Chrome's arrival effect and set
        // the flag so the toggle-refocus effect doesn't grab focus
        // meanwhile; a home tap leaves the flag false, so focus returns
        // to the toggle.
        if (!isHome) {
          queueSectionFocus(anchor);
          focusMovedToSectionRef.current = true;
        }
        router.push(isHome ? "/" : `/#${anchor}`);
        return;
      }

      // Restore the prior scroll position without animating — a smooth
      // scroll here would visibly glide from y=0. Home lands at the top;
      // a section restores the prior position so scrollToAnchor can
      // animate from there.
      scrollInstantly(isHome ? 0 : scrollYRef.current);

      if (isHome) {
        // Clear any #section fragment — the top is canonical home, no
        // #intro. Leave focusMovedToSectionRef false so the close effect
        // returns focus to the toggle (top-right), correct for "to the top".
        history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      } else if (anchor && targetEl) {
        // replaceState updates the URL without scrolling;
        // scrollToAnchor does the visible scroll.
        history.replaceState(null, "", `#${anchor}`);
        scrollToAnchor(targetEl);
        // Move keyboard / SR focus into the section — scrollToAnchor
        // only moves the viewport. focusSection won't race the
        // in-flight rAF scroll.
        focusSection(targetEl);
        focusMovedToSectionRef.current = true;
      }
    };
  }, [open, router]);

  // Skipped on the initial render (when `open` is already false) via
  // the wasOpenRef guard.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !open) {
      // A section-select close already moved focus into the section, or
      // will once the route lands on its hash; leave it alone. Normal closes
      // (Escape, scrim, toggle, resize) and a home-select close leave the
      // flag false and still return focus to the toggle.
      if (focusMovedToSectionRef.current) {
        focusMovedToSectionRef.current = false;
      } else {
        toggleRef.current?.focus({ preventScroll: true });
      }
    }
    wasOpenRef.current = open;
  }, [open]);

  // Close on resize to desktop (≥1280px, matches the CSS gate).
  // Without this the CSS hides the panel but `open` stays true,
  // leaving body scroll locked and the nav stuck in forced-paper tone.
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1280px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // For an in-page anchor, preventDefault so the browser doesn't start
  // its own scroll while the body is still pinned; stash the target id
  // for the cleanup to consume after the body unlock.
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href");
    if (href?.startsWith("#")) {
      e.preventDefault();
      pendingAnchorRef.current = href.slice(1);
    }
    setOpen(false);
  }, []);

  // Chrome renders toggle/overlay/panel beside its <nav>, directly
  // under <body>, so all four share the root stacking context and
  // interleave: overlay z-55 < nav z-58 (open; z-50 resting — see
  // globals.css's data-mobile-open block) < panel z-60 < toggle z-65.
  // The panel covers the wordmark while the × stays on top. No portal:
  // all three prerender, so the toggle is in the first paint rather
  // than popping in at hydration (#322).
  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="mm-toggle"
        data-open={open ? "true" : undefined}
        data-tone={tone}
        aria-expanded={open}
        aria-controls="mm-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      />

      <div
        className="mm-overlay"
        data-open={open ? "true" : undefined}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        id="mm-panel"
        ref={panelRef}
        className="mm-panel"
        data-open={open ? "true" : undefined}
        aria-label="Mobile menu"
        aria-hidden={!open}
        inert={!open}
      >
        <header className="mm-head">
          <a
            href="#intro"
            className="mm-head-link meta"
            onClick={handleClick}
            aria-current={activeSection === "intro" ? "true" : undefined}
          >
            home
          </a>
        </header>

        <ul className="mm-list">
          {SECTIONS.map((s) => {
            const isActive = activeSection === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="mm-row"
                  data-active={isActive ? "true" : undefined}
                  aria-current={isActive ? "true" : undefined}
                  onClick={handleClick}
                >
                  <span className="mm-label">{s.label}</span>
                  <span aria-hidden className="mm-mark" />
                </a>
              </li>
            );
          })}
        </ul>

        <ul className="mm-list mm-list-external">
          {EXTERNAL.map((e) => (
            <li key={e.label}>
              <a
                href={e.href}
                {...(e.kind === "external"
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="mm-row mm-row-external"
                onClick={handleClick}
              >
                <span className="mm-label">{e.label}</span>
                <span aria-hidden className="mm-arrow">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>

        <footer className="mm-foot">
          <span className="meta">
            decdn
            <span aria-hidden="true" className="text-whisper">
              _
            </span>
            labs
          </span>
        </footer>
      </aside>
    </>
  );
}

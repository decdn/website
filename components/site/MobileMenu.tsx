"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { links } from "@/lib/links";
import { HOME_SECTION_ID, scrollToAnchor } from "@/lib/scroll";

type SectionId = "intro" | "compare" | "method" | "faq" | "contact";

type Props = {
  activeSection: SectionId;
  tone: "ink" | "paper";
  onOpenChange: (open: boolean) => void;
};

const SECTIONS: readonly { id: SectionId; label: string }[] = [
  { id: "compare", label: "compare" },
  { id: "method", label: "method" },
  { id: "faq", label: "faq" },
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
] as const;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Hydration gate for the createPortal target. Reads false on the
// server and true after hydration, without a useState+useEffect
// round-trip that would trip the react-hooks/set-state-in-effect rule.
const noopSubscribe = () => () => {};
const getHydratedSnapshot = () => true;
const getServerSnapshot = () => false;

export function MobileMenu({ activeSection, tone, onOpenChange }: Props) {
  const [open, setOpen] = useState(false);
  // Static export: document.body isn't available during prerender. Gate
  // the portal until after hydration so the first client render matches
  // the prerendered HTML.
  const isHydrated = useSyncExternalStore(
    noopSubscribe,
    getHydratedSnapshot,
    getServerSnapshot,
  );

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
  // scroll to that target instead of restoring the prior scroll
  // position — otherwise the body unlock would override the anchor jump.
  const pendingAnchorRef = useRef<string | null>(null);
  // An anchor-select close moves focus into the target section from the
  // Effect-A cleanup, which runs *before* the toggle-refocus effect's
  // setup in the same commit. This flag — set there, consumed there —
  // stops that effect from yanking focus back to the hamburger.
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
    // every Tab keystroke. The portalled toggle is appended manually so
    // keyboard users can Tab from the last row to the close ×.
    const panel = panelRef.current!;
    const focusables: HTMLElement[] = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    if (toggleRef.current) focusables.push(toggleRef.current);

    // rAF before the initial focus so the panel's open transition is in
    // flight first — otherwise iOS Safari scrolls the focused element
    // into view through the transform.
    const raf = requestAnimationFrame(() => {
      focusables[0]?.focus({ preventScroll: true });
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
        // Drawer opened from a different route (e.g. /blog/*); a full
        // reload lets the new page resolve the destination deterministically
        // (Next 16 App Router's soft-nav hash behaviour under output:
        // "export" isn't documented). Home -> "/", section -> "/#anchor".
        // Skip the local restore — the page is about to unload.
        window.location.assign(isHome ? "/" : `/#${anchor}`);
        return;
      }

      // Restore the prior scroll position synchronously. We bypass
      // `<html>`'s motion-safe:scroll-smooth manually instead of
      // passing `behavior: "instant"` — Safari only honoured the
      // "instant" enum from 18.4; older versions silently fall back
      // to "auto", which re-introduces the smooth scroll from y=0
      // we're trying to suppress.
      const html = document.documentElement;
      const prevScrollBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      // Home lands at the top; a section restores the prior position so
      // scrollToAnchor can animate from there.
      window.scrollTo(0, isHome ? 0 : scrollYRef.current);
      html.style.scrollBehavior = prevScrollBehavior;

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
        // only moves the viewport. Add tabindex only when the target
        // isn't already focusable (don't pull a focusable el out of
        // tab order); leaving the injected tabindex="-1" in place is
        // the established programmatic-focus pattern. preventScroll so
        // .focus() doesn't race the in-flight rAF scroll.
        if (targetEl.tabIndex < 0) targetEl.setAttribute("tabindex", "-1");
        targetEl.focus({ preventScroll: true });
        focusMovedToSectionRef.current = true;
      }
    };
  }, [open]);

  // Skipped on the initial render (when `open` is already false) via
  // the wasOpenRef guard.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !open) {
      // An anchor-select close already moved focus into the section;
      // leave it there. Normal closes (Escape, scrim, toggle, resize)
      // leave the flag false and still return focus to the toggle.
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

  // Portal target: toggle/overlay/panel all live in <body> so the
  // toggle can sit above the panel (z-65 > z-60) while the wordmark
  // stays inside the nav (z-50 resting, z-58 when the drawer opens
  // — see Chrome.tsx + globals.css's data-mobile-open block). The
  // nav always sits below the panel, so the wordmark is naturally
  // covered when the drawer opens.
  const drawer = (
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
          {SECTIONS.map((s, i) => {
            const isActive = activeSection === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="mm-row"
                  data-active={isActive ? "true" : undefined}
                  aria-current={isActive ? "true" : undefined}
                  style={{ "--mm-i": i }}
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
          {EXTERNAL.map((e, i) => (
            <li key={e.label}>
              <a
                href={e.href}
                {...(e.kind === "external"
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="mm-row mm-row-external"
                style={{ "--mm-i": SECTIONS.length + i }}
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

  return isHydrated ? createPortal(drawer, document.body) : null;
}

"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { links } from "@/lib/links";

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

// Constant-velocity scroll to an anchor at 600ms — slower than the
// browser's default smooth-scroll, but linear so the page doesn't
// burst forward and then slow to a crawl the way ease-out curves do
// (especially noticeable behind the drawer's slide-close).
// Reduced-motion path jumps instantly via scrollIntoView (still
// honours the element's scroll-margin-top).
function scrollToAnchor(el: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.scrollIntoView({ block: "start" });
    return;
  }
  const startY = window.scrollY;
  const marginTop =
    parseFloat(getComputedStyle(el).scrollMarginTop || "0") || 0;
  const targetY = startY + el.getBoundingClientRect().top - marginTop;
  const distance = targetY - startY;
  if (distance === 0) return;
  const duration = 600;
  const startTime = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - startTime) / duration);
    window.scrollTo(0, startY + distance * t);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Hydration gate for the createPortal target. Reads false on the
// server and true after hydration, without a useState+useEffect
// round-trip that would trip the react-hooks/set-state-in-effect rule.
const noopSubscribe = () => () => {};
const getHydratedSnapshot = () => true;
const getServerSnapshot = () => false;

export function MobileMenu({ activeSection, tone, onOpenChange }: Props) {
  const router = useRouter();
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
      const targetEl = anchor ? document.getElementById(anchor) : null;

      if (anchor && !targetEl) {
        // Drawer opened from a different route (e.g. /blog/*); the
        // new page handles the hash scroll. Use router.push so the
        // transition stays client-side instead of a full reload.
        // Skip the local restore — any scroll on this page would be
        // a visible artefact on the way out.
        router.push(`/#${anchor}`);
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
      window.scrollTo(0, scrollYRef.current);
      html.style.scrollBehavior = prevScrollBehavior;

      if (anchor && targetEl) {
        // replaceState doesn't scroll; scrollToAnchor rides from the
        // just-restored position to the target at constant velocity.
        history.replaceState(null, "", `#${anchor}`);
        scrollToAnchor(targetEl);
      }
    };
  }, [open, router]);

  // Skipped on the initial render (when `open` is already false) via
  // the wasOpenRef guard.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !open) {
      toggleRef.current?.focus({ preventScroll: true });
    }
    wasOpenRef.current = open;
  }, [open]);

  // Close on resize to desktop. Without this the CSS hides the panel
  // but `open` stays true, leaving body scroll locked and the nav
  // stuck in forced-paper tone.
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
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
  // stays inside the nav at z-50 and is naturally covered when the
  // drawer opens. Raising the nav's z-index would lift the wordmark
  // above the drawer too, which it shouldn't be.
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

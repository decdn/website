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

type SectionId = "intro" | "compare" | "method" | "faq" | "contact";

type Props = {
  activeSection: SectionId;
  tone: "ink" | "paper";
  onOpenChange?: (open: boolean) => void;
};

const SECTIONS: readonly { id: SectionId; label: string }[] = [
  { id: "compare", label: "compare" },
  { id: "method", label: "method" },
  { id: "faq", label: "faq" },
  { id: "contact", label: "contact" },
] as const;

const EXTERNAL: readonly { href: string; label: string; external: boolean }[] =
  [
    { href: links.docs, label: "Docs", external: false },
    { href: links.blog, label: "Blog", external: false },
    { href: links.litepaper, label: "Litepaper", external: true },
  ] as const;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Hydration gate for the createPortal target — useSyncExternalStore is
// the React-18+ idiomatic way to read a different value on the server
// vs the client without tripping the `set-state-in-effect` lint rule.
const noopSubscribe = () => () => {};
const getHydratedSnapshot = () => true;
const getServerSnapshot = () => false;

export function MobileMenu({ activeSection, tone, onOpenChange }: Props) {
  const [open, setOpen] = useState(false);
  // Gate the portal until after hydration so the static export's
  // server-rendered HTML matches what React first renders on the
  // client (no portal target available at SSR time).
  const isHydrated = useSyncExternalStore(
    noopSubscribe,
    getHydratedSnapshot,
    getServerSnapshot,
  );

  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // iOS Safari leaks scroll through `overflow: hidden` on the body —
  // a swipe on a fixed overlay can still drag the documentElement.
  // The robust fix is to pin the body via `position: fixed; top: -y`,
  // which moves the layout viewport with us so there is nothing to
  // scroll. We save every inline body style we override so the page
  // is restored exactly to its prior state on close (or unmount).
  const prevBodyStyleRef = useRef<{
    position: string;
    top: string;
    left: string;
    right: string;
    width: string;
    overflow: string;
  } | null>(null);
  const scrollYRef = useRef(0);
  // When the drawer closes because the user tapped an in-page anchor
  // (`#section`), the cleanup must scroll to that target instead of
  // restoring the user's prior scroll position — otherwise the body
  // unlock would override the anchor navigation and the page would
  // appear to stay put.
  const pendingAnchorRef = useRef<string | null>(null);

  // Notify the parent whenever open state flips so it can adjust the
  // navbar's tone (the toggle sits inside the nav and must read
  // against the paper drawer when the menu is open).
  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  // Body scroll lock + ESC + focus trap, all gated on `open`.
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

    // Cache the focus order once for the lifetime of this open cycle:
    //  - panel descendants (home + section rows + external links), in
    //    DOM order;
    //  - then the portalled toggle, so keyboard users can Tab to the
    //    close × instead of being stuck inside the panel with only
    //    ESC as an exit.
    // The menu content doesn't change while the drawer is open, so
    // there's no reason to re-query on every Tab keystroke.
    const panel = panelRef.current;
    const focusables: HTMLElement[] = panel
      ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      : [];
    if (toggleRef.current) focusables.push(toggleRef.current);

    const focusFirst = () => {
      focusables[0]?.focus({ preventScroll: true });
    };
    // requestAnimationFrame so the panel's open transition is started
    // before we move focus; otherwise iOS Safari can occasionally
    // scroll the focused element into view through the transform.
    const raf = requestAnimationFrame(focusFirst);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      if (focusables.length === 0) return;
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
      // Restore body styles exactly. Removing `position: fixed` snaps
      // the page back to y=0 because the negative `top` was the only
      // thing holding the viewport in place — so we have to scroll
      // somewhere explicitly. If the drawer was closed by tapping an
      // in-page anchor link, scroll to that target; otherwise return
      // to the user's pre-open scroll position.
      const prev = prevBodyStyleRef.current;
      if (prev) {
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
        if (anchor) {
          const el = document.getElementById(anchor);
          if (el) {
            // Update the URL hash without re-triggering a native
            // anchor jump (history.replaceState doesn't scroll), then
            // smooth-scroll via scrollIntoView — html already carries
            // `motion-safe:scroll-smooth`, so this honours the user's
            // reduced-motion preference automatically.
            history.replaceState(null, "", `#${anchor}`);
            el.scrollIntoView({ block: "start" });
          } else {
            window.scrollTo(0, scrollYRef.current);
          }
        } else {
          window.scrollTo(0, scrollYRef.current);
        }
      }
    };
  }, [open]);

  // After closing, return focus to the toggle so keyboard users land
  // exactly where they were. Skipped on the initial render (when
  // `open` is already false) by gating on a ref of the previous state.
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (wasOpenRef.current && !open) {
      toggleRef.current?.focus({ preventScroll: true });
    }
    wasOpenRef.current = open;
  }, [open]);

  // Close the drawer when crossing into desktop. Without this the CSS
  // hides the panel but `open` stays true, leaving body scroll locked
  // and the nav stuck in forced-paper tone after a resize.
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // Single click handler for every link inside the drawer. For an
  // in-page anchor (`#section`), we preventDefault so the browser
  // doesn't start its own scroll while the body is still pinned, then
  // stash the target id for the cleanup to scroll to after the body
  // unlock. For external links (Docs / Litepaper) we let the browser
  // handle navigation normally and just close the drawer.
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href");
    if (href?.startsWith("#")) {
      e.preventDefault();
      pendingAnchorRef.current = href.slice(1);
    }
    setOpen(false);
  }, []);

  // Portal target: the .chrome-nav sets `backdrop-filter: blur(0)` as
  // its base, which creates a containing block for `position: fixed`
  // descendants. We also need the toggle to sit above the drawer (so
  // the morphed × can close it) while leaving the wordmark inside the
  // nav untouched — raising the nav's z-index would lift the wordmark
  // above the drawer too, which it shouldn't be. Portalling everything
  // (toggle + overlay + panel) to <body> solves both: fixed positioning
  // resolves against the viewport, and the toggle's z-index sits above
  // the panel while the nav (and wordmark) stay underneath.
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
                {...(e.external
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
          <span className="meta">decdn / labs</span>
        </footer>
      </aside>
    </>
  );

  return isHydrated ? createPortal(drawer, document.body) : null;
}

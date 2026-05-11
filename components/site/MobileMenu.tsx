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

export function MobileMenu({ activeSection, onOpenChange }: Props) {
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
  // Stash whatever inline overflow value was set before the drawer
  // opened so we restore the page exactly as it was, rather than
  // forcing it back to "" and stomping a value some other code owned.
  const prevBodyOverflowRef = useRef<string | null>(null);

  // Notify the parent whenever open state flips so it can adjust the
  // navbar's tone (the toggle sits inside the nav and must read
  // against the paper drawer when the menu is open).
  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  // Body scroll lock + ESC + focus trap, all gated on `open`.
  useEffect(() => {
    if (!open) return;

    prevBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFirst = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusables =
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      // Skip the close button (first focusable) — landing on the first
      // menu link is the more useful initial position.
      const first = focusables[1] ?? focusables[0];
      first?.focus({ preventScroll: true });
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

      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
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
      document.body.style.overflow = prevBodyOverflowRef.current ?? "";
      prevBodyOverflowRef.current = null;
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

  const close = useCallback(() => setOpen(false), []);

  // Portal target: the .chrome-nav sets `backdrop-filter: blur(0)`
  // as its base, which creates a containing block for `position: fixed`
  // descendants. Rendering the overlay + panel as children of <nav>
  // therefore clips them to the nav's box. Portal to <body> so their
  // fixed positioning is resolved against the viewport instead.
  const drawer = (
    <>
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
        tabIndex={-1}
      >
        <button
          type="button"
          className="mm-close"
          onClick={close}
          aria-label="Close menu"
        >
          <span aria-hidden>×</span>
        </button>

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
                  onClick={close}
                >
                  <span className="mm-label">{s.label}</span>
                  <span aria-hidden className="mm-dot" />
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
                onClick={close}
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

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="mm-toggle"
        data-open={open ? "true" : undefined}
        aria-expanded={open}
        aria-controls="mm-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      />
      {isHydrated ? createPortal(drawer, document.body) : null}
    </>
  );
}

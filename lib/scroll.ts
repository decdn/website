// Returns the section id for a home-page hash href, or null when the href
// is not an in-page anchor we should resolve locally.
//
//   "/#method"          -> "method"
//   "/#"  | "/"         -> null   (no target section)
//   "#method"           -> null   (bare hash — resolves against the
//                                  current URL, not home; not our concern)
//   "/blog/foo/#method" -> null   (cross-route navigation)
//
// Callers pass a clean `/#${id}`; this does not sanitize multi-hash or
// trailing-slash input (`/#a#b` -> "a#b", `/#intro/` -> "intro/").
// Pure and DOM-free so the desktop nav click decision is unit-testable.
export function homeHashSectionId(href: string): string | null {
  if (!href.startsWith("/#")) return null;
  const id = href.slice(2);
  return id.length > 0 ? id : null;
}

// Whether a nav click should be intercepted for local hash resolution,
// vs. falling through to the native <Link> (modified clicks: new tab,
// middle-click, etc. — generic browser-nav etiquette). `button` is the
// DOM MouseEvent.button enum; only 0 (primary) is intercepted. Pure so
// the desktop handler's guard is unit-testable; DOM glue stays untested.
export function shouldInterceptNavClick(e: {
  defaultPrevented: boolean;
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}): boolean {
  return !(
    e.defaultPrevented ||
    e.button !== 0 ||
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey
  );
}

// `<html>` scroll-behavior is forced to `auto` for the lifetime of
// the rAF: without it, each per-frame `window.scrollTo` defers to
// `motion-safe:scroll-smooth` and queues yet another browser
// smooth-scroll per tick, which fights the rAF and reads as a
// lumpy "slow then sudden" scroll. The loop is single-flight — a
// new call cancels any in-flight rAF and eagerly restores its
// captured scroll-behavior so we never snapshot the polluted
// "auto" value (which would otherwise survive past the helper and
// permanently override the page's CSS scroll-smooth).
//
// State is module-level so a re-entrant call — a second anchor jump
// before the first settles — cancels the in-flight rAF and restores
// scroll-behavior before snapshotting, rather than two loops fighting.
let scrollAnchorRaf = 0;
let scrollAnchorRestore: (() => void) | null = null;

// `getComputedStyle(el).scrollMarginTop` is normally a `px` string, but a
// detached/unrendered element yields "" → parseFloat is NaN. Unguarded,
// that NaN flows into `distance`; since
// `NaN === 0` is false the no-op early return is skipped and the rAF runs
// `scrollTo(x, NaN)`, which CSSOM-View coerces to y=0 — the page silently
// scrolls to the top. Clamping to 0 degrades to "ignore scroll-margin" (a
// visible, sane fallback) and restores the `distance === 0` guard's meaning.
// Pure so it's unit-testable; the DOM read stays at the call site.
export function parseScrollMarginTop(computed: string): number {
  const px = parseFloat(computed);
  return Number.isFinite(px) ? px : 0;
}

export function scrollToAnchor(el: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.scrollIntoView({ block: "start" });
    return;
  }
  if (scrollAnchorRaf !== 0) {
    cancelAnimationFrame(scrollAnchorRaf);
    scrollAnchorRestore?.();
    scrollAnchorRaf = 0;
    scrollAnchorRestore = null;
  }
  const startY = window.scrollY;
  const marginTop = parseScrollMarginTop(getComputedStyle(el).scrollMarginTop);
  const targetY = startY + el.getBoundingClientRect().top - marginTop;
  const distance = targetY - startY;
  if (distance === 0) return;
  const html = document.documentElement;
  const prevScrollBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  scrollAnchorRestore = () => {
    html.style.scrollBehavior = prevScrollBehavior;
  };
  const duration = 600;
  const startTime = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - startTime) / duration);
    // Quadratic ease-in-out so the programmatic scroll doesn't read
    // mechanically (linear feels robotic). scrollX is re-read each
    // frame rather than hard-coded to 0, so this Y-only loop preserves
    // the current horizontal position instead of snapping to the left
    // edge.
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    window.scrollTo(window.scrollX, startY + distance * ease);
    if (t < 1) {
      scrollAnchorRaf = requestAnimationFrame(tick);
    } else {
      scrollAnchorRestore?.();
      scrollAnchorRestore = null;
      scrollAnchorRaf = 0;
    }
  };
  scrollAnchorRaf = requestAnimationFrame(tick);
}

// `intro` is the id of the top (Hero) section. Its anchor is treated as
// "go to the top, no fragment" rather than a section deep-link, so the URL
// never carries a sticky `#intro`.
export const HOME_SECTION_ID = "intro";

export type HomeNavTarget =
  | { type: "top" } // home — scroll to the top and clear the hash
  | { type: "section"; id: string }; // a section anchor — scroll + set the hash

// Classifies a home-nav href into the local action to take, or null when the
// href is not an in-page target we should resolve locally.
//
//   "/"                 -> { type: "top" }                 (canonical home)
//   "/#intro"           -> { type: "top" }                 (intro IS the top)
//   "/#method"          -> { type: "section", id: "method" }
//   "/#"                -> null   (no target section)
//   "#method"           -> null   (bare hash — resolves against the
//                                  current URL, not home; not our concern)
//   "/blog/foo/#method" -> null   (cross-route navigation)
//   "/?x=1#method"      -> null   (query before the hash — not "/#…")
//
// Callers pass a clean `/#${id}`; this does not sanitize multi-hash or
// trailing-slash input (`/#a#b` -> section "a#b", `/#intro/` -> section
// "intro/"). Pure and DOM-free so the desktop nav click decision is
// unit-testable.
export function homeNavTarget(href: string): HomeNavTarget | null {
  if (href === "/") return { type: "top" };
  if (!href.startsWith("/#")) return null;
  const id = href.slice(2);
  if (id.length === 0) return null;
  if (id === HOME_SECTION_ID) return { type: "top" };
  return { type: "section", id };
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

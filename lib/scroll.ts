// Returns the section id for a home-page hash href, or null when the href
// is not an in-page anchor we should resolve locally.
//
//   "/#method"      -> "method"
//   "/#"  | "/"     -> null   (no target section)
//   "#method"       -> null   (bare hash — resolves against the current
//                              URL, not the home page; not our concern)
//   "/blog/foo"     -> null   (cross-route navigation)
//
// Pure and DOM-free so the desktop nav click decision is unit-testable.
export function homeHashSectionId(href: string): string | null {
  if (!href.startsWith("/#")) return null;
  const id = href.slice(2);
  return id.length > 0 ? id : null;
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
// The state is module-level and shared by every caller (the desktop
// nav in Chrome.tsx and the mobile drawer in MobileMenu.tsx): a nav
// click mid drawer-close scroll cancels and restores cleanly instead
// of the two fighting each other.
let scrollAnchorRaf = 0;
let scrollAnchorRestore: (() => void) | null = null;

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
  const marginTop = parseFloat(getComputedStyle(el).scrollMarginTop);
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
    window.scrollTo(0, startY + distance * t);
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

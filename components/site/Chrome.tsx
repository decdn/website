"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { links } from "@/lib/links";
import { homeHashSectionId } from "@/lib/scroll";
import { MobileMenu } from "@/components/site/MobileMenu";

const SECTION_IDS = ["intro", "compare", "method", "faq", "contact"] as const;
// Hash anchors are written `/#section`. Required because this nav also
// renders on /blog/*, where a bare `#section` resolves against the
// current URL (e.g. /blog/foo/#section) instead of the home page.
const NAV = [
  { id: "compare", label: "compare" },
  { id: "method", label: "method" },
  { id: "faq", label: "faq" },
  { id: "contact", label: "contact" },
] as const;

// Ids of sections that paint on a dark background — used to flip the
// navbar text color per-section instead of relying on
// `mix-blend-mode: difference`, which silently fails on Safari / iOS
// when applied to `position: fixed` elements (the nav would vanish).
const DARK_SECTIONS: ReadonlySet<(typeof SECTION_IDS)[number]> = new Set([
  "compare",
  "faq",
]);

export function Chrome() {
  const [active, setActive] = useState<(typeof SECTION_IDS)[number]>("intro");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  // This component lives in the root layout, so a `next/link` client-side
  // nav swaps the page DOM without remounting it. Keying the observers on
  // `pathname` lets them re-bind to the new route's sections — otherwise,
  // after navigating to /blog/* and back, `active` (and the nav tone that
  // tracks it) would stay frozen at its last home-page value.
  const pathname = usePathname();

  const handleMobileOpenChange = useCallback(
    (open: boolean) => setMobileOpen(open),
    [],
  );

  // Plain `<Link href="/#section">` appends rather than replaces the hash
  // when the URL already carries it (Next 16 App Router, output: "export"
  // + trailingSlash), growing `/#method#method…` across click → reload →
  // click cycles. Intercept same-page anchors and resolve locally. Off
  // this route the section isn't in the DOM (e.g. /blog/*); force a full
  // reload so the destination resolves the hash deterministically — the
  // soft-nav hash codepath is the unreliable one. Modified clicks (new
  // tab, middle-click) fall through to the native <Link>.
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const id = homeHashSectionId(e.currentTarget.getAttribute("href") ?? "");
      if (id === null) return;
      e.preventDefault();
      const el = document.getElementById(id);
      if (el === null) {
        window.location.assign(`/#${id}`);
        return;
      }
      // Write the exact single hash so it can never accumulate;
      // replaceState keeps a same-hash click a URL no-op.
      history.replaceState(null, "", `#${id}`);
      // Native smooth scroll: with <html>'s motion-safe:scroll-smooth
      // this is the browser's eased curve, respects each section's
      // scroll-mt, and auto-honours reduced-motion. No body pin on
      // desktop, so the drawer's custom rAF isn't needed.
      el.scrollIntoView({ block: "start" });
    },
    [],
  );

  // Active section = whichever one paints the strip directly under the
  // navbar. We collapse the IO root into a 1px horizontal slice at y =
  // navbar.offsetHeight via rootMargin — the section currently
  // intersecting that slice is the one whose background sits behind the
  // nav, so the tone flip happens exactly when its top crosses under.
  //
  // The slice depends on window.innerHeight AND navbar.offsetHeight, so
  // the IO is rebuilt on (a) route change (the section nodes themselves
  // change), (b) window resize and (c) nav-size changes (e.g. webfont
  // swap). Rebuilds are rAF-coalesced so a resize burst
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
          let bestId: (typeof SECTION_IDS)[number] | null = null;
          let bestTop = -Infinity;
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const { id } = entry.target;
            if (!(SECTION_IDS as readonly string[]).includes(id)) continue;
            const top = entry.boundingClientRect.top;
            if (top > bestTop) {
              bestTop = top;
              bestId = id as (typeof SECTION_IDS)[number];
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
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    // Re-sync after a client-side nav too: the route change resets scroll
    // to the top, but a `[]`-deps effect wouldn't re-read it, leaving
    // `data-scrolled` stale on the new page until the next scroll event.
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Guard against a stale `active` landing in `DARK_SECTIONS` and painting
  // `text-paper` over a paper-toned page: off-home the IO observes nothing,
  // and on the first render after a client nav `active` still holds the
  // previous route's last value until the [pathname] effects re-sync.
  // `scrolled` doubles as a proxy for "past the intro hero".
  const effectiveActive = pathname === "/" && scrolled ? active : "intro";
  const onDark = DARK_SECTIONS.has(effectiveActive);
  // The toggle is portalled to <body> (see MobileMenu.tsx) and lives
  // on top of the paper panel while the drawer is open — force it to
  // paper then so its × reads against the white panel.
  const toggleTone = mobileOpen ? "paper" : onDark ? "ink" : "paper";

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      data-scrolled={scrolled ? "true" : undefined}
      data-tone={onDark ? "ink" : "paper"}
      data-mobile-open={mobileOpen ? "true" : undefined}
      className={`chrome-nav fixed inset-x-0 top-0 z-50 px-[var(--frame-gutter)] py-5 ${
        onDark ? "text-paper" : "text-ink"
      }`}
    >
      <div className="mx-auto grid w-full max-w-[var(--frame-max)] grid-cols-[1fr_auto_1fr] items-center gap-4">
        <Link
          href="/#intro"
          onClick={handleNavClick}
          className="col-start-1 flex items-center gap-3 no-underline"
        >
          {/* Both variants stay mounted and toggled via `display` so the
              tone flip never flashes — browsers fetch hidden <img> tags
              eagerly enough that the swap-in variant is already in cache.
              Only one variant carries alt text; the duplicate stays alt=""
              so screen readers announce "decdn" once, not twice. */}
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
            alt=""
            width={112}
            height={30}
            className={onDark ? "block" : "hidden"}
          />
          <span className="meta hidden opacity-70 sm:inline">labs</span>
        </Link>

        <ul className="hidden items-center gap-7 xl:flex">
          {NAV.map((item) => {
            const isActive = effectiveActive === item.id;
            return (
              <li key={item.id}>
                <Link
                  href={`/#${item.id}`}
                  onClick={handleNavClick}
                  aria-current={isActive ? "true" : undefined}
                  className="nav-item"
                >
                  <span className="nav-label">{item.label}</span>
                  <span aria-hidden className="nav-underline" />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="col-start-3 flex items-center gap-5 justify-self-end">
          <a
            href={links.docs}
            className="meta hidden items-center gap-2 no-underline border-b border-current pb-[2px] xl:flex"
          >
            <span>Docs</span>
            <span aria-hidden>→</span>
          </a>
          <Link
            href={links.blog}
            className="meta hidden items-center gap-2 no-underline border-b border-current pb-[2px] xl:flex"
          >
            <span>Blog</span>
            <span aria-hidden>→</span>
          </Link>
          <a
            href={links.litepaper}
            target="_blank"
            rel="noopener noreferrer"
            className="meta hidden items-center gap-2 no-underline border-b border-current pb-[2px] xl:flex"
          >
            <span>Litepaper</span>
            <span aria-hidden>→</span>
          </a>
          <MobileMenu
            activeSection={effectiveActive}
            tone={toggleTone}
            onOpenChange={handleMobileOpenChange}
          />
        </div>
      </div>
    </nav>
  );
}

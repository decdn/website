"use client";

import { useEffect, useState } from "react";
import { links } from "@/lib/links";

const SECTION_IDS = ["s-01", "s-02", "s-03", "s-04", "s-05"] as const;
const NAV = [
  { id: "s-02", label: "Compare" },
  { id: "s-03", label: "Method" },
  { id: "s-04", label: "FAQ" },
  { id: "s-05", label: "Contact" },
] as const;

export function Chrome() {
  const [active, setActive] = useState<(typeof SECTION_IDS)[number]>("s-01");

  useEffect(() => {
    const nodes = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (n): n is HTMLElement => n !== null,
    );
    if (nodes.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length === 0) return;
        const id = visible[0].target.id;
        if ((SECTION_IDS as readonly string[]).includes(id)) {
          setActive(id as (typeof SECTION_IDS)[number]);
        }
      },
      { threshold: [0.3, 0.6] },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* top navbar */}
      <nav
        aria-label="Primary"
        className="blend fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 px-4 py-3 sm:px-8 sm:py-4"
      >
        <a href="#s-01" className="flex items-baseline gap-3 no-underline">
          <span className="text-[15px] font-semibold tracking-[-0.02em] lowercase">
            deCDN
          </span>
          <span className="meta hidden opacity-70 sm:inline">
            labs · mmxxvi
          </span>
        </a>

        <ul className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`meta inline-block origin-center no-underline transition duration-200 hover:scale-[1.1] hover:opacity-100 ${
                    isActive ? "opacity-100" : "opacity-55"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        <a
          href={links.whitepaper}
          className="meta flex items-center gap-2 no-underline"
          style={{ borderBottom: "1px solid currentColor", paddingBottom: 2 }}
        >
          <span className="hidden sm:inline">Whitepaper</span>
          <span className="sm:hidden">Paper</span>
          <span aria-hidden>→</span>
        </a>
      </nav>

      {/* left gutter — vertical meta */}
      <div
        aria-hidden
        className="blend pointer-events-none fixed top-1/2 left-3 z-40 hidden -translate-y-1/2 md:block"
      >
        <div
          className="meta whitespace-nowrap"
          style={{
            transform: "rotate(-90deg) translateY(-100%)",
            transformOrigin: "top left",
          }}
        >
          node-001 · lat 41.0082 · lon 28.9784 · built in rust
        </div>
      </div>
    </>
  );
}

import Link from "next/link";
import { links } from "@/lib/links";

export function Footer() {
  return (
    <footer className="bg-paper px-frame-gutter pb-10 text-ink">
      <div className="@container mx-auto flex max-w-frame flex-col gap-3">
        <span aria-hidden className="rule opacity-40" />
        <div className="grid grid-cols-1 gap-6 text-micro tracking-[0.2em] uppercase opacity-80 @md:grid-cols-3 @md:items-start @md:gap-2">
          <span>© decdn labs · open source</span>
          <span className="@md:text-center">
            built in rust · probably over-engineered
          </span>
          {/* Right-aligned vertical list: legal pages stacked above the
              presskit download. */}
          <nav
            aria-label="Legal and resources"
            className="flex flex-col gap-2 @md:items-end @md:justify-self-end"
          >
            <Link
              href={links.privacy}
              className="no-underline transition-opacity hover:opacity-100"
            >
              privacy
            </Link>
            <Link
              href={links.terms}
              className="no-underline transition-opacity hover:opacity-100"
            >
              terms
            </Link>
            <Link
              href={links.disclaimer}
              className="no-underline transition-opacity hover:opacity-100"
            >
              disclaimer
            </Link>
            <a
              href={links.presskit}
              download
              aria-label="Download presskit"
              className="mt-1 inline-flex items-baseline gap-2 no-underline hover:opacity-100"
              style={{
                borderBottom: "1px solid currentColor",
                paddingBottom: 2,
              }}
            >
              <span>presskit</span>
              <span aria-hidden>↓</span>
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

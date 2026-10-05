import Link from "next/link";
import { links } from "@/lib/links";

export function Footer() {
  return (
    <footer className="bg-paper px-frame-gutter pb-10 text-ink">
      <div className="@container mx-auto flex max-w-frame flex-col gap-3">
        <span aria-hidden className="rule opacity-40" />
        <div className="grid grid-cols-1 gap-6 text-micro tracking-[0.2em] uppercase @md:grid-cols-3 @md:items-start @md:gap-2">
          <span className="opacity-80">© decdn labs · open source</span>
          <span className="opacity-80 @md:text-center">
            built in rust · probably over-engineered
          </span>
          {/* Phones: legal pages stacked bottom-left, presskit bottom-right,
              one rule under both. @md: a right-aligned column with the
              presskit underlined on its own. */}
          <nav
            aria-label="Legal and resources"
            className="-mt-1 flex items-end justify-between border-b border-current/80 pb-[2px] @md:flex-col @md:justify-start @md:justify-self-end @md:border-0 @md:pb-0"
          >
            <div className="flex flex-col @md:items-end">
              <Link
                href={links.privacy}
                className="py-1 underline-offset-4 opacity-80 transition-opacity hover:underline hover:opacity-100"
              >
                privacy
              </Link>
              <Link
                href={links.terms}
                className="py-1 underline-offset-4 opacity-80 transition-opacity hover:underline hover:opacity-100"
              >
                terms
              </Link>
              <Link
                href={links.disclaimer}
                className="py-1 underline-offset-4 opacity-80 transition-opacity hover:underline hover:opacity-100"
              >
                disclaimer
              </Link>
            </div>
            <a
              href={links.presskit}
              download
              aria-label="Download presskit"
              className="inline-flex items-baseline gap-2 py-1 no-underline opacity-80 transition-opacity hover:opacity-100 @md:mt-2 @md:border-b @md:border-current @md:py-0 @md:pb-[2px]"
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

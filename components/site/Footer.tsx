import { links } from "@/lib/links";

export function Footer() {
  return (
    <footer className="bg-paper px-frame-gutter pb-10 text-ink">
      <div className="@container mx-auto flex max-w-frame flex-col gap-3">
        <span aria-hidden className="rule opacity-40" />
        <div className="grid grid-cols-1 gap-2 text-micro tracking-[0.2em] uppercase opacity-80 @md:grid-cols-3 @md:items-center">
          <span>© decdn labs · open source</span>
          <span className="@md:text-center">
            built in rust · probably over-engineered
          </span>
          <a
            href={links.presskit}
            download
            aria-label="Download presskit"
            className="inline-flex items-baseline gap-2 no-underline hover:opacity-100 @md:justify-self-end"
            style={{
              borderBottom: "1px solid currentColor",
              paddingBottom: 2,
            }}
          >
            <span>presskit</span>
            <span aria-hidden>↓</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

import { links } from "@/lib/links";

export function Footer() {
  return (
    // The footer owns the gap above itself via pt-[var(--frame-pad-y)] — it
    // does not depend on the preceding block's bottom padding. globals.css
    // zeroes the padding-bottom of the section directly before the footer so
    // this single rhythm unit isn't doubled (regression guard for #123/#125).
    // If a future route ends in a non-Frame block, the footer still self-spaces.
    <footer className="bg-paper px-[var(--frame-gutter)] pt-[var(--frame-pad-y)] pb-10 text-ink">
      <div className="@container mx-auto flex max-w-[var(--frame-max)] flex-col gap-3">
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

import type { Metadata } from "next";
import { Frame } from "@/components/ui/Frame";
import { NOT_FOUND_LEAD, NOT_FOUND_TITLE } from "@/lib/copy";
import { links } from "@/lib/links";

// Without this file, out/404.html would be Next's default page inside the
// root layout, inheriting the homepage's title, description, canonical
// (`https://decdn.org/`) and `index, follow` robots tag, beside the `noindex`
// Next injects on a 404. Every unmatched URL on Cloudflare Pages is served
// this page with a 404 status.
//
// `robots` overrides the layout's tag so the two Next emits agree, and
// `canonical: null` drops the inherited one: a 404 has no canonical. Setting
// `alternates` also drops the layout's llms.txt alternate, which a 404 does
// not need either. openGraph/twitter are left alone so the page keeps the
// site card that scripts/check-og-image.mjs requires of every built page.
export const metadata: Metadata = {
  title: NOT_FOUND_TITLE,
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

// Plain anchors rather than next/link: from a 404 a full page load is fine,
// and the test's tree walk (test-utils/react-tree.ts) expands every function
// component it meets, which next/link can't survive outside React; plain
// <a> elements it can read directly.
const WAYS_OUT = [
  { label: "home", href: "/" },
  { label: "field notes", href: links.blog },
  { label: "docs", href: links.docs },
] as const;

export default function NotFound() {
  return (
    <main>
      {/* min-h-svh: the page is a few lines long, and without it the ink
          html/body background shows as a black band under the footer. */}
      <Frame id="not-found" tone="paper" className="min-h-svh">
        <div className="flex flex-col gap-8">
          <h1
            id="not-found-h"
            className="hug text-h2 leading-[0.95] font-semibold"
          >
            {NOT_FOUND_TITLE}
            <span aria-hidden className="text-whisper">
              .
            </span>
          </h1>
          <p className="max-w-[52ch] text-body leading-[1.65]">
            {NOT_FOUND_LEAD}
          </p>
          <ul className="flex flex-col gap-4">
            {WAYS_OUT.map(({ label, href }) => (
              <li key={href}>
                <a
                  className="underline-brutal text-[0.875rem] font-medium tracking-[0.14em] uppercase"
                  href={href}
                >
                  {label}
                  <span className="arrow" aria-hidden>
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Frame>
    </main>
  );
}

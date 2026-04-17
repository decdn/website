import { links } from "@/lib/links";

type FooterLink = { href: string; label: string; external?: boolean };

const navLinks: FooterLink[] = [
  { href: links.github, label: "github", external: true },
  { href: links.docs, label: "docs", external: true },
  { href: links.whitepaper, label: "whitepaper", external: true },
  { href: links.runNode, label: "run a node", external: true },
  { href: links.contact, label: "contact", external: true },
];

export function Footer() {
  const year = new Date().getUTCFullYear();
  return (
    <footer className="border-t border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-elevated)]/70">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-6 font-mono text-[11px] tracking-[0.16em] uppercase sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[color:var(--color-muted)]">
          <span className="text-[color:var(--color-phosphor)]">decdn@edge</span>
          <span className="text-[color:var(--color-phosphor-dim)]">:</span>
          <span>~$</span>
          <span className="text-[color:var(--color-ink)]/90">
            uptime · nodes 142 · v0.1
          </span>
          <span className="text-[color:var(--color-line-strong)]">│</span>
          <span>© {year}</span>
          <span className="text-[color:var(--color-line-strong)]">│</span>
          <span className="text-[color:var(--color-amber)]">mit</span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[color:var(--color-muted)]">
          {navLinks.map((l, i) => (
            <span key={l.label} className="flex items-center gap-3">
              <a
                className="transition-colors hover:text-[color:var(--color-phosphor)]"
                href={l.href}
                {...(l.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {l.label}
              </a>
              {i < navLinks.length - 1 && (
                <span
                  aria-hidden="true"
                  className="text-[color:var(--color-line-strong)]"
                >
                  │
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}

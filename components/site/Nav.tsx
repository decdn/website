import { links } from "@/lib/links";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-line)] bg-[color:var(--color-bg)]/85 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--color-bg)]/70">
      <div className="mx-auto flex h-12 w-full max-w-5xl items-center gap-6 px-6 font-mono text-[12px] sm:px-8">
        <a
          href="#top"
          className="flex items-center gap-2 text-[color:var(--color-phosphor)] tracking-[0.14em] uppercase whitespace-nowrap"
        >
          <span
            aria-hidden="true"
            className="text-[color:var(--color-phosphor-dim)]"
          >
            [
          </span>
          <span className="bloom">DECDN</span>
          <span
            aria-hidden="true"
            className="text-[color:var(--color-muted)] hidden sm:inline"
          >
            ::
          </span>
          <span
            aria-hidden="true"
            className="text-[color:var(--color-amber)] hidden sm:inline"
          >
            SYS//EDGE
          </span>
          <span
            aria-hidden="true"
            className="text-[color:var(--color-phosphor-dim)]"
          >
            ]
          </span>
        </a>
        <nav
          aria-label="Primary"
          className="ml-auto flex items-center gap-5 text-[color:var(--color-muted)] tracking-[0.12em] uppercase"
        >
          <a
            className="hidden transition-colors hover:text-[color:var(--color-phosphor)] sm:inline"
            href="#how"
          >
            how
          </a>
          <span
            aria-hidden="true"
            className="hidden text-[color:var(--color-line-strong)] sm:inline"
          >
            │
          </span>
          <a
            className="hidden transition-colors hover:text-[color:var(--color-phosphor)] sm:inline"
            href="#economics"
          >
            economics
          </a>
          <span
            aria-hidden="true"
            className="hidden text-[color:var(--color-line-strong)] sm:inline"
          >
            │
          </span>
          <a
            className="hidden transition-colors hover:text-[color:var(--color-phosphor)] sm:inline"
            href="#status"
          >
            status
          </a>
          <span
            aria-hidden="true"
            className="hidden text-[color:var(--color-line-strong)] sm:inline"
          >
            │
          </span>
          <a
            className="cursor transition-colors hover:text-[color:var(--color-phosphor)]"
            href={links.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            github
          </a>
        </nav>
      </div>
    </header>
  );
}

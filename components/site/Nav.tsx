import { links } from "@/lib/links";

export function Nav() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6 sm:px-8">
        <a href="#top" className="font-mono text-sm font-medium tracking-tight">
          de<span className="text-accent">CDN</span>
        </a>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <a className="hidden sm:inline hover:text-ink" href="#how">
            How it works
          </a>
          <a className="hidden sm:inline hover:text-ink" href="#economics">
            Economics
          </a>
          <a className="hidden sm:inline hover:text-ink" href="#status">
            Status
          </a>
          <a
            className="hover:text-ink"
            href={links.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}

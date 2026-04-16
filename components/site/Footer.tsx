import { links } from "@/lib/links";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="font-mono text-sm text-muted">
          de<span className="text-accent">CDN</span>
          <span className="ml-3 text-xs">
            © {new Date().getUTCFullYear()} — MIT
          </span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <a
            className="hover:text-ink"
            href={links.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            className="hover:text-ink"
            href={links.docs}
            target="_blank"
            rel="noopener noreferrer"
          >
            Docs
          </a>
          <a
            className="hover:text-ink"
            href={links.whitepaper}
            target="_blank"
            rel="noopener noreferrer"
          >
            Whitepaper
          </a>
          <a
            className="hover:text-ink"
            href={links.runNode}
            target="_blank"
            rel="noopener noreferrer"
          >
            Run a node
          </a>
          <a className="hover:text-ink" href={links.contact}>
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}

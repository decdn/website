import type { AnchorHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

type Props = {
  href: string;
  variant?: Variant;
  children: ReactNode;
  external?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children">;

const base =
  "ring-phosphor inline-flex items-center justify-center font-mono text-[13px] leading-none tracking-[0.02em] uppercase transition-colors select-none";

const styles: Record<Variant, string> = {
  primary:
    "h-11 px-5 border border-[color:var(--color-phosphor)] text-[color:var(--color-phosphor)] hover:bg-[color:var(--color-phosphor)] hover:text-[color:var(--color-bg)] bloom",
  secondary:
    "h-11 px-5 border border-[color:var(--color-line-strong)] text-[color:var(--color-ink)] hover:border-[color:var(--color-phosphor)] hover:text-[color:var(--color-phosphor)]",
  ghost:
    "h-11 px-3 text-[color:var(--color-muted)] hover:text-[color:var(--color-phosphor)]",
};

export function Button({
  href,
  variant = "primary",
  external,
  className,
  children,
  ...rest
}: Props) {
  const isExternal =
    external ?? (href.startsWith("http") || href.startsWith("mailto:"));

  const bracketed = variant !== "ghost";

  return (
    <a
      href={href}
      className={`${base} ${styles[variant]} ${className ?? ""}`}
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : null)}
      {...rest}
    >
      {bracketed && (
        <span
          aria-hidden="true"
          className="mr-3 text-[color:var(--color-phosphor-dim)]"
        >
          [
        </span>
      )}
      <span>{children}</span>
      {bracketed && (
        <span
          aria-hidden="true"
          className="ml-3 text-[color:var(--color-phosphor-dim)]"
        >
          ]
        </span>
      )}
    </a>
  );
}

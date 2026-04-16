import type { AnchorHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

type Props = {
  href: string;
  variant?: Variant;
  children: ReactNode;
  external?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children">;

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-medium tracking-tight transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

const styles: Record<Variant, string> = {
  primary: "bg-ink text-canvas hover:bg-ink/90",
  secondary: "border border-line text-ink hover:bg-surface",
  ghost: "text-ink hover:text-ink/70",
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

  return (
    <a
      href={href}
      className={`${base} ${styles[variant]} ${className ?? ""}`}
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : null)}
      {...rest}
    >
      {children}
    </a>
  );
}

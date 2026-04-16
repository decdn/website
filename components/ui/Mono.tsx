import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function Mono({ children, className }: Props) {
  return (
    <span className={`font-mono text-[0.95em] ${className ?? ""}`}>
      {children}
    </span>
  );
}

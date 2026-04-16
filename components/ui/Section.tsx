import type { ReactNode } from "react";

type Props = {
  id?: string;
  eyebrow?: string;
  className?: string;
  children: ReactNode;
};

export function Section({ id, eyebrow, className, children }: Props) {
  return (
    <section
      id={id}
      className={`border-t border-line first:border-t-0 ${className ?? ""}`}
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-24 sm:px-8 sm:py-32">
        {eyebrow ? (
          <div className="mb-8 font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {eyebrow}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

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
      className={`border-t border-[color:var(--color-line)] first:border-t-0 ${className ?? ""}`}
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-24 sm:px-8 sm:py-32">
        {eyebrow ? (
          <div
            className="mb-12 flex items-center gap-4 font-mono text-[11px] tracking-[0.22em] text-[color:var(--color-phosphor-dim)] uppercase"
            aria-hidden={false}
          >
            <span className="text-[color:var(--color-muted)]">{"//"}</span>
            <span>{eyebrow}</span>
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-[color:var(--color-line-strong)]"
            />
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

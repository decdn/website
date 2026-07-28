import { Fragment } from "react";
import { METHOD_FIGURES, METHOD_STEPS, STACK } from "@/lib/copy";
import { Figure } from "@/components/ui/Figure";
import { Frame } from "@/components/ui/Frame";
import { MethodRow } from "@/components/ui/MethodRow";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function Method() {
  return (
    <Frame id="method" tone="paper">
      <SectionHeader
        index="03"
        label="How it works"
        timestamp="probe · swarm · settle"
      />

      <h2 id="method-h" className="sr-only">
        How it works
      </h2>

      <div className="mt-14 flex flex-col divide-y divide-current/20">
        {/* Reproduces the previous hand-written 0 / 120 / 240 cascade. */}
        {METHOD_STEPS.map((step, i) => (
          <MethodRow key={step.n} {...step} delay={i * 120} />
        ))}
      </div>

      <div data-reveal className="mt-auto pt-12">
        <span className="meta mb-3 block opacity-60">stack</span>
        <div className="hug flex flex-wrap items-baseline gap-x-5 gap-y-2 text-h3 font-semibold tracking-[-0.03em]">
          {/* The `·` is a separator between chips, not part of one, so it is
              aria-hidden and rendered only between items. */}
          {STACK.map((name, i) => (
            <Fragment key={name}>
              {i > 0 && (
                <span aria-hidden className="opacity-30">
                  ·
                </span>
              )}
              <span>{name}</span>
            </Fragment>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-y-4 @xl:grid-cols-4">
          {METHOD_FIGURES.map((figure) => (
            <Figure key={figure.label} {...figure} />
          ))}
        </div>
      </div>
    </Frame>
  );
}

import { METHOD_STEPS, STACK } from "@/lib/copy";
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

      <div data-reveal className="pt-12">
        <span className="meta mb-3 block opacity-60">stack</span>
        {/* Hairlines come from the list's top/left edge plus each cell's
            right/bottom edge, so the grid stays single-ruled at any column
            count. In one row of six, --text-h3 overflows a cell ("BLAKE3"),
            so names size off the frame's container width instead. The role
            label is `.meta` spelled out at 12px — `.meta` pins 11px outside
            any cascade layer, so a size utility beside it can't win. */}
        <ul className="grid grid-cols-2 border-t border-l border-current/20 @xl:grid-cols-3 @6xl:grid-cols-6">
          {STACK.map(({ name, role }) => (
            <li
              key={name}
              className="flex flex-col gap-3 border-r border-b border-current/20 px-5 py-6 @xl:px-6 @xl:py-7 @6xl:px-5"
            >
              <span className="hug text-h3 leading-none font-semibold tracking-[-0.03em] @6xl:text-[3.4cqi]">
                {name}
              </span>
              <span className="flex items-start gap-2.5 text-[12px] leading-[1.2] font-medium tracking-[0.22em] uppercase opacity-60">
                <span
                  aria-hidden
                  className="mt-[0.33em] size-1.5 shrink-0 bg-current"
                />
                {role}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  );
}

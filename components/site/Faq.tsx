import { FaqItem } from "@/components/ui/FaqItem";
import { Frame } from "@/components/ui/Frame";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FAQ_ITEMS } from "@/lib/faq";

export function Faq() {
  return (
    <Frame id="faq" tone="ink">
      <SectionHeader index="04" label="FAQ" timestamp="field notes" />

      <div className="mt-14 flex flex-col gap-10">
        <h2
          data-reveal
          id="faq-h"
          className="hug font-semibold leading-[0.92] tracking-[-0.04em]"
          style={{ fontSize: "var(--fs-h2)" }}
        >
          frequently asked.
        </h2>

        <dl className="flex flex-col divide-y divide-current/20">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem key={item.q} delay={i * 80} q={item.q} a={item.a} />
          ))}
        </dl>
      </div>
    </Frame>
  );
}

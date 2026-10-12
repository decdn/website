import { TRY_HEADLINE, TRY_LEAD } from "@/lib/copy";
import { highlightBrand } from "@/components/ui/brand";
import { Frame } from "@/components/ui/Frame";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TryIt } from "@/components/site/TryIt";

export function Try() {
  return (
    <Frame id="try" tone="paper">
      <SectionHeader
        index="04"
        label="Try it"
        timestamp="testnet · no wallet"
      />

      <div className="mt-14 flex flex-col gap-12">
        <div className="flex flex-col gap-6">
          <h2
            data-reveal
            id="try-h"
            className="hug text-h2 leading-[0.92] font-semibold tracking-[-0.04em]"
          >
            {TRY_HEADLINE}
          </h2>
          <p data-reveal className="max-w-[64ch] text-body leading-[1.65]">
            {highlightBrand(TRY_LEAD)}
          </p>
        </div>

        <TryIt />
      </div>
    </Frame>
  );
}

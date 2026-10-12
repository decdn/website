import { TRY_HEADLINE, TRY_LEAD } from "@/lib/copy";
import { highlightBrand } from "@/components/ui/brand";
import { Frame } from "@/components/ui/Frame";
import { TryIt } from "@/components/site/TryIt";

export function Try() {
  // No chapter header: this continues "How it works", so it drops the
  // frame's top padding and sits on Method's bottom padding alone.
  return (
    <Frame id="try" tone="paper" className="pt-0">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-6">
          <span data-reveal className="meta block opacity-60">
            testnet · no wallet
          </span>
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

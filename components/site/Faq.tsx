import { FaqList } from "@/components/site/FaqList";
import { FAQ_ITEMS } from "@/lib/faq";
import { Frame } from "@/components/ui/Frame";
import { SectionHeader } from "@/components/ui/SectionHeader";

// Shared with the row ordinals ("04.1" …) so the numbering can't drift from
// the section header.
const SECTION = "04";

export function Faq() {
  return (
    <Frame id="faq" tone="ink">
      {/* Not "field notes": that is the blog's name, and this is not the blog. */}
      <SectionHeader
        index={SECTION}
        label="FAQ"
        timestamp={`${FAQ_ITEMS.length} questions`}
      />

      <div className="mt-14 flex flex-col gap-10">
        <h2
          data-reveal
          id="faq-h"
          className="hug text-h2 leading-[0.92] font-semibold tracking-[-0.04em]"
        >
          frequently asked.
        </h2>

        <FaqList section={SECTION} />
      </div>
    </Frame>
  );
}

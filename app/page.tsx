import { Compare } from "@/components/site/Compare";
import { Contact } from "@/components/site/Contact";
import { Faq } from "@/components/site/Faq";
import { Hero } from "@/components/site/Hero";
import { Method } from "@/components/site/Method";
import { JsonLd } from "@/lib/jsonld";
import { faqPageNode } from "@/lib/schema";

export default function Home() {
  return (
    <main>
      {/* FAQPage structured data must match visible content, so only this
          route — the one that renders <Faq /> — may emit it (Google's
          structured-data policy). */}
      <JsonLd data={faqPageNode} />
      <Hero />
      <Compare />
      <Method />
      <Faq />
      <Contact />
    </main>
  );
}

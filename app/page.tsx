import { Compare } from "@/components/home/compare/Compare";
import { Contact } from "@/components/home/contact/Contact";
import { Faq } from "@/components/home/faq/Faq";
import { Hero } from "@/components/home/hero/Hero";
import { Method } from "@/components/home/method/Method";
import { Try } from "@/components/home/try/Try";
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
      <Try />
      <Contact />
    </main>
  );
}

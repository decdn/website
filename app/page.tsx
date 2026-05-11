import { Close } from "@/components/site/Close";
import { Comparison } from "@/components/site/Comparison";
import { Faq } from "@/components/site/Faq";
import { Hero } from "@/components/site/Hero";
import { Method } from "@/components/site/Method";
import { FAQ_ITEMS } from "@/lib/faq";
import { JsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/links";

// FAQPage structured data must match visible content; only the route that
// renders <Faq /> may emit it (Google's structured-data policy).
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}#faq`,
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function Home() {
  return (
    <main>
      <JsonLd data={faqSchema} />
      <Hero />
      <Comparison />
      <Method />
      <Faq />
      <Close />
    </main>
  );
}

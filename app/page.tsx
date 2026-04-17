import { Close } from "@/components/site/Close";
import { Comparison } from "@/components/site/Comparison";
import { Faq } from "@/components/site/Faq";
import { Hero } from "@/components/site/Hero";
import { Method } from "@/components/site/Method";

export default function Home() {
  return (
    <main>
      <Hero />
      <Comparison />
      <Method />
      <Faq />
      <Close />
    </main>
  );
}

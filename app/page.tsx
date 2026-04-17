import { Close } from "@/components/site/Close";
import { Faq } from "@/components/site/Faq";
import { Hero } from "@/components/site/Hero";
import { Method } from "@/components/site/Method";
import { Problem } from "@/components/site/Problem";

export default function Home() {
  return (
    <main>
      <Hero />
      <Problem />
      <Method />
      <Faq />
      <Close />
    </main>
  );
}

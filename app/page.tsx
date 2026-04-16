import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Problem } from "@/components/site/Problem";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Economics } from "@/components/site/Economics";
import { Audiences } from "@/components/site/Audiences";
import { Status } from "@/components/site/Status";
import { Footer } from "@/components/site/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Economics />
        <Audiences />
        <Status />
      </main>
      <Footer />
    </>
  );
}

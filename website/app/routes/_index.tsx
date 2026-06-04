import { About } from "~/components/About";
import { Deck } from "~/components/Deck";
import { Diagrams } from "~/components/Diagrams";
import { Features } from "~/components/Features";
import { Footer } from "~/components/Footer";
import { Hero } from "~/components/Hero";
import { HowItWorks } from "~/components/HowItWorks";
import { HumanLoop } from "~/components/HumanLoop";
import { Nav } from "~/components/Nav";
import { Screenshots } from "~/components/Screenshots";

export default function Index() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <HumanLoop />
        <Diagrams />
        <Features />
        <Screenshots />
        <About />
      </main>
      <Footer />
      <Deck />
    </>
  );
}

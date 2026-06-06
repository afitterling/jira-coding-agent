import { About } from "~/components/About";
import { CognitionLoop } from "~/components/CognitionLoop";
import { DataConnectivity } from "~/components/DataConnectivity";
import { Deck } from "~/components/Deck";
import { Diagrams } from "~/components/Diagrams";
import { Faq } from "~/components/Faq";
import { Features } from "~/components/Features";
import { Footer } from "~/components/Footer";
import { Hero } from "~/components/Hero";
import { HowItWorks } from "~/components/HowItWorks";
import { HumanLoop } from "~/components/HumanLoop";
import { Interfaces } from "~/components/Interfaces";
import { Nav } from "~/components/Nav";
import { Screenshots } from "~/components/Screenshots";
import { UseCases } from "~/components/UseCases";

export default function Index() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <HumanLoop />
        <CognitionLoop />
        <Interfaces />
        <UseCases />
        <DataConnectivity />
        <Diagrams />
        <Features />
        <Screenshots />
        <Faq />
        <About />
      </main>
      <Footer />
      <Deck />
    </>
  );
}

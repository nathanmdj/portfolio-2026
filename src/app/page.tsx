import { AssistantProvider } from "@/components/assistant/assistant-context";
import { AssistantDock } from "@/components/assistant/assistant-dock";
import { Approach } from "@/components/sections/approach";
import { CapabilitiesSection } from "@/components/sections/capabilities";
import { Contact } from "@/components/sections/contact";
import { Experience } from "@/components/sections/experience";
import { FitCheck } from "@/components/sections/fit-check";
import { Hero } from "@/components/sections/hero";
import { StackSection } from "@/components/sections/stack";
import { WorkSection } from "@/components/sections/work";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <AssistantProvider>
      <SiteHeader />
      <main id="main">
        <Hero />
        <StackSection />
        <WorkSection />
        <CapabilitiesSection />
        <Experience />
        <Approach />
        <FitCheck />
        <Contact />
      </main>
      <SiteFooter />
      <AssistantDock />
    </AssistantProvider>
  );
}

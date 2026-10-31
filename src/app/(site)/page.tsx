"use client";

import { CategoryIndex, CollectionRail, Configurator, DoorHero, LeadSection, ParallaxGallery, YearsSection } from "@/components/home";

export default function Home() {
  return (
    <>
      <DoorHero />
      <CategoryIndex />
      <CollectionRail />
      <Configurator />
      <YearsSection />
      <ParallaxGallery />
      <LeadSection />
    </>
  );
}

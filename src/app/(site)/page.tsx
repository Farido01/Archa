"use client";

import { About, CategoryIndex, Collection, Configurator, Hero, LeadSection, Marquee, ProjectsGrid } from "@/components/home";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <CategoryIndex />
      <Collection />
      <Configurator />
      <About />
      <ProjectsGrid />
      <LeadSection />
    </>
  );
}

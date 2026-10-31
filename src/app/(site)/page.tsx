"use client";

import { Business, CallSection, Configurator, HeroPromo, Highlights, Popular, Why } from "@/components/home";

export default function Home() {
  return (
    <>
      <Highlights />
      <HeroPromo />
      <Popular />
      <Why />
      <Business />
      <Configurator />
      <CallSection />
    </>
  );
}

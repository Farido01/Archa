"use client";

import { Business, CallSection, CategoryTiles, Configurator, HeroPromo, Highlights, Popular, Why } from "@/components/home";

export default function Home() {
  return (
    <>
      <Highlights />
      <HeroPromo />
      <Popular />
      <CategoryTiles />
      <Why />
      <Business />
      <Configurator />
      <CallSection />
    </>
  );
}

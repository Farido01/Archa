"use client";

import { motion } from "framer-motion";
import { ArrowRight, Building2, Factory, Hammer, Sparkles } from "lucide-react";
import Link from "next/link";
import { HeroScene, ProductArt, Scene } from "@/components/art";
import { ProductCard, SectionHead, useLead } from "@/components/site";
import { Button, Reveal } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/products";
import { PROJECTS } from "@/lib/projects";
import { useStore } from "@/lib/store";

export default function Home() {
  const { t, tl } = useI18n();
  const { products } = useStore();
  const lead = useLead();
  const featured = products.filter((p) => p.featured).slice(0, 4);

  const why = [
    { icon: Factory, t: t("home.why1.t"), d: t("home.why1.d") },
    { icon: Sparkles, t: t("home.why2.t"), d: t("home.why2.d") },
    { icon: Hammer, t: t("home.why3.t"), d: t("home.why3.d") },
    { icon: Building2, t: t("home.why4.t"), d: t("home.why4.d") },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 size-[720px] rounded-full bg-brand-100/60 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-16">
          <div className="relative z-10">
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="eyebrow mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-brand-700">
              <span className="size-1.5 rounded-full bg-brand-500" /> {t("hero.eyebrow")}
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.7 }} className="display text-[2.6rem] sm:text-6xl lg:text-[4.4rem]">
              {t("hero.title1")}
              <br />
              <span className="text-brand-600">{t("hero.title2")}</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.7 }} className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {t("hero.sub")}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.7 }} className="mt-9 flex flex-wrap gap-3">
              <Link href="/catalog"><Button size="lg">{t("common.viewCatalog")} <ArrowRight size={18} /></Button></Link>
              <Button size="lg" variant="outline" onClick={() => lead()}>{t("common.request")}</Button>
            </motion.div>
            <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-line pt-8">
              {[["30", t("hero.stat1")], ["75K", t("hero.stat2")], ["100%", t("hero.stat3")]].map(([n, l]) => (
                <div key={l}>
                  <dt className="display text-3xl text-brand-700 sm:text-4xl">{n}</dt>
                  <dd className="mt-1.5 text-[13px] leading-snug text-muted">{l}</dd>
                </div>
              ))}
            </motion.dl>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="relative mx-auto w-full max-w-[520px]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2.5rem] bg-brand-700 p-3 shadow-lift">
              <div className="h-full w-full overflow-hidden rounded-t-[999px] rounded-b-[2rem]"><HeroScene /></div>
            </div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute -left-4 bottom-16 hidden items-center gap-3 rounded-2xl bg-surface p-3 pr-5 shadow-lift sm:flex">
              <div className="size-14 overflow-hidden rounded-xl"><ProductArt product={products[3] ?? products[0]} /></div>
              <div>
                <p className="text-sm font-semibold">{tl((products[3] ?? products[0]).name)}</p>
                <p className="text-xs text-muted">{t("common.learnPrice")} →</p>
              </div>
            </motion.div>
            <div className="absolute -right-3 top-24 rounded-2xl bg-brand-600 px-4 py-3 text-white shadow-lift sm:-right-6">
              <p className="text-[11px] uppercase tracking-widest text-white/70">{t("hero.badge")}</p>
              <p className="display mt-1 text-2xl">1996</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <Reveal><SectionHead eyebrow={t("home.cat.eyebrow")} title={t("home.cat.title")} sub={t("home.cat.sub")} action={<Link href="/catalog"><Button variant="outline">{t("common.viewCatalog")} <ArrowRight size={16} /></Button></Link>} /></Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:grid-rows-2">
          {CATEGORIES.map((c, i) => {
            const rep = products.find((p) => p.category === c.id)!;
            const span = i < 2 ? "lg:col-span-3" : "lg:col-span-2";
            return (
              <Reveal key={c.id} delay={i * 0.05} className={span}>
                <Link href={`/catalog?cat=${c.id}`} className={`group relative block overflow-hidden rounded-[2rem] ${i < 2 ? "aspect-[16/9] lg:aspect-auto lg:h-[340px]" : "aspect-[4/3] lg:aspect-auto lg:h-[260px]"}`}>
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"><ProductArt product={rep} variant={i % 2 === 0 ? "green" : "cream"} /></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-6 text-white">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{tl(c.name)}</h3>
                      <p className="mt-1 max-w-xs text-sm text-white/75">{tl(c.blurb)}</p>
                    </div>
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-brand-700 transition group-hover:bg-brand-500 group-hover:text-white"><ArrowRight size={18} /></span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-16">
        <Reveal><SectionHead eyebrow={t("home.feat.eyebrow")} title={t("home.feat.title")} sub={t("home.feat.sub")} /></Reveal>
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
        </div>
      </section>

      {/* WHY */}
      <section className="pattern-arch relative my-16 overflow-hidden bg-brand-700 py-20 text-white lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal><SectionHead light eyebrow={t("home.why.eyebrow")} title={t("home.why.title")} /></Reveal>
          <div className="grid gap-px overflow-hidden rounded-[2rem] border border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
            {why.map((w, i) => (
              <Reveal key={w.t} delay={i * 0.07} className="bg-brand-700/90 p-8 transition-colors hover:bg-brand-800">
                <w.icon size={28} className="text-brand-300" strokeWidth={1.6} />
                <h3 className="mt-10 text-xl font-bold tracking-tight">{w.t}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-white/70">{w.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-16">
        <Reveal><SectionHead eyebrow={t("home.proj.eyebrow")} title={t("home.proj.title")} sub={t("home.proj.sub")} action={<Link href="/projects"><Button variant="outline">{t("home.proj.all")} <ArrowRight size={16} /></Button></Link>} /></Reveal>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {PROJECTS.slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}>
              <Link href="/projects" className="group block">
                <div className="aspect-[3/4] overflow-hidden rounded-3xl"><div className="h-full w-full transition-transform duration-700 group-hover:scale-105"><Scene kind={p.kind} /></div></div>
                <p className="mt-3 px-1 text-[15px] font-semibold">{t(p.key)}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pt-16 sm:px-8">
        <Reveal>
          <div className="pattern-arch relative overflow-hidden rounded-[2.5rem] bg-brand-600 px-6 py-16 text-center text-white sm:px-16 sm:py-20">
            <h2 className="display mx-auto max-w-3xl text-3xl sm:text-5xl">{t("home.cta.title")}</h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">{t("home.cta.sub")}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button size="lg" className="!bg-white !text-brand-700 hover:!bg-brand-50" onClick={() => lead()}>{t("common.request")}</Button>
              <Link href="/contacts"><Button size="lg" variant="ghost" className="!text-white ring-1 ring-white/40 hover:!bg-white/10">{t("nav.contacts")}</Button></Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

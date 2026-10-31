"use client";

import { AnimatePresence, animate, motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Furniture, ProductArt, RoomScene, Scene } from "./art";
import { Photo } from "./photo";
import { LeadForm, useLead } from "./site";
import { useI18n } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { CATEGORIES } from "@/lib/products";
import { PROJECTS } from "@/lib/projects";
import { useStore } from "@/lib/store";
import type { ArtKind, L } from "@/lib/types";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/* ═══════════════════════════════════════════════════
   1. ПЕРВЫЙ ЭКРАН — одна согласованная анимация загрузки
   ═══════════════════════════════════════════════════ */
export function Hero() {
  const { t, tl } = useI18n();
  const { products } = useStore();
  const lead = useLead();
  const words = t("hero2.title").split(" ");
  const accent = products.find((p) => p.id === "p-chair-green") ?? products[0];

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32">
      <div className="mx-auto grid max-w-7xl items-end gap-10 px-5 pb-20 sm:px-10 lg:grid-cols-12 lg:gap-12 lg:pb-24">
        <div className="lg:col-span-6 lg:pb-8">
          <p className="fade-up mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-700" style={{ animationDelay: "80ms" }}>
            <span className="size-1.5 rounded-full bg-brand-500" />
            {t("hero2.note")}
          </p>
          <h1 className="display text-[2.9rem] text-juniper sm:text-7xl lg:text-[4.5rem] xl:text-[5rem]">
            {words.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-top">
                <span className="rise inline-block" style={{ animationDelay: `${120 + i * 55}ms` }}>{w}&nbsp;</span>
              </span>
            ))}
          </h1>
          <p className="fade-up mt-7 max-w-lg text-lg leading-relaxed text-muted" style={{ animationDelay: "420ms" }}>{t("hero2.sub")}</p>
          <div className="fade-up mt-9 flex flex-wrap gap-3" style={{ animationDelay: "520ms" }}>
            <Link href="/catalog" className="press inline-flex h-14 items-center gap-2 rounded-full bg-juniper px-7 font-semibold text-mist hover:bg-brand-800">
              {t("common.viewCatalog")} <ArrowRight size={18} />
            </Link>
            <button onClick={() => lead()} className="press inline-flex h-14 items-center rounded-full px-7 font-semibold text-juniper ring-1 ring-juniper/25 hover:bg-juniper/5">
              {t("common.request")}
            </button>
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <div className="unclip arch relative aspect-[4/4.6] overflow-hidden bg-surface-2 sm:aspect-[4/4] lg:aspect-[4/4.7]" style={{ animationDelay: "150ms" }}>
            <div className="settle absolute inset-0" style={{ animationDelay: "150ms" }}>
              <Photo src={PHOTOS.hero} alt={t("hero2.title")} priority>
                <RoomScene className="h-full w-full" />
              </Photo>
            </div>
          </div>
          <div className="fade-up absolute -bottom-6 right-3 w-[38%] sm:-right-6 lg:w-[32%]" style={{ animationDelay: "700ms" }}>
            <Link href={`/catalog/${accent.id}`} className="group block overflow-hidden rounded-2xl bg-surface p-2 shadow-lift">
              <div className="relative aspect-square overflow-hidden rounded-xl">
                <Photo src={PHOTOS.heroSmall} alt={tl(accent.name)} sizes="200px">
                  <ProductArt product={accent} />
                </Photo>
              </div>
              <p className="px-1.5 pb-1 pt-2.5 text-[13px] font-semibold leading-tight sm:text-sm">{tl(accent.name)}</p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   2. БЕГУЩАЯ СТРОКА — постоянное движение, linear
   ═══════════════════════════════════════════════════ */
export function Marquee() {
  const { tl } = useI18n();
  const items = [...CATEGORIES, ...CATEGORIES];
  return (
    <div className="marquee-wrap overflow-hidden border-y border-juniper/10 bg-juniper py-5 text-mist" aria-hidden>
      <div className="marquee flex w-max items-center">
        {[0, 1].map((k) => (
          <div key={k} className="flex items-center">
            {items.map((c, i) => (
              <span key={`${k}-${i}`} className="flex items-center whitespace-nowrap font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                <span className="px-8">{tl(c.name)}</span>
                <svg width="14" height="22" viewBox="0 0 14 22" className="text-brand-400"><path d="M7 0C9 4 12 7 11 11c2 2 3 5 1 7H2c-2-2-1-5 1-7C2 7 5 4 7 0Z" fill="currentColor" /></svg>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   3. НАПРАВЛЕНИЯ — превью у курсора (только мышь, на пружине)
   ═══════════════════════════════════════════════════ */
export function CategoryIndex() {
  const { t, tl } = useI18n();
  const { products } = useStore();
  const [hover, setHover] = useState<number | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 26 });
  const y = useSpring(my, { stiffness: 220, damping: 26 });
  const rotate = useSpring(useTransform(mx, (v) => Math.max(-6, Math.min(6, v / 120))), { stiffness: 120, damping: 20 });
  const ref = useRef<HTMLDivElement>(null);
  const reps = CATEGORIES.map((c) => products.find((p) => p.category === c.id) ?? products[0]);

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-10 lg:py-32">
      <h2 className="display mb-12 text-[2.6rem] sm:text-6xl lg:text-7xl">{t("idx.title")}</h2>
      <div
        ref={ref}
        className="relative"
        onPointerMove={(e) => {
          if (!ref.current || e.pointerType !== "mouse") return;
          const r = ref.current.getBoundingClientRect();
          mx.set(e.clientX - r.left);
          my.set(e.clientY - r.top);
        }}
        onPointerLeave={() => setHover(null)}
      >
        {CATEGORIES.map((c, i) => {
          const n = products.filter((p) => p.category === c.id).length;
          return (
            <Link
              key={c.id}
              href={`/catalog?cat=${c.id}`}
              onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}
              className="group relative flex items-center gap-5 border-t border-fg/15 py-6 last:border-b sm:py-8"
            >
              <div className="arch-sm relative size-16 shrink-0 overflow-hidden sm:hidden">
                <Photo src={PHOTOS.categories[c.id]} alt={tl(c.name)} sizes="64px"><ProductArt product={reps[i]} variant="green" /></Photo>
              </div>
              <div className="min-w-0 flex-1 lg:flex lg:items-baseline lg:justify-between lg:gap-10">
                <h3 className={`display text-[1.9rem] transition-[color,transform,font-variation-settings] duration-300 ease-[var(--ease-out)] sm:text-5xl lg:text-[4.2rem] ${hover === i ? "translate-x-3 text-brand-600 [font-variation-settings:'SHRP'_100]" : hover !== null ? "text-fg/30" : ""}`}>{tl(c.name)}</h3>
                <div className="mt-1.5 lg:mt-0 lg:max-w-xs lg:text-right">
                  <p className="text-sm text-muted sm:text-base">{tl(c.blurb)}</p>
                  <p className="mt-0.5 text-xs text-muted/80">{t("idx.models", { n })}</p>
                </div>
              </div>
              <ArrowUpRight className={`shrink-0 transition-[transform,color] duration-300 ${hover === i ? "rotate-45 text-brand-600" : "text-fg/30"}`} size={28} />
            </Link>
          );
        })}

        <motion.div aria-hidden style={{ x, y, rotate }} className="pointer-events-none absolute left-0 top-0 z-10 hidden lg:block">
          <AnimatePresence>
            {hover !== null && (
              <motion.div
                key={hover}
                initial={{ opacity: 0, transform: "scale(0.92)" }}
                animate={{ opacity: 1, transform: "scale(1)" }}
                exit={{ opacity: 0, transform: "scale(0.96)", transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                className="arch absolute -left-[120px] -top-[190px] h-[320px] w-[240px] overflow-hidden shadow-lift"
              >
                <Photo src={PHOTOS.categories[CATEGORIES[hover].id]} alt="" sizes="240px">
                  <ProductArt product={reps[hover]} variant="green" />
                </Photo>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   4. КОЛЛЕКЦИЯ — нативная прокрутка + кнопки
   ═══════════════════════════════════════════════════ */
export function Collection() {
  const { t, tl } = useI18n();
  const { products } = useStore();
  const lead = useLead();
  const list = [...products].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 8);
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  };
  const go = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector("article");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 300) + 24), behavior: "smooth" });
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto mb-10 flex max-w-7xl flex-wrap items-end justify-between gap-6 px-5 sm:px-10">
        <h2 className="display max-w-2xl text-[2.6rem] sm:text-6xl lg:text-7xl">{t("col.title")}</h2>
        <div className="flex items-center gap-2">
          <Link href="/catalog" className="mr-3 font-semibold text-brand-600 hover:underline">{t("col.all")}</Link>
          <button onClick={() => go(-1)} disabled={edge.start} aria-label={t("col.prev")} className="press grid size-12 place-items-center rounded-full ring-1 ring-fg/15 hover:bg-juniper hover:text-mist disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-fg"><ArrowLeft size={18} /></button>
          <button onClick={() => go(1)} disabled={edge.end} aria-label={t("col.next")} className="press grid size-12 place-items-center rounded-full ring-1 ring-fg/15 hover:bg-juniper hover:text-mist disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-fg"><ArrowRight size={18} /></button>
        </div>
      </div>
      <div ref={ref} onScroll={update} className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-5 px-5 pb-2 sm:scroll-px-10 sm:px-10 xl:scroll-px-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] xl:px-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]">
        {list.map((p, i) => (
          <article key={p.id} className="group w-[74vw] shrink-0 snap-start sm:w-[44vw] lg:w-[min(28vw,400px)]">
            <Link href={`/catalog/${p.id}`} className="arch relative block aspect-[4/5] overflow-hidden">
              <div className="hover-zoom h-full w-full"><ProductArt product={p} variant={i % 3 === 1 ? "green" : "cream"} /></div>
            </Link>
            <div className="pt-5">
              <Link href={`/catalog/${p.id}`}><h3 className="font-display text-xl font-semibold leading-tight tracking-tight">{tl(p.name)}</h3></Link>
              <button onClick={() => lead(p.id)} className="press mt-3 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-fg/15 hover:bg-brand-600 hover:text-white hover:ring-brand-600">{t("common.learnPrice")}</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   5. ПРИМЕРОЧНАЯ ЦВЕТА — отвечает на выбор
   ═══════════════════════════════════════════════════ */
const FABRIC: { name: L; hex: string }[] = [
  { name: { ru: "Молочный", tg: "Шир" }, hex: "#ece6d8" },
  { name: { ru: "Беж", tg: "Беж" }, hex: "#d6c3a2" },
  { name: { ru: "Тауп", tg: "Таупе" }, hex: "#a8978a" },
  { name: { ru: "Пыльная роза", tg: "Гулобии хира" }, hex: "#c9a3a0" },
  { name: { ru: "Горчица", tg: "Хардалӣ" }, hex: "#c79a3e" },
  { name: { ru: "Изумруд", tg: "Зумуррад" }, hex: "#1f6b46" },
  { name: { ru: "Индиго", tg: "Индиго" }, hex: "#2f4d73" },
  { name: { ru: "Графит", tg: "Графит" }, hex: "#5a5f5d" },
];
const DOOR: { name: L; hex: string }[] = [
  { name: { ru: "Белый", tg: "Сафед" }, hex: "#f2f0ea" },
  { name: { ru: "Слоновая кость", tg: "Устухони фил" }, hex: "#e8dfc9" },
  { name: { ru: "Светлый дуб", tg: "Булути равшан" }, hex: "#c49a68" },
  { name: { ru: "Орех", tg: "Чормағз" }, hex: "#8a5a36" },
  { name: { ru: "Серый шёлк", tg: "Хокистарии абрешим" }, hex: "#b9bdb4" },
  { name: { ru: "Графит", tg: "Графит" }, hex: "#4b5148" },
];
const MODELS: { id: string; art: ArtKind; accent: string; palette: typeof FABRIC }[] = [
  { id: "p-sofa-cloud", art: "sofa", accent: "#bfae90", palette: FABRIC },
  { id: "p-chair-matrix", art: "armchair", accent: "#2b2f2c", palette: FABRIC },
  { id: "p-door-classic", art: "door", accent: "#cfd8cf", palette: DOOR },
];

export function Configurator() {
  const { t, tl } = useI18n();
  const { products } = useStore();
  const lead = useLead();
  const [m, setM] = useState(0);
  const [c, setC] = useState(1);
  const model = MODELS[m];
  const product = products.find((p) => p.id === model.id);
  const color = model.palette[Math.min(c, model.palette.length - 1)];

  return (
    <section className="bg-surface">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-24 sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:py-32">
        <div className="relative">
          <div className="arch absolute inset-x-[6%] bottom-0 top-[4%] transition-[background-color] duration-500" style={{ backgroundColor: `${color.hex}40` }} />
          <div className="tint relative aspect-[4/3.3]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.svg
                key={model.art}
                viewBox="0 0 400 300"
                className="h-full w-full"
                initial={{ opacity: 0, filter: "blur(4px)", transform: "translateY(8px)" }}
                animate={{ opacity: 1, filter: "blur(0px)", transform: "translateY(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.12 } }}
                transition={{ duration: 0.28, ease: EASE_OUT }}
                aria-label={product ? tl(product.name) : ""}
                role="img"
              >
                <Furniture kind={model.art} tone={color.hex} accent={model.accent} />
              </motion.svg>
            </AnimatePresence>
          </div>
        </div>

        <div>
          <h2 className="display text-[2.6rem] sm:text-6xl lg:text-7xl">{t("cfg.title")}</h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">{t("cfg.sub")}</p>

          <p className="mb-3 mt-10 text-sm font-semibold text-muted">{t("cfg.model")}</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("cfg.model")}>
            {MODELS.map((x, i) => {
              const pr = products.find((p) => p.id === x.id);
              return (
                <button key={x.id} role="radio" aria-checked={m === i} onClick={() => { setM(i); setC(1); }} className={`press relative rounded-full px-5 py-2.5 text-sm font-semibold ${m === i ? "text-white" : "bg-mist text-fg hover:bg-surface-2"}`}>
                  {m === i && <motion.span layoutId="cfg-model" className="absolute inset-0 rounded-full bg-juniper" transition={{ type: "spring", duration: 0.35, bounce: 0.15 }} />}
                  <span className="relative">{pr ? tl(pr.name) : x.id}</span>
                </button>
              );
            })}
          </div>

          <p className="mb-3 mt-8 text-sm font-semibold text-muted">{t("cfg.color")}: <span className="text-fg">{tl(color.name)}</span></p>
          <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={t("cfg.color")}>
            {model.palette.map((x, i) => (
              <button key={x.hex} role="radio" aria-checked={c === i} aria-label={tl(x.name)} title={tl(x.name)} onClick={() => setC(i)} className="press relative grid size-12 place-items-center">
                {c === i && <motion.span layoutId="cfg-ring" className="absolute inset-0 rounded-full ring-2 ring-juniper" transition={{ type: "spring", duration: 0.3, bounce: 0.15 }} />}
                <span className="size-9 rounded-full ring-1 ring-black/10" style={{ background: x.hex }} />
              </button>
            ))}
          </div>

          <button
            onClick={() => product && lead(product.id, t("cfg.msg", { p: tl(product.name), c: tl(color.name) }))}
            className="press mt-10 inline-flex h-14 items-center gap-2 rounded-full bg-brand-600 px-7 font-semibold text-white hover:bg-brand-700"
          >
            {t("cfg.cta")} <ArrowUpRight size={18} />
          </button>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted">{t("cfg.note")}</p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   6. О КОМПАНИИ — счётчик срабатывает один раз
   ═══════════════════════════════════════════════════ */
function CountOnce({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "-120px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setN(to);
    const c = animate(0, to, { duration: 1.4, ease: EASE_OUT, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [seen, to]);
  return <span ref={ref} className="tabular-nums">{n}</span>;
}

export function About() {
  const { t } = useI18n();
  const facts = ["tl.f2", "tl.f3", "tl.f4", "tl.f5"];
  return (
    <section className="bg-juniper text-mist">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-10 lg:grid-cols-2 lg:gap-20 lg:py-32">
        <div>
          <p className="font-display text-[9rem] font-[800] leading-[0.8] tracking-[-0.04em] text-brand-400 sm:text-[13rem]"><CountOnce to={30} /></p>
          <p className="mt-3 font-display text-2xl font-semibold text-mist/80">{t("about.years")}</p>
          <p className="mt-10 max-w-lg text-lg leading-relaxed text-mist/75">{t("about.text")}</p>
        </div>
        <ul className="self-end">
          {facts.map((k, i) => (
            <motion.li
              key={k}
              initial={{ opacity: 0, transform: "translateY(12px)" }}
              whileInView={{ opacity: 1, transform: "translateY(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE_OUT }}
              className="border-t border-mist/15 py-6 font-display text-xl leading-snug tracking-tight last:border-b sm:text-2xl"
            >
              {t(k)}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   7. ПРОЕКТЫ — раскрытие изображений через clip-path
   ═══════════════════════════════════════════════════ */
export function ProjectsGrid() {
  const { t } = useI18n();
  const list = PROJECTS;
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-10 lg:py-32">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <h2 className="display max-w-2xl text-[2.6rem] sm:text-6xl lg:text-7xl">{t("gal.title")}</h2>
        <Link href="/projects" className="inline-flex items-center gap-2 font-semibold text-brand-600 hover:underline">{t("home.proj.all")} <ArrowRight size={16} /></Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
        {list.map((pr, i) => (
          <Link key={pr.id} href="/projects" className={`group block ${i === 0 ? "col-span-2" : i === list.length - 1 ? "col-span-2 lg:col-span-1" : ""}`}>
            <motion.div
              initial={{ clipPath: "inset(18% 0 0 0)", opacity: 0 }}
              whileInView={{ clipPath: "inset(0% 0 0 0)", opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: (i % 3) * 0.06, ease: EASE_OUT }}
              className={`relative overflow-hidden rounded-2xl ${i === 0 ? "aspect-[16/10] lg:aspect-auto lg:h-[calc(100%-2.25rem)]" : i === list.length - 1 ? "aspect-[16/10] lg:aspect-[4/3]" : "aspect-[4/3]"}`}
            >
              <div className="hover-zoom absolute inset-0">
                <Photo src={PHOTOS.projects[pr.kind]} alt={t(pr.key)} sizes="(min-width:1024px) 33vw, 50vw"><Scene kind={pr.kind} /></Photo>
              </div>
            </motion.div>
            <p className="mt-3 text-sm font-semibold sm:text-base">{t(pr.key)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   8. ЗАЯВКА
   ═══════════════════════════════════════════════════ */
export function LeadSection() {
  const { t } = useI18n();
  return (
    <section id="request" className="bg-brand-600 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-10 lg:grid-cols-2 lg:py-32">
        <div>
          <h2 className="display text-[3rem] sm:text-7xl lg:text-[6rem]">{t("lead.title")}</h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/80">{t("lead.sub")}</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 text-fg shadow-lift sm:p-9">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}

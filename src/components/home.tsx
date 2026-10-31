"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Armchair, ArrowRight, ArrowUpRight, Building2, DoorClosed, Factory, Heart, Phone, Send, Sofa, Sparkles, Trophy, Wrench } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Furniture, ProductArt, RoomScene, Scene } from "./art";
import { Photo } from "./photo";
import { LeadForm, ProductCard, SectionHead, useLead } from "./site";
import { useI18n } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { CATEGORIES } from "@/lib/products";
import { PROJECTS } from "@/lib/projects";
import { useStore } from "@/lib/store";
import type { ArtKind, CategoryId, L } from "@/lib/types";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Появление секции один раз: короткий подъём + проявление (только transform/opacity). */
function In({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, transform: "translateY(14px)" }}
      whileInView={{ opacity: 1, transform: "translateY(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35, delay, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function DiningIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 10h10M12 10v8M9 18h6M3 8v10M3 13h3v5M21 8v10M21 13h-3v5" />
    </svg>
  );
}

/* ═══ 1. Хайлайты — как в их Instagram-профиле ═══ */
export function Highlights() {
  const { t } = useI18n();
  const items: { k: string; href: string; icon: React.ReactNode }[] = [
    { k: "hl.sofas", href: "/catalog?cat=sofas", icon: <Sofa size={26} strokeWidth={1.8} /> },
    { k: "hl.dining", href: "/catalog?cat=dining", icon: <DiningIcon /> },
    { k: "hl.doors", href: "/catalog?cat=doors", icon: <DoorClosed size={26} strokeWidth={1.8} /> },
    { k: "hl.chairs", href: "/catalog?cat=chairs", icon: <Armchair size={26} strokeWidth={1.8} /> },
    { k: "hl.business", href: "/catalog?cat=business", icon: <Building2 size={26} strokeWidth={1.8} /> },
    { k: "hl.about", href: "#about", icon: <Heart size={24} strokeWidth={1.8} /> },
  ];
  return (
    <nav aria-label={t("nav.catalog")} className="no-scrollbar mx-auto flex max-w-7xl gap-4 overflow-x-auto px-4 pb-2 pt-5 sm:justify-center sm:gap-7 sm:px-6">
      {items.map((it, i) => (
        <Link key={it.k} href={it.href} className="press group flex w-[72px] shrink-0 flex-col items-center gap-2 sm:w-20">
          <span className="fade-up grid size-[68px] place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 p-[3px] sm:size-[76px]" style={{ animationDelay: `${i * 45}ms` }}>
            <span className="grid size-full place-items-center rounded-full border-[3px] border-white bg-white text-brand-600 transition-colors group-hover:bg-brand-50">{it.icon}</span>
          </span>
          <span className="text-center text-[12.5px] font-semibold leading-tight">{t(it.k)}</span>
        </Link>
      ))}
    </nav>
  );
}

/* ═══ 2. Промо — как фирменный пост ═══ */
export function HeroPromo() {
  const { t, tl } = useI18n();
  const { products, settings } = useStore();
  const accent = products.find((p) => p.id === "p-chair-green") ?? products[0];
  return (
    <section className="mx-auto max-w-7xl px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="relative overflow-hidden rounded-[28px] bg-brand-700 text-white sm:rounded-[36px]">
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]" preserveAspectRatio="none">
          <defs><pattern id="pp" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M18 2 26 18 18 34 10 18Z" fill="none" stroke="white" strokeWidth="1.2" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#pp)" />
        </svg>
        <div className="relative grid items-center gap-6 p-4 sm:p-10 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:p-14">
          <div>
            <span className="fade-up inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold sm:text-sm"><Trophy size={15} />{t("h3.badge")}</span>
            <h1 className="display mt-4 text-[1.9rem] sm:text-5xl lg:text-[3.6rem]">
              {t("h3.title").replace(/ (от|и|в|с|для|на) /g, " $1\u00a0").split(" ").map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-top"><span className="rise inline-block" style={{ animationDelay: `${40 + i * 35}ms` }}>{w}&nbsp;</span></span>
              ))}
            </h1>
            <p className="fade-up mt-4 max-w-md text-[15px] leading-relaxed text-white/90 sm:text-lg" style={{ animationDelay: "200ms" }}>{t("h3.sub")}</p>
            <div className="fade-up mt-6 flex flex-wrap gap-2.5" style={{ animationDelay: "260ms" }}>
              <Link href="/catalog" className="press inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-6 font-bold text-brand-700 hover:bg-brand-50 sm:h-14">{t("common.viewCatalog")} <ArrowRight size={18} /></Link>
              <a href={`tel:${settings.contacts.phone}`} className="press inline-flex h-12 items-center gap-2 rounded-2xl bg-brand-800/40 px-5 font-bold ring-1 ring-white/30 hover:bg-brand-800/60 sm:h-14"><Phone size={18} />{settings.contacts.phone}</a>
            </div>
          </div>
          <div>
            <div className="unclip relative mx-auto aspect-[16/10] max-w-[560px] sm:aspect-[4/3.4] overflow-hidden rounded-[22px] bg-white p-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,.45)] sm:rotate-[1.5deg]" style={{ animationDelay: "120ms" }}>
              <div className="relative h-full w-full overflow-hidden rounded-[16px]">
                <div className="absolute inset-0">
                  <Photo src={PHOTOS.hero} alt={t("h3.title")} priority><RoomScene className="h-full w-full" /></Photo>
                </div>
              </div>
              <Link href={`/catalog/${accent.id}`} className="fade-up absolute bottom-4 left-4 flex items-center gap-2.5 rounded-2xl bg-white/95 p-1.5 pr-4 shadow-lift backdrop-blur" style={{ animationDelay: "380ms" }}>
                <span className="relative size-11 overflow-hidden rounded-xl"><Photo src={PHOTOS.heroSmall} alt="" sizes="44px"><ProductArt product={accent} /></Photo></span>
                <span className="text-[13px] font-bold leading-tight text-fg">{tl(accent.name)}<span className="block text-[11px] font-semibold text-brand-600">{t("common.learnPrice")} →</span></span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ 3. Популярные модели с быстрыми фильтрами ═══ */
export function Popular() {
  const { t, tl } = useI18n();
  const { products } = useStore();
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const list = products.filter((p) => cat === "all" || p.category === cat).sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 8);
  return (
    <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16">
      <SectionHead title={t("home.feat.title")} action={<Link href="/catalog" className="inline-flex min-h-11 items-center gap-1.5 font-bold text-brand-700 hover:underline">{t("col.all")} <ArrowRight size={16} /></Link>} />
      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist">
        {[{ id: "all" as const, name: { ru: t("common.all"), tg: t("common.all") } }, ...CATEGORIES].map((c) => (
          <button key={c.id} role="tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)} className={`press relative shrink-0 rounded-full px-4 py-3 text-sm font-bold ${cat === c.id ? "text-white" : "bg-white text-fg/75 ring-1 ring-black/5 hover:text-fg"}`}>
            {cat === c.id && <motion.span layoutId="pop-chip" className="absolute inset-0 rounded-full bg-brand-600" transition={{ type: "spring", duration: 0.35, bounce: 0.12 }} />}
            <span className="relative">{tl(c.name)}</span>
          </button>
        ))}
      </div>
      <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((p) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, transform: "scale(0.97)" }} animate={{ opacity: 1, transform: "scale(1)" }} exit={{ opacity: 0, transform: "scale(0.97)", transition: { duration: 0.12 } }} transition={{ duration: 0.25, ease: EASE_OUT }}>
              <ProductCard p={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

/* ═══ 4. Плитки направлений ═══ */
export function CategoryTiles() {
  const { t, tl } = useI18n();
  const { products } = useStore();
  return (
    <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20">
      <SectionHead title={t("cats.title")} />
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {CATEGORIES.map((c, i) => {
          const n = products.filter((p) => p.category === c.id).length;
          const rep = products.find((p) => p.category === c.id) ?? products[0];
          return (
            <In key={c.id} delay={(i % 3) * 0.05} className={i === 0 ? "col-span-2 lg:col-span-1 lg:row-span-2" : ""}>
              <Link href={`/catalog?cat=${c.id}`} className={`group relative block h-full overflow-hidden rounded-[22px] bg-brand-600 ${i === 0 ? "aspect-[16/10] lg:aspect-auto lg:min-h-full" : "aspect-square sm:aspect-[4/3.4]"}`}>
                <div className="hover-zoom absolute inset-0"><Photo src={PHOTOS.categories[c.id]} alt={tl(c.name)} sizes="(min-width:1024px) 33vw, 50vw"><ProductArt product={rep} variant="green" /></Photo></div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-800/90 via-brand-800/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 text-white sm:p-5">
                  <div>
                    <h3 className="display text-lg uppercase leading-tight sm:text-2xl">{tl(c.name)}</h3>
                    <p className="mt-1 hidden text-sm text-white/90 sm:block">{tl(c.blurb)}</p>
                    <p className="mt-1 text-xs font-semibold text-white/90">{t("idx.models", { n })}</p>
                  </div>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-brand-700 sm:size-11"><ArrowUpRight size={18} /></span>
                </div>
              </Link>
            </In>
          );
        })}
      </div>
    </section>
  );
}

/* ═══ 5. Почему выбирают нас — зелёный блок с белыми карточками ═══ */
export function Why() {
  const { t } = useI18n();
  const items = [
    { icon: Factory, k: "home.why1" },
    { icon: Sparkles, k: "home.why2" },
    { icon: Wrench, k: "home.why3" },
    { icon: Building2, k: "home.why4" },
  ];
  return (
    <section id="about" className="mt-14 bg-brand-700 py-14 text-white sm:mt-20 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr] lg:items-end">
          <div>
            <p className="display text-[5.5rem] leading-none sm:text-[7rem]">30<span className="ml-2 align-baseline text-2xl sm:text-3xl">{t("tl.years")}</span></p>
            <h2 className="display mt-2 text-[1.75rem] sm:text-4xl">{t("why2.title")}</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/90">{t("about.text")}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {items.map((it, i) => (
              <In key={it.k} delay={i * 0.05}>
                <div className="h-full rounded-[22px] bg-white p-4 text-fg sm:p-6">
                  <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-600"><it.icon size={22} /></span>
                  <h3 className="mt-4 text-[15px] font-extrabold leading-snug sm:text-lg">{t(`${it.k}.t`)}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted sm:text-sm">{t(`${it.k}.d`)}</p>
                </div>
              </In>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ 6. Решения для бизнеса ═══ */
export function Business() {
  const { t } = useI18n();
  const list = PROJECTS.filter((p) => p.type === "business");
  return (
    <section className="pt-14 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead title={t("biz.title")} sub={t("biz.sub")} action={<Link href="/projects" className="inline-flex min-h-11 items-center gap-1.5 font-bold text-brand-700 hover:underline">{t("home.proj.all")} <ArrowRight size={16} /></Link>} />
      </div>
      <div className="no-scrollbar mx-auto flex max-w-7xl snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 sm:gap-5 sm:scroll-px-6 sm:px-6 lg:grid lg:grid-cols-5 lg:overflow-visible">
        {list.map((p) => (
          <Link key={p.id} href="/projects" className="group relative aspect-[4/5] w-[68vw] shrink-0 snap-start overflow-hidden rounded-[22px] bg-brand-700 sm:w-[300px] lg:w-auto">
            <div className="hover-zoom absolute inset-0"><Photo src={PHOTOS.projects[p.kind]} alt={t(p.key)} sizes="300px"><Scene kind={p.kind} /></Photo></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <p className="absolute inset-x-4 bottom-4 text-lg font-extrabold leading-tight text-white">{t(p.key)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ═══ 7. Примерочная цвета ═══ */
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
    <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20">
      <div className="grid items-center gap-6 overflow-hidden rounded-[28px] bg-white p-4 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-12">
        <div className="tint relative aspect-[4/3.2] rounded-[22px] transition-[background-color]" style={{ backgroundColor: `${color.hex}33`, transitionDuration: "250ms" }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.svg key={model.art} viewBox="0 0 400 300" className="h-full w-full" role="img" aria-label={product ? tl(product.name) : ""}
              initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.12 } }} transition={{ duration: 0.26, ease: EASE_OUT }}>
              <Furniture kind={model.art} tone={color.hex} accent={model.accent} />
            </motion.svg>
          </AnimatePresence>
        </div>
        <div>
          <h2 className="display text-[1.75rem] sm:text-4xl lg:text-5xl">{t("cfg.title")}</h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">{t("cfg.sub")}</p>
          <div className="mt-6 flex flex-wrap gap-2" role="radiogroup" aria-label={t("cfg.model")}>
            {MODELS.map((x, i) => {
              const pr = products.find((p) => p.id === x.id);
              return (
                <button key={x.id} role="radio" aria-checked={m === i} onClick={() => { setM(i); setC(1); }} className={`press relative rounded-full px-4 py-2.5 text-sm font-bold ${m === i ? "text-white" : "bg-brand-50 text-brand-700"}`}>
                  {m === i && <motion.span layoutId="cfg-model" className="absolute inset-0 rounded-full bg-brand-600" transition={{ type: "spring", duration: 0.35, bounce: 0.12 }} />}
                  <span className="relative">{pr ? tl(pr.name) : x.id}</span>
                </button>
              );
            })}
          </div>
          <p className="mb-2 mt-6 text-sm font-semibold text-muted">{t("cfg.color")}: <span className="text-fg">{tl(color.name)}</span></p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("cfg.color")}>
            {model.palette.map((x, i) => (
              <button key={x.hex} role="radio" aria-checked={c === i} aria-label={tl(x.name)} title={tl(x.name)} onClick={() => setC(i)} className="press relative grid size-12 place-items-center">
                {c === i && <motion.span layoutId="cfg-ring" className="absolute inset-0 rounded-full ring-2 ring-brand-600" transition={{ type: "spring", duration: 0.3, bounce: 0.12 }} />}
                <span className="size-9 rounded-full ring-1 ring-black/10" style={{ background: x.hex }} />
              </button>
            ))}
          </div>
          <button onClick={() => product && lead(product.id, t("cfg.msg", { p: tl(product.name), c: tl(color.name) }))} className="press mt-7 inline-flex h-13 items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 font-bold text-white hover:bg-brand-700">
            {t("cfg.cta")} <ArrowUpRight size={18} />
          </button>
          <p className="mt-3 max-w-sm text-xs text-muted">{t("cfg.note")}</p>
        </div>
      </div>
    </section>
  );
}

/* ═══ 8. Звонок и заявка ═══ */
export function CallSection() {
  const { t } = useI18n();
  const { settings } = useStore();
  return (
    <section id="request" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col justify-between gap-8 rounded-[28px] bg-brand-700 p-6 text-white sm:p-10">
          <div>
            <h2 className="display text-[1.9rem] sm:text-4xl lg:text-5xl">{t("cta2.title")}</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/90">{t("cta2.sub")}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/90">{t("cta2.phone")}</p>
            <a href={`tel:${settings.contacts.phone}`} className="display text-[4.5rem] leading-none sm:text-[6rem]">{settings.contacts.phone}</a>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={`https://t.me/${settings.contacts.telegram}`} target="_blank" rel="noreferrer" className="press inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-brand-700"><Send size={17} />Telegram</a>
              <a href={`https://instagram.com/${settings.contacts.instagram}`} target="_blank" rel="noreferrer" className="press inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-bold ring-1 ring-white/35">Instagram</a>
            </div>
          </div>
        </div>
        <div className="rounded-[28px] bg-white p-5 sm:p-9">
          <h3 className="display mb-5 text-2xl">{t("form.title")}</h3>
          <LeadForm />
        </div>
      </div>
    </section>
  );
}

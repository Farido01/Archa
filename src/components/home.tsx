"use client";

import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Furniture, ProductArt, RoomScene, Scene } from "./art";
import { Magnetic } from "./motion";
import { LeadForm, useLead } from "./site";
import { useI18n } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/products";
import { PROJECTS } from "@/lib/projects";
import { useStore } from "@/lib/store";
import type { ArtKind, L, Product } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;
const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

/* ═══════════════════════════════════════════════════
   1. ДВЕРЬ — открывается прокруткой, за ней комната
   ═══════════════════════════════════════════════════ */
function DoorLeaf({ shade }: { shade: MotionValue<number> }) {
  return (
    <div className="absolute inset-0 bg-[#f1ede4]" style={{ boxShadow: "inset -10px 0 18px -10px rgba(0,0,0,.18), inset 4px 0 0 rgba(255,255,255,.6)" }}>
      <div className="absolute inset-x-[13%] top-[6%] h-[40%] rounded-t-[999px] border-[3px] border-[#ddd6c6] bg-gradient-to-br from-[#dfe8e1] to-[#cbd8cf]">
        <div className="absolute inset-0 rounded-t-[999px] bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,.55)_45%,transparent_55%)]" />
      </div>
      <div className="absolute inset-x-[13%] bottom-[6%] h-[40%] rounded-[3px] border-[3px] border-[#ddd6c6]" />
      <div className="absolute right-[7%] top-[52%] flex -translate-y-1/2 items-center">
        <span className="h-[7px] w-7 rounded-full bg-gradient-to-b from-[#e3c27e] to-[#a8823f] shadow-[0_2px_3px_rgba(0,0,0,.25)]" />
        <span className="-ml-1.5 size-3 rounded-full bg-[#c9a15b]" />
      </div>
      <motion.div className="absolute inset-0 bg-[#2b2016]" style={{ opacity: shade }} />
    </div>
  );
}

function HeroOutro({ style }: { style?: React.ComponentProps<typeof motion.div>["style"] }) {
  const { t } = useI18n();
  const lead = useLead();
  return (
    <motion.div style={style} className="absolute inset-0 flex items-end bg-gradient-to-t from-juniper via-juniper/55 to-transparent pb-16 sm:items-center sm:bg-gradient-to-r sm:from-juniper/90 sm:via-juniper/45 sm:pb-0">
      <div className="w-full px-6 sm:px-12 lg:px-20">
        <p className="display max-w-[14ch] text-[2.6rem] text-mist sm:text-6xl lg:text-[5.4rem]">{t("door.outro")}</p>
        <p className="mt-5 max-w-md text-lg text-mist/80 sm:text-xl">{t("door.outroSub")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Magnetic><Link href="/catalog" className="inline-flex h-14 items-center gap-2 rounded-full bg-mist px-7 font-semibold text-juniper transition hover:bg-white">{t("common.viewCatalog")} <ArrowRight size={18} /></Link></Magnetic>
          <Magnetic><button onClick={() => lead()} className="inline-flex h-14 items-center rounded-full px-7 font-semibold text-mist ring-1 ring-mist/40 transition hover:bg-mist/10">{t("common.request")}</button></Magnetic>
        </div>
      </div>
    </motion.div>
  );
}

export function DoorHero() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const leaf = useTransform(p, [0.04, 0.42], [0, 104]);
  const shade = useTransform(p, [0.04, 0.42], [0, 0.5]);
  const spill = useTransform(p, [0.05, 0.4], [0, 1]);
  const zoom = useTransform(p, [0.36, 0.8], [1, 9]);
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  // на десктопе дверь стоит справа — при «входе» плавно смещаем её к центру экрана
  const shiftX = useTransform(p, [0.3, 0.62], ["0vw", wide ? "-16vw" : "0vw"]);
  const titleO = useTransform(p, [0, 0.2], [1, 0]);
  const titleY = useTransform(p, [0, 0.3], [0, -140]);
  const hintO = useTransform(p, [0, 0.05], [1, 0]);
  const roomO = useTransform(p, [0.64, 0.8], [0, 1]);
  const outroO = useTransform(p, [0.8, 0.92], [0, 1]);
  const outroY = useTransform(p, [0.8, 0.95], [50, 0]);
  const outroPE = useTransform(outroO, (v) => (v > 0.6 ? "auto" : "none"));

  const words = t("door.title").split(" ");

  if (reduce)
    return (
      <section className="relative h-svh overflow-hidden">
        <RoomScene className="absolute inset-0 h-full w-full" />
        <HeroOutro />
      </section>
    );

  return (
    <section ref={ref} className="relative h-[340svh]">
      <div className="sticky top-0 h-svh overflow-hidden bg-mist">
        {/* стена */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[10svh] h-[10px] bg-[#f4f6f2] shadow-[0_-1px_0_rgba(0,0,0,.05)]" />
        {/* пол */}
        <div className="absolute inset-x-0 bottom-0 h-[10svh] bg-gradient-to-b from-[#c9a982] to-[#a98660]" />
        <motion.div style={{ opacity: spill }} className="pointer-events-none absolute bottom-0 left-1/2 h-[10svh] w-[60svh] -translate-x-1/2 bg-gradient-to-b from-[#fff2cf] to-transparent [clip-path:polygon(32%_0,68%_0,100%_100%,0_100%)] lg:left-[66%]" />

        {/* заголовок */}
        <motion.h1 style={{ opacity: titleO, y: titleY }} className="display absolute left-5 right-5 top-[13svh] text-[13.5vw] text-juniper sm:left-12 sm:text-[9vw] lg:top-1/2 lg:w-[52%] lg:-translate-y-1/2 lg:text-[6.6vw]">
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-top">
              <motion.span initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.9, ease: EASE }} className="inline-block">
                {w}&nbsp;
              </motion.span>
            </span>
          ))}
        </motion.h1>

        {/* дверь */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 1.1, ease: EASE }}
          className="absolute bottom-[10svh] left-1/2 -translate-x-1/2 lg:left-[66%]"
        >
          <motion.div style={{ scale: zoom, x: shiftX }} className="origin-[50%_52%] rounded-t-[6px] bg-gradient-to-b from-[#8a5a36] to-[#6f4628] p-[1.6svh] pb-0 shadow-[0_30px_60px_-30px_rgba(15,58,40,.6)]">
            <div className="relative h-[46svh] w-[21svh] overflow-hidden bg-[#3b2a1d] lg:h-[66svh] lg:w-[30svh]" style={{ perspective: "1200px" }}>
              <RoomScene className="absolute inset-0 h-full w-full" />
              <motion.div style={{ rotateY: leaf, transformOrigin: "left center" }} className="absolute inset-0 will-change-transform">
                <DoorLeaf shade={shade} />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* подсказка */}
        <motion.div style={{ opacity: hintO }} className="absolute bottom-[3svh] left-1/2 flex -translate-x-1/2 whitespace-nowrap sm:bottom-[12.5svh] sm:left-12 sm:translate-x-0 items-center gap-3 text-sm font-medium text-juniper/70 sm:left-12">
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}><ArrowDown size={18} /></motion.span>
          {t("door.hint")}
        </motion.div>
        <motion.button style={{ opacity: hintO }} onClick={() => document.getElementById("after-door")?.scrollIntoView({ behavior: "smooth" })} className="absolute bottom-[12.5svh] right-5 hidden text-sm font-semibold text-juniper/60 underline-offset-4 hover:text-juniper hover:underline sm:right-12 sm:block">
          {t("door.skip")}
        </motion.button>

        {/* комната целиком + текст */}
        <motion.div style={{ opacity: roomO }} className="pointer-events-none absolute inset-0">
          <RoomScene className="h-full w-full" />
        </motion.div>
        <HeroOutro style={{ opacity: outroO, y: outroY, pointerEvents: outroPE }} />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   2. УКАЗАТЕЛЬ НАПРАВЛЕНИЙ — превью следует за курсором
   ═══════════════════════════════════════════════════ */
export function CategoryIndex() {
  const { t, tl } = useI18n();
  const { products } = useStore();
  const [hover, setHover] = useState<number | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 22 });
  const y = useSpring(my, { stiffness: 180, damping: 22 });
  const rotate = useSpring(useTransform(mx, (v) => Math.max(-8, Math.min(8, v / 90))), { stiffness: 120, damping: 20 });
  const ref = useRef<HTMLDivElement>(null);
  const reps = CATEGORIES.map((c) => products.find((p) => p.category === c.id) ?? products[0]);

  return (
    <section id="after-door" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-10 lg:py-36">
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
              <div className="arch-sm size-16 shrink-0 overflow-hidden sm:hidden"><ProductArt product={reps[i]} variant="green" /></div>
              <div className="min-w-0 flex-1 lg:flex lg:items-baseline lg:justify-between lg:gap-10">
                <h3 className={`display text-[1.9rem] transition-all duration-500 sm:text-5xl lg:text-[4.2rem] ${hover === i ? "translate-x-4 text-brand-600 [font-variation-settings:'SHRP'_100]" : hover !== null ? "text-fg/30" : ""}`}>{tl(c.name)}</h3>
                <div className="mt-1.5 lg:mt-0 lg:max-w-xs lg:text-right">
                  <p className="text-sm text-muted sm:text-base">{tl(c.blurb)}</p>
                  <p className="mt-0.5 text-xs text-muted/80">{t("idx.models", { n })}</p>
                </div>
              </div>
              <ArrowUpRight className={`shrink-0 transition duration-500 ${hover === i ? "rotate-45 text-brand-600" : "text-fg/30"}`} size={28} />
            </Link>
          );
        })}

        <motion.div
          aria-hidden
          style={{ x, y, rotate }}
          className="pointer-events-none absolute left-0 top-0 z-10 hidden lg:block"
        >
          <AnimatePresence>
            {hover !== null && (
              <motion.div
                key={hover}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="arch absolute -left-[130px] -top-[200px] h-[340px] w-[260px] overflow-hidden shadow-lift"
              >
                <ProductArt product={reps[hover]} variant="green" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   3. КОЛЛЕКЦИЯ — вертикальная прокрутка двигает ленту
   ═══════════════════════════════════════════════════ */
function RailCard({ p, i }: { p: Product; i: number }) {
  const { t, tl } = useI18n();
  const lead = useLead();
  return (
    <article className="group w-[76vw] shrink-0 snap-start sm:w-[46vw] lg:w-[min(30vw,440px)]">
      <Link href={`/catalog/${p.id}`} className="arch block aspect-[4/5] overflow-hidden">
        <div className="h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]">
          <ProductArt product={p} variant={i % 3 === 1 ? "green" : "cream"} />
        </div>
      </Link>
      <div className="flex flex-col items-start gap-3 pt-5 xl:flex-row xl:justify-between">
        <Link href={`/catalog/${p.id}`}><h3 className="font-display text-xl font-semibold leading-tight tracking-tight sm:text-2xl">{tl(p.name)}</h3></Link>
        <button onClick={() => lead(p.id)} className="shrink-0 rounded-full border border-fg/15 px-3.5 py-1.5 text-sm font-semibold transition hover:border-brand-600 hover:bg-brand-600 hover:text-white">{t("common.learnPrice")}</button>
      </div>
    </article>
  );
}

export function CollectionRail() {
  const { t } = useI18n();
  const { products } = useStore();
  const list = [...products].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 8);
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const [desktop, setDesktop] = useState(false);
  const reduce = useReducedMotion();

  useIsoLayout(() => {
    const measure = () => {
      const d = window.innerWidth >= 1024 && !reduce;
      setDesktop(d);
      if (track.current) setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [list.length, reduce]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const inner = (
    <div ref={track} className={`flex gap-5 px-5 sm:gap-8 sm:px-10 ${desktop ? "" : "no-scrollbar snap-x snap-mandatory scroll-px-5 overflow-x-auto pb-4 sm:scroll-px-10"}`}>
      <div className="flex w-[72vw] shrink-0 flex-col justify-end sm:w-[40vw] lg:w-[min(32vw,480px)]">
        <h2 className="display text-[2.6rem] sm:text-6xl lg:text-7xl">{t("col.title")}</h2>
        <Link href="/catalog" className="mt-6 inline-flex items-center gap-2 font-semibold text-brand-600 hover:underline">{t("col.all")} <ArrowRight size={16} /></Link>
      </div>
      {list.map((p, i) => <RailCard key={p.id} p={p} i={i} />)}
    </div>
  );

  if (!desktop) return <section className="py-16">{inner}</section>;

  return (
    <section ref={section} style={{ height: `calc(100svh + ${dist}px)` }} className="relative">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <motion.div style={{ x }}>{inner}</motion.div>
        <div className="mx-10 mt-10 h-[2px] overflow-hidden rounded bg-fg/10"><motion.div style={{ width: bar }} className="h-full bg-brand-600" /></div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   4. ПРИМЕРОЧНАЯ ЦВЕТА — отвечает на выбор пользователя
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
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-10 lg:py-36">
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div className="relative">
          <motion.div animate={{ backgroundColor: color.hex }} transition={{ duration: 0.7 }} className="arch absolute inset-x-[6%] bottom-0 top-[4%] opacity-25" />
          <div className="tint relative aspect-[4/3.3]">
            <AnimatePresence mode="wait">
              <motion.svg key={model.art} viewBox="0 0 400 300" className="h-full w-full" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.45, ease: EASE }} aria-label={product ? tl(product.name) : ""} role="img">
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
                <button key={x.id} role="radio" aria-checked={m === i} onClick={() => { setM(i); setC(1); }} className={`relative rounded-full px-5 py-2.5 text-sm font-semibold transition ${m === i ? "text-white" : "bg-surface text-fg hover:bg-surface-2"}`}>
                  {m === i && <motion.span layoutId="cfg-model" className="absolute inset-0 -z-0 rounded-full bg-juniper" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                  <span className="relative">{pr ? tl(pr.name) : x.id}</span>
                </button>
              );
            })}
          </div>

          <p className="mb-3 mt-8 text-sm font-semibold text-muted">{t("cfg.color")}: <span className="text-fg">{tl(color.name)}</span></p>
          <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={t("cfg.color")}>
            {model.palette.map((x, i) => (
              <button key={x.hex} role="radio" aria-checked={c === i} aria-label={tl(x.name)} title={tl(x.name)} onClick={() => setC(i)} className="relative grid size-12 place-items-center">
                {c === i && <motion.span layoutId="cfg-ring" className="absolute inset-0 rounded-full ring-2 ring-juniper" transition={{ type: "spring", stiffness: 500, damping: 34 }} />}
                <span className="size-9 rounded-full ring-1 ring-black/10 transition-transform hover:scale-110" style={{ background: x.hex }} />
              </button>
            ))}
          </div>

          <div className="mt-10">
            <Magnetic>
              <button
                onClick={() => product && lead(product.id, t("cfg.msg", { p: tl(product.name), c: tl(color.name) }))}
                className="inline-flex h-14 items-center gap-2 rounded-full bg-brand-600 px-7 font-semibold text-white transition hover:bg-brand-700"
              >
                {t("cfg.cta")} <ArrowUpRight size={18} />
              </button>
            </Magnetic>
          </div>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted">{t("cfg.note")}</p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   5. 30 ЛЕТ — счётчик лет привязан к прокрутке
   ═══════════════════════════════════════════════════ */
export function YearsSection() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const years = useTransform(p, [0.02, 0.28], [0, 30]);
  const [n, setN] = useState(0);
  useMotionValueEvent(years, "change", (v) => setN(Math.round(v)));
  const facts = ["tl.f1", "tl.f2", "tl.f3", "tl.f4", "tl.f5"];
  const [active, setActive] = useState(0);
  useMotionValueEvent(p, "change", (v) => setActive(Math.min(facts.length - 1, Math.max(0, Math.floor(((v - 0.3) / 0.6) * facts.length)))));

  return (
    <section ref={ref} className="relative h-[260svh] bg-juniper text-mist">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden px-5 sm:px-10">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <h2 className="text-lg font-semibold text-mist/60">{t("tl.title")}</h2>
            <p className="font-display text-[42vw] font-[800] leading-[0.8] tracking-[-0.03em] text-brand-500 tabular-nums sm:text-[30vw] lg:text-[17rem]" aria-label="30">
              {n}
            </p>
            <p className="font-display text-3xl font-semibold text-mist/80">{t("tl.years")}</p>
          </div>
          <ol className="space-y-4 sm:space-y-6">
            {facts.map((k, i) => (
              <li key={k} className="flex gap-4">
                <span className={`mt-3 h-[2px] w-10 shrink-0 origin-left rounded bg-brand-400 transition-all duration-500 ${i <= active ? "scale-x-100" : "scale-x-25 opacity-30"}`} />
                <p className={`font-display text-xl leading-snug tracking-tight transition-all duration-500 sm:text-3xl ${i === active ? "text-mist" : i < active ? "text-mist/45" : "text-mist/20"}`}>{t(k)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   6. ГАЛЕРЕЯ — колонки движутся с разной скоростью
   ═══════════════════════════════════════════════════ */
export function ParallaxGallery() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(p, [0, 1], [80, -120]);
  const y2 = useTransform(p, [0, 1], [-60, 140]);
  const cols = [PROJECTS.filter((_, i) => i % 2 === 0), PROJECTS.filter((_, i) => i % 2 === 1)];

  return (
    <section ref={ref} className="mx-auto max-w-7xl overflow-hidden px-5 py-24 sm:px-10 lg:py-36">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <h2 className="display max-w-2xl text-[2.6rem] sm:text-6xl lg:text-7xl">{t("gal.title")}</h2>
        <Link href="/projects" className="inline-flex items-center gap-2 font-semibold text-brand-600 hover:underline">{t("home.proj.all")} <ArrowRight size={16} /></Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-8">
        {cols.map((col, ci) => (
          <motion.div key={ci} style={{ y: ci === 0 ? y1 : y2 }} className={`space-y-3 sm:space-y-8 ${ci === 1 ? "pt-16" : ""}`}>
            {col.map((pr, i) => (
              <Link key={pr.id} href="/projects" className="group block">
                <div className={`overflow-hidden ${(i + ci) % 2 === 0 ? "arch aspect-[3/4]" : "aspect-[4/3] rounded-lg"}`}>
                  <div className="h-full w-full transition-transform duration-[900ms] group-hover:scale-105"><Scene kind={pr.kind} /></div>
                </div>
                <p className="mt-3 text-sm font-semibold sm:text-base">{t(pr.key)}</p>
              </Link>
            ))}
          </motion.div>
        ))}
      </div>
      <p className="mt-8 text-xs text-muted">{t("demo.photoNote")}</p>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   7. ЗАЯВКА
   ═══════════════════════════════════════════════════ */
export function LeadSection() {
  const { t } = useI18n();
  return (
    <section className="grain relative overflow-hidden bg-brand-600 text-white">
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-10 lg:grid-cols-[1fr_1fr] lg:py-32">
        <div>
          <h2 className="display text-[3rem] sm:text-7xl lg:text-[6.5rem]">{t("lead.title")}</h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/80">{t("lead.sub")}</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 text-fg shadow-lift sm:p-9">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}

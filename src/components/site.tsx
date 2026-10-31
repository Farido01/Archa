"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { ArrowUp, ArrowUpRight, Check, Mail, Phone, Send } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ProductArt } from "./art";
import { Magnetic } from "./motion";
import { Button, Field, Input, Instagram, LangSwitch, Logo, Modal, Select, Textarea } from "./ui";
import { useI18n } from "@/lib/i18n";
import { catName } from "@/lib/products";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";

/* ── Lead modal context ───────────────────────────── */
type LeadFn = (productId?: string, message?: string) => void;
const LeadCtx = createContext<LeadFn>(() => {});
export const useLead = () => useContext(LeadCtx);

export function LeadProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [state, setState] = useState<{ open: boolean; productId?: string; message?: string; k: number }>({ open: false, k: 0 });
  return (
    <LeadCtx.Provider value={(productId, message) => setState((s) => ({ open: true, productId, message, k: s.k + 1 }))}>
      {children}
      <Modal open={state.open} onClose={() => setState((s) => ({ ...s, open: false }))} title={t("form.title")}>
        <LeadForm key={state.k} productId={state.productId} message={state.message} />
      </Modal>
    </LeadCtx.Provider>
  );
}

/* ── Lead form ────────────────────────────────────── */
export function LeadForm({ productId, message, dark = false }: { productId?: string; message?: string; dark?: boolean }) {
  const { t, tl } = useI18n();
  const { products, submitLead } = useStore();
  const empty = { name: "", phone: "", productId: productId ?? "", message: message ?? "" };
  const [f, setF] = useState(empty);
  const [err, setErr] = useState(false);
  const [sent, setSent] = useState<{ num: string; name: string } | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || f.phone.replace(/\D/g, "").length < 4) return setErr(true);
    const o = submitLead({ name: f.name, phone: f.phone, productId: f.productId || undefined, message: f.message });
    setSent({ num: o.num, name: f.name.trim().split(" ")[0] });
  };

  if (sent)
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-6 text-center">
        <motion.div initial={{ scale: 0.4, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 14 }} className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-brand-500 text-white">
          <Check size={30} strokeWidth={2.5} />
        </motion.div>
        <h3 className="font-display text-2xl font-semibold tracking-tight">{t("form.successTitle")}: {sent.num}</h3>
        <p className={`mx-auto mt-2 max-w-sm text-[15px] leading-relaxed ${dark ? "text-mist/70" : "text-muted"}`}>{t("form.successText", { name: sent.name })}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/admin/orders"><Button>{t("form.openAdmin")} <ArrowUpRight size={16} /></Button></Link>
          <Button variant="outline" onClick={() => { setSent(null); setF(empty); }}>{t("form.another")}</Button>
        </div>
      </motion.div>
    );

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`${t("form.name")} *`}>
          <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" aria-invalid={err && !f.name.trim()} />
        </Field>
        <Field label={`${t("form.phone")} *`}>
          <Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} inputMode="tel" autoComplete="tel" placeholder="+992" aria-invalid={err && f.phone.length < 4} />
        </Field>
      </div>
      <Field label={t("form.product")}>
        <Select value={f.productId} onChange={(e) => setF({ ...f, productId: e.target.value })}>
          <option value="">{t("form.productAny")}</option>
          {products.map((p) => <option key={p.id} value={p.id}>{tl(p.name)}</option>)}
        </Select>
      </Field>
      <Field label={t("form.message")}>
        <Textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
      </Field>
      {err && <p className="text-sm font-medium text-red-500">{t("common.required")}</p>}
      <Button type="submit" size="lg" className="w-full">{t("form.submit")} <Send size={16} /></Button>
    </form>
  );
}

/* ── Header + full-screen menu ────────────────────── */
const NAV = [
  { href: "/", k: "nav.home" },
  { href: "/catalog", k: "nav.catalog" },
  { href: "/projects", k: "nav.projects" },
  { href: "/contacts", k: "nav.contacts" },
];

export function SiteHeader() {
  const { t } = useI18n();
  const path = usePathname();
  const lead = useLead();
  const { settings } = useStore();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(v > 240 && v > prev && !open);
  });
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <motion.header animate={{ y: hidden ? -110 : 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="fixed inset-x-0 top-0 z-[80] flex items-center justify-between px-3 pt-3 sm:px-6 sm:pt-5">
        <Link href="/" aria-label="Арча" className={`rounded-full px-3 py-1.5 backdrop-blur-md transition-colors ${open ? "bg-white/10" : "bg-mist/70 ring-1 ring-black/5"}`}>
          <Logo tone={open ? "white" : "green"} className="h-9 w-[78px]" />
        </Link>
        <div className={`flex items-center gap-1.5 rounded-full p-1.5 backdrop-blur-md transition-colors ${open ? "bg-white/10" : "bg-mist/70 ring-1 ring-black/5"}`}>
          <LangSwitch dark={open} />
          <button onClick={() => lead()} className="hidden rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 sm:block">{t("common.request")}</button>
          <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label={t("menu.open")} className={`relative grid size-10 place-items-center rounded-full transition ${open ? "bg-mist text-juniper" : "bg-juniper text-mist"}`}>
            <motion.span animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -3.5 }} className="absolute h-[2px] w-4 rounded bg-current" />
            <motion.span animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 3.5 }} className="absolute h-[2px] w-4 rounded bg-current" />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            data-lenis-prevent
            initial={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 44px) 44px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[70] overflow-y-auto bg-juniper text-mist"
          >
            <div className="mx-auto flex min-h-full max-w-7xl flex-col px-6 pb-10 pt-28 sm:px-10">
              <nav className="flex-1">
                {[...NAV, { href: "/admin", k: "nav.admin" }].map((n, i) => {
                  const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
                  return (
                    <motion.div key={n.href} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden border-b border-mist/10">
                      <Link href={n.href} onClick={() => setOpen(false)} className="group flex items-baseline justify-between gap-4 py-3 sm:py-4">
                        <span className={`display text-[13vw] transition-all duration-500 group-hover:translate-x-3 group-hover:[font-variation-settings:'SHRP'_100] sm:text-[6.5vw] lg:text-[5.2rem] ${active ? "text-brand-300" : ""}`}>{t(n.k)}</span>
                        <ArrowUpRight className="shrink-0 text-mist/30 transition group-hover:rotate-45 group-hover:text-brand-300" size={36} />
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-10 grid gap-6 text-sm text-mist/70 sm:grid-cols-3">
                <a href={`tel:${settings.contacts.phone}`} className="flex items-center gap-2 hover:text-mist"><Phone size={16} />{settings.contacts.phone}</a>
                <a href={`https://instagram.com/${settings.contacts.instagram}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-mist"><Instagram size={16} />@{settings.contacts.instagram}</a>
                <button onClick={() => { setOpen(false); lead(); }} className="flex items-center gap-2 text-left font-semibold text-brand-300 hover:text-mist sm:justify-end">{t("common.request")} <ArrowUpRight size={16} /></button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <span title={t("demo.site")} className="fixed bottom-3 right-3 z-[60] rounded-full bg-juniper/90 px-3 py-1.5 text-[11px] font-semibold text-mist/80 backdrop-blur">{t("demo.pill")}</span>
    </>
  );
}

/* ── Footer with giant wordmark ───────────────────── */
export function SiteFooter() {
  const { t } = useI18n();
  const { settings } = useStore();
  const c = settings.contacts;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["45%", "0%"]);

  return (
    <footer ref={ref} className="relative overflow-hidden bg-juniper text-mist">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-10 pt-20 sm:px-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <p className="max-w-sm font-display text-2xl leading-snug tracking-tight text-mist/90">{t("footer.about")}</p>
        <ul className="space-y-2.5 text-[15px]">
          {[...NAV, { href: "/admin", k: "nav.admin" }].map((n) => (
            <li key={n.href}><Link href={n.href} className="text-mist/70 transition hover:text-mist">{t(n.k)}</Link></li>
          ))}
        </ul>
        <ul className="space-y-2.5 text-[15px] text-mist/70">
          <li><a href={`tel:${c.phone}`} className="inline-flex items-center gap-2.5 hover:text-mist"><Phone size={15} />{c.phone}</a></li>
          <li><a href={`https://instagram.com/${c.instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2.5 hover:text-mist"><Instagram size={15} />@{c.instagram}</a></li>
          <li><a href={`https://t.me/${c.telegram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2.5 hover:text-mist"><Send size={15} />@{c.telegram}</a></li>
          <li><a href={`mailto:${c.email}`} className="inline-flex items-center gap-2.5 hover:text-mist"><Mail size={15} />{c.email}</a></li>
        </ul>
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
        <motion.p style={{ y }} aria-hidden className="select-none font-display text-[33vw] font-[800] leading-[0.78] tracking-[-0.07em] text-brand-600 lg:text-[27rem]">Арча</motion.p>
      </div>
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-mist/10 bg-juniper px-6 py-5 pr-32 text-xs text-mist/50 sm:px-10 sm:pr-36">
        <span>{t("footer.rights")}</span>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="inline-flex items-center gap-1.5 font-semibold text-mist/80 hover:text-mist"><ArrowUp size={14} />{t("foot.top")}</button>
      </div>
    </footer>
  );
}

/* ── Section head (no eyebrow labels) ─────────────── */
export function SectionHead({ title, sub, action, light = false }: { eyebrow?: string; title: string; sub?: string; action?: React.ReactNode; light?: boolean }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6 sm:mb-14">
      <div className="max-w-3xl">
        <h2 className={`display text-[2.6rem] sm:text-6xl lg:text-7xl ${light ? "text-mist" : ""}`}>{title}</h2>
        {sub && <p className={`mt-5 max-w-xl text-base leading-relaxed sm:text-lg ${light ? "text-mist/70" : "text-muted"}`}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── Product card: arch frame ─────────────────────── */
export function ProductCard({ p }: { p: Product; i?: number }) {
  const { t, tl } = useI18n();
  const lead = useLead();
  return (
    <article className="group flex flex-col">
      <Link href={`/catalog/${p.id}`} className="arch relative block aspect-[3/4] overflow-hidden bg-surface-2">
        <div className="h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]">
          <ProductArt product={p} />
        </div>
      </Link>
      <div className="flex flex-1 flex-col pt-5">
        <Link href={`/catalog/${p.id}`}>
          <h3 className="font-display text-base font-semibold leading-tight tracking-tight transition-colors group-hover:text-brand-600 sm:text-xl">{tl(p.name)}</h3>
        </Link>
        <p className="mt-1 text-sm text-muted">{tl(catName(p.category))}</p>
        <div className="mt-auto pt-4">
          <Magnetic strength={0.2}>
            <button onClick={() => lead(p.id)} className="inline-flex items-center gap-2 rounded-full border border-fg/15 px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm hover:border-brand-600 hover:bg-brand-600 hover:text-white">
              {t("common.learnPrice")}
            </button>
          </Magnetic>
        </div>
      </div>
    </article>
  );
}

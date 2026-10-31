"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, Mail, Menu, Phone, Send, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";
import { ProductArt } from "./art";
import { Button, Field, Input, Instagram, LangSwitch, Logo, Modal, Select, Textarea } from "./ui";
import { useI18n } from "@/lib/i18n";
import { catName } from "@/lib/products";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";

/* ── Lead modal context ───────────────────────────── */
const LeadCtx = createContext<(productId?: string) => void>(() => {});
export const useLead = () => useContext(LeadCtx);

export function LeadProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [state, setState] = useState<{ open: boolean; productId?: string; k: number }>({ open: false, k: 0 });
  return (
    <LeadCtx.Provider value={(productId) => setState((s) => ({ open: true, productId, k: s.k + 1 }))}>
      {children}
      <Modal open={state.open} onClose={() => setState((s) => ({ ...s, open: false }))} title={t("form.title")}>
        <LeadForm key={state.k} productId={state.productId} onDone={() => {}} />
      </Modal>
    </LeadCtx.Provider>
  );
}

/* ── Lead form ────────────────────────────────────── */
export function LeadForm({ productId, onDone }: { productId?: string; onDone?: () => void }) {
  const { t, tl } = useI18n();
  const { products, submitLead } = useStore();
  const [f, setF] = useState({ name: "", phone: "", productId: productId ?? "", message: "" });
  const [err, setErr] = useState(false);
  const [sent, setSent] = useState<{ num: string; name: string } | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || f.phone.replace(/\D/g, "").length < 4) {
      setErr(true);
      return;
    }
    const o = submitLead({ name: f.name, phone: f.phone, productId: f.productId || undefined, message: f.message });
    setSent({ num: o.num, name: f.name.trim().split(" ")[0] });
    onDone?.();
  };

  if (sent)
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-brand-500/12 text-brand-600">
          <Check size={30} strokeWidth={2.5} />
        </div>
        <h3 className="text-xl font-bold tracking-tight">{t("form.successTitle")} · {sent.num}</h3>
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">{t("form.successText", { name: sent.name })}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/admin/orders">
            <Button>{t("form.openAdmin")} <ArrowUpRight size={16} /></Button>
          </Link>
          <Button variant="outline" onClick={() => { setSent(null); setF({ name: "", phone: "", productId: "", message: "" }); }}>
            {t("form.another")}
          </Button>
        </div>
      </motion.div>
    );

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <p className="text-[15px] text-muted">{t("form.sub")}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`${t("form.name")} *`}>
          <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" aria-invalid={err && !f.name.trim()} />
        </Field>
        <Field label={`${t("form.phone")} *`}>
          <Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} inputMode="tel" autoComplete="tel" placeholder="+992 …" aria-invalid={err && f.phone.length < 4} />
        </Field>
      </div>
      <Field label={t("form.product")}>
        <Select value={f.productId} onChange={(e) => setF({ ...f, productId: e.target.value })}>
          <option value="">{t("form.productAny")}</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{tl(p.name)}</option>
          ))}
        </Select>
      </Field>
      <Field label={t("form.message")}>
        <Textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
      </Field>
      {err && <p className="text-sm font-medium text-red-600">{t("common.required")}</p>}
      <Button type="submit" size="lg" className="w-full">
        {t("form.submit")} <Send size={16} />
      </Button>
    </form>
  );
}

/* ── Header ───────────────────────────────────────── */
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
  const [open, setOpen] = useState(false);
  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));

  return (
    <>
      <div className="bg-ink px-4 py-2 text-center text-[11.5px] leading-snug tracking-wide text-white/80 sm:text-xs">
        <span className="mr-2 rounded bg-brand-500 px-1.5 py-0.5 font-bold uppercase text-white">{t("common.demo")}</span>
        {t("demo.site")}
      </div>
      <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-6 px-5 sm:px-8">
          <Link href="/" aria-label="ARCHA" className="shrink-0">
            <Logo className="h-9 w-[78px]" />
          </Link>
          <nav className="mx-auto hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={`relative rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${active(n.href) ? "text-brand-600" : "text-muted hover:text-fg"}`}>
                {t(n.k)}
                {active(n.href) && <motion.span layoutId="nav-dot" className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-brand-600" />}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <LangSwitch />
            <Link href="/admin" className="hidden rounded-full border border-line px-4 py-2 text-sm font-semibold text-fg transition hover:border-brand-500 hover:text-brand-600 lg:block">
              {t("nav.admin")}
            </Link>
            <Button size="sm" className="hidden sm:inline-flex" onClick={() => lead()}>{t("common.request")}</Button>
            <button className="grid size-10 place-items-center rounded-full border border-line md:hidden" onClick={() => setOpen(true)} aria-label={t("nav.menu")}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-brand-900 text-white md:hidden">
            <div className="flex h-[68px] items-center justify-between px-5">
              <Logo tone="white" className="h-9 w-[78px]" />
              <button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full bg-white/10" aria-label={t("common.close")}><X size={20} /></button>
            </div>
            <nav className="px-5 pt-8">
              {[...NAV, { href: "/admin", k: "nav.admin" }].map((n, i) => (
                <motion.div key={n.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link href={n.href} onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-white/10 py-5 text-3xl font-bold tracking-tight">
                    {t(n.k)} <ArrowRight className="text-white/40" />
                  </Link>
                </motion.div>
              ))}
              <Button size="lg" className="mt-8 w-full !bg-white !text-brand-800" onClick={() => { setOpen(false); lead(); }}>{t("common.request")}</Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Footer ───────────────────────────────────────── */
export function SiteFooter() {
  const { t } = useI18n();
  const { settings } = useStore();
  const c = settings.contacts;
  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <Logo tone="white" className="h-12 w-[104px]" />
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/65">{t("footer.about")}</p>
        </div>
        <div>
          <h4 className="eyebrow mb-5 text-white/45">{t("footer.sections")}</h4>
          <ul className="space-y-3 text-[15px]">
            {NAV.map((n) => (
              <li key={n.href}><Link href={n.href} className="text-white/80 transition hover:text-white">{t(n.k)}</Link></li>
            ))}
            <li><Link href="/admin" className="text-white/80 transition hover:text-white">{t("nav.admin")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="eyebrow mb-5 text-white/45">{t("footer.contacts")}</h4>
          <ul className="space-y-3 text-[15px] text-white/80">
            <li><a href={`tel:${c.phone}`} className="inline-flex items-center gap-2.5 hover:text-white"><Phone size={16} className="text-brand-300" />{c.phone}</a></li>
            <li><a href={`https://instagram.com/${c.instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2.5 hover:text-white"><Instagram size={16} className="text-brand-300" />@{c.instagram}</a></li>
            <li><a href={`https://t.me/${c.telegram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2.5 hover:text-white"><Send size={16} className="text-brand-300" />@{c.telegram}</a></li>
            <li><a href={`mailto:${c.email}`} className="inline-flex items-center gap-2.5 hover:text-white"><Mail size={16} className="text-brand-300" />{c.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/45">{t("footer.rights")}</div>
    </footer>
  );
}

/* ── Section head ─────────────────────────────────── */
export function SectionHead({ eyebrow, title, sub, action, light = false }: { eyebrow: string; title: string; sub?: string; action?: React.ReactNode; light?: boolean }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-2xl">
        <p className={`eyebrow mb-3 ${light ? "text-brand-300" : "text-brand-600"}`}>{eyebrow}</p>
        <h2 className={`display text-[2rem] sm:text-5xl ${light ? "text-white" : ""}`}>{title}</h2>
        {sub && <p className={`mt-4 text-base leading-relaxed sm:text-lg ${light ? "text-white/70" : "text-muted"}`}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── Product card ─────────────────────────────────── */
export function ProductCard({ p, i = 0 }: { p: Product; i?: number }) {
  const { t, tl } = useI18n();
  const lead = useLead();
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(i, 5) * 0.06 }}
      className="group flex flex-col"
    >
      <Link href={`/catalog/${p.id}`} className="relative block aspect-[4/3.4] overflow-hidden rounded-3xl">
        <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.05]">
          <ProductArt product={p} />
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-brand-700 backdrop-blur">{tl(catName(p.category))}</span>
        <span className="absolute bottom-3 right-3 grid size-10 translate-y-2 place-items-center rounded-full bg-white text-brand-700 opacity-0 shadow-soft transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={18} />
        </span>
      </Link>
      <div className="flex flex-1 flex-col px-1 pt-4">
        <Link href={`/catalog/${p.id}`}><h3 className="text-[17px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-brand-600">{tl(p.name)}</h3></Link>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{tl(p.desc)}</p>
        <div className="mt-auto flex items-center gap-2 pt-4">
          <Button size="sm" variant="outline" onClick={() => lead(p.id)}>{t("common.learnPrice")}</Button>
          <Link href={`/catalog/${p.id}`} className="px-2 text-sm font-semibold text-brand-600 hover:underline">{t("common.more")}</Link>
        </div>
      </div>
    </motion.article>
  );
}

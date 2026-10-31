"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, ArrowUpRight, Check, Mail, Menu, Phone, Search, Send, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { ProductArt } from "./art";
import { Button, Field, Input, Instagram, LangSwitch, Logo, Modal, Select, Textarea } from "./ui";
import { useI18n } from "@/lib/i18n";
import { catName } from "@/lib/products";
import { PHOTO_CREDITS } from "@/lib/photos";
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
  const { settings } = useStore();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));

  return (
    <header className="sticky top-0 z-[80] border-b border-black/5 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Арча" className="shrink-0"><Logo className="h-9 w-[78px]" /></Link>
        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`rounded-full px-4 py-2 text-[15px] font-semibold transition-colors ${active(n.href) ? "bg-brand-50 text-brand-700" : "text-fg/70 hover:text-fg"}`}>{t(n.k)}</Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/catalog" aria-label={t("common.search")} className="press grid size-10 place-items-center rounded-full text-fg/70 hover:bg-brand-50 hover:text-brand-700"><Search size={20} /></Link>
          <div className="hidden sm:block"><LangSwitch /></div>
          <a href={`tel:${settings.contacts.phone}`} className="press hidden items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 sm:inline-flex"><Phone size={16} />{settings.contacts.phone}</a>
          <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label={t("menu.open")} className="press grid size-10 place-items-center rounded-full bg-brand-50 text-brand-700 md:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, transform: "translateY(-8px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={{ opacity: 0, transform: "translateY(-8px)", transition: { duration: 0.15 } }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="border-t border-black/5 bg-white px-4 pb-5 pt-2 shadow-lift md:hidden"
          >
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={`flex items-center justify-between rounded-2xl px-4 py-4 text-lg font-bold ${active(n.href) ? "bg-brand-50 text-brand-700" : ""}`}>
                {t(n.k)} <ArrowUpRight size={18} className="text-fg/30" />
              </Link>
            ))}
            <div className="mt-3 flex items-center justify-between px-4"><LangSwitch /><a href={`https://instagram.com/${settings.contacts.instagram}`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"><Instagram size={16} />@{settings.contacts.instagram}</a></div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ── Mobile action bar: call / request / telegram under the thumb ── */
export function MobileBar() {
  const { t } = useI18n();
  const { settings } = useStore();
  const lead = useLead();
  return (
    <div className="fixed inset-x-0 bottom-0 z-[75] border-t border-black/5 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-[1fr_1.3fr_auto] gap-2">
        <a href={`tel:${settings.contacts.phone}`} className="press flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-50 font-bold text-brand-700"><Phone size={18} />{settings.contacts.phone}</a>
        <button onClick={() => lead()} className="press h-12 rounded-2xl bg-brand-600 font-bold text-white">{t("common.request")}</button>
        <a href={`https://t.me/${settings.contacts.telegram}`} target="_blank" rel="noreferrer" aria-label="Telegram" className="press grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Send size={19} /></a>
      </div>
    </div>
  );
}

/* ── Footer ───────────────────────────────────────── */
export function SiteFooter() {
  const { t } = useI18n();
  const { settings } = useStore();
  const c = settings.contacts;
  return (
    <footer className="bg-brand-800 pb-24 text-white md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo tone="white" className="h-11 w-[96px]" />
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/70">{t("footer.about")}</p>
        </div>
        <ul className="space-y-2.5 text-[15px]">
          {NAV.map((n) => <li key={n.href}><Link href={n.href} className="text-white/75 hover:text-white">{t(n.k)}</Link></li>)}
        </ul>
        <ul className="space-y-2.5 text-[15px] text-white/75">
          <li><a href={`tel:${c.phone}`} className="inline-flex items-center gap-2.5 text-2xl font-extrabold text-white"><Phone size={20} />{c.phone}</a></li>
          <li><a href={`https://instagram.com/${c.instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2.5 hover:text-white"><Instagram size={15} />@{c.instagram}</a></li>
          <li><a href={`https://t.me/${c.telegram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2.5 hover:text-white"><Send size={15} />@{c.telegram}</a></li>
          <li><a href={`mailto:${c.email}`} className="inline-flex items-center gap-2.5 hover:text-white"><Mail size={15} />{c.email}</a></li>
        </ul>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs text-white/50 sm:px-6">
          <span>{t("footer.rights")}</span>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="inline-flex items-center gap-1.5 font-semibold text-white/80 hover:text-white"><ArrowUp size={14} />{t("foot.top")}</button>
          <span className="w-full leading-relaxed">
            {t("foot.photos")}{" "}
            {PHOTO_CREDITS.map((cr, i) => (
              <span key={cr.username}>
                <a href={`https://unsplash.com/@${cr.username}?utm_source=archa&utm_medium=referral`} target="_blank" rel="noreferrer" className="hover:text-white hover:underline">{cr.name}</a>
                {i < PHOTO_CREDITS.length - 1 ? ", " : ""}
              </span>
            ))}{" "}
            — <a href="https://unsplash.com/?utm_source=archa&utm_medium=referral" target="_blank" rel="noreferrer" className="hover:text-white hover:underline">Unsplash</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ── Section head ─────────────────────────────────── */
export function SectionHead({ title, sub, action, light = false }: { eyebrow?: string; title: string; sub?: string; action?: React.ReactNode; light?: boolean }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
      <div className="max-w-3xl">
        <h2 className={`display text-[1.75rem] sm:text-4xl lg:text-5xl ${light ? "text-white" : ""}`}>{title}</h2>
        {sub && <p className={`mt-3 max-w-xl text-[15px] leading-relaxed sm:text-base ${light ? "text-white/75" : "text-muted"}`}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── Product card: like an ARCHA Instagram post ───── */
export function ProductCard({ p }: { p: Product; i?: number }) {
  const { t, tl } = useI18n();
  const lead = useLead();
  return (
    <article className="group flex flex-col overflow-hidden rounded-[22px] bg-white p-2 shadow-[0_1px_2px_rgba(16,35,26,.06),0_8px_24px_-12px_rgba(16,35,26,.18)]">
      <Link href={`/catalog/${p.id}`} className="relative block aspect-square overflow-hidden rounded-[16px] bg-brand-600">
        <div className="hover-zoom h-full w-full"><ProductArt product={p} variant="green" /></div>
        <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-brand-700">{tl(catName(p.category))}</span>
      </Link>
      <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-3">
        <Link href={`/catalog/${p.id}`}><h3 className="text-[15px] font-bold leading-snug sm:text-base">{tl(p.name)}</h3></Link>
        <div className="mt-auto pt-3">
          <button onClick={() => lead(p.id)} className="press w-full rounded-xl bg-brand-50 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-600 hover:text-white">{t("common.learnPrice")}</button>
        </div>
      </div>
    </article>
  );
}

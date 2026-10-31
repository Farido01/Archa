"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Boxes, ExternalLink, LayoutDashboard, LayoutGrid, Menu, RotateCcw, Settings, ShoppingBag, Users, Wallet, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LangSwitch, Logo, useToast } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

const NAV = [
  { href: "/admin", k: "overview", icon: LayoutDashboard },
  { href: "/admin/orders", k: "orders", icon: ShoppingBag },
  { href: "/admin/customers", k: "customers", icon: Users },
  { href: "/admin/finance", k: "finance", icon: Wallet },
  { href: "/admin/inventory", k: "inventory", icon: Boxes },
  { href: "/admin/analytics", k: "analytics", icon: BarChart3 },
  { href: "/admin/catalog", k: "catalog", icon: LayoutGrid },
  { href: "/admin/settings", k: "settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const { ready, settings, resetDemo, storageError } = useStore();
  const toast = useToast();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (h: string) => (h === "/admin" ? path === "/admin" : path.startsWith(h));
  const current = NAV.find((n) => active(n.href));

  const sidebar = (
    <div className="flex h-full flex-col bg-brand-900 text-white">
      <div className="flex h-[68px] items-center gap-3 px-6">
        <Link href="/admin" onClick={() => setOpen(false)}><Logo tone="white" className="h-9 w-[78px]" /></Link>
        <span className="rounded-md bg-white/12 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/80">OS</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition-colors ${active(n.href) ? "text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
            {active(n.href) && <motion.span layoutId="adm-nav" className="absolute inset-0 rounded-2xl bg-white/12" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
            <n.icon size={19} className="relative" strokeWidth={active(n.href) ? 2.2 : 1.8} />
            <span className="relative">{t(`adm.nav.${n.k}`)}</span>
          </Link>
        ))}
      </nav>
      <div className="space-y-3 border-t border-white/10 p-4">
        <div className="flex items-center justify-between"><LangSwitch dark /></div>
        <Link href="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"><ExternalLink size={16} />{t("adm.toSite")}</Link>
        <button onClick={() => { resetDemo(); toast(t("adm.resetDone")); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white/70 transition hover:bg-white/5 hover:text-white"><RotateCcw size={16} />{t("adm.reset")}</button>
      </div>
    </div>
  );

  return (
    <div className={`${settings.theme === "dark" ? "dark" : ""} ${settings.compact ? "compact" : ""}`}>
      <div className="min-h-dvh bg-bg text-fg">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] lg:block">{sidebar}</aside>

        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-[90] lg:hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
              <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 420, damping: 40 }} className="absolute inset-y-0 left-0 w-[290px] max-w-[85vw]">
                {sidebar}
                <button onClick={() => setOpen(false)} className="absolute right-3 top-4 grid size-9 place-items-center rounded-full bg-white/10 text-white" aria-label={t("common.close")}><X size={18} /></button>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        <div className="lg:pl-[268px]">
          <div className="bg-amber-400/95 px-4 py-2 text-center text-[11.5px] font-semibold leading-snug text-ink sm:text-xs">{t("adm.demoBanner")}</div>
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bg/85 px-4 backdrop-blur-xl sm:px-8 lg:hidden">
            <button onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-full border border-line" aria-label={t("nav.menu")}><Menu size={20} /></button>
            <span className="font-bold tracking-tight">{current ? t(`adm.nav.${current.k}`) : ""}</span>
            <div className="ml-auto"><LangSwitch /></div>
          </header>
          <main className="mx-auto max-w-[1400px] px-4 py-7 sm:px-8 sm:py-9">
            {storageError && <p className="mb-5 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600">Local storage is full — changes are kept for this session only.</p>}
            {!ready ? (
              <div className="grid gap-4"><div className="h-10 w-64 animate-pulse rounded-xl bg-surface-2" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-36 animate-pulse rounded-3xl bg-surface-2" />)}</div><p className="text-sm text-muted">{t("adm.loading")}</p></div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  {children}
                </motion.div>
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

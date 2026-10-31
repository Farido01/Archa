"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ProductCard } from "@/components/site";
import { Button, Select } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/products";
import { useStore } from "@/lib/store";
import type { CategoryId } from "@/lib/types";

function Catalog() {
  const { t, tl } = useI18n();
  const { products } = useStore();
  const params = useSearchParams();
  const initial = (CATEGORIES.find((c) => c.id === params.get("cat"))?.id ?? "all") as CategoryId | "all";
  const [cat, setCat] = useState<CategoryId | "all">(initial);
  const [q, setQ] = useState("");
  const [color, setColor] = useState<string>("");
  const [sort, setSort] = useState<"featured" | "name">("featured");

  const colors = useMemo(() => {
    const m = new Map<string, { ru: string; tg: string; hex: string }>();
    products.forEach((p) => p.colors.forEach((c) => !m.has(c.name.ru) && m.set(c.name.ru, { ...c.name, hex: c.hex })));
    return [...m.values()];
  }, [products]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products
      .filter((p) => (cat === "all" || p.category === cat) && (!color || p.colors.some((c) => c.name.ru === color)))
      .filter((p) => !s || [p.name.ru, p.name.tg, p.sku, p.desc.ru, p.desc.tg].some((x) => x.toLowerCase().includes(s)))
      .sort((a, b) => (sort === "name" ? tl(a.name).localeCompare(tl(b.name), "ru") : Number(b.featured) - Number(a.featured)));
  }, [products, cat, q, color, sort, tl]);

  const dirty = cat !== "all" || q || color;
  const reset = () => { setCat("all"); setQ(""); setColor(""); };

  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 lg:pt-12">
      <h1 className="display text-[2.2rem] sm:text-5xl lg:text-6xl">{t("catalog.title")}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">{t("catalog.sub")}</p>

      <div className="z-30 -mx-5 mt-8 sm:sticky sm:top-16 border-y border-line/70 bg-bg/95 px-5 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1 lg:max-w-sm">
            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("catalog.searchPh")} className="h-11 w-full rounded-full border border-line bg-surface pl-11 pr-10 text-[15px] outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10" aria-label={t("common.search")} />
            {q && <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg" aria-label={t("common.close")}><X size={16} /></button>}
          </div>
          <div className="no-scrollbar -mx-1 flex max-w-full gap-2 overflow-x-auto px-1 py-1">
            {[{ id: "all" as const, name: { ru: t("common.all"), tg: t("common.all") } }, ...CATEGORIES].map((c) => (
              <button key={c.id} onClick={() => setCat(c.id)} className={`press shrink-0 rounded-full border px-4 py-3 text-sm font-semibold transition-colors ${cat === c.id ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-surface text-muted hover:border-brand-500 hover:text-fg"}`}>
                {tl(c.name)}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-1.5 sm:flex" role="group" aria-label={t("catalog.color")}>
              {colors.slice(0, 9).map((c) => (
                <button key={c.ru} title={tl(c)} aria-label={tl(c)} aria-pressed={color === c.ru} onClick={() => setColor(color === c.ru ? "" : c.ru)} className={`size-6 rounded-full border transition ${color === c.ru ? "scale-110 ring-2 ring-brand-500 ring-offset-2 ring-offset-bg" : "border-black/10 hover:scale-110"}`} style={{ background: c.hex }} />
              ))}
            </div>
            <Select value={sort} onChange={(e) => setSort(e.target.value as "featured" | "name")} className="!h-11 !w-auto !rounded-full" aria-label={t("catalog.sort")}>
              <option value="featured">{t("catalog.sort.featured")}</option>
              <option value="name">{t("catalog.sort.name")}</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-muted">
        <span className="flex items-center gap-2"><SlidersHorizontal size={15} />{t("catalog.found", { n: list.length })}</span>
        {dirty && <button onClick={reset} className="font-semibold text-brand-600 hover:underline">{t("catalog.reset")}</button>}
      </div>

      <motion.div layout className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.div layout key={p.id} initial={{ opacity: 0, transform: "scale(0.97)" }} animate={{ opacity: 1, transform: "scale(1)" }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}>
              <ProductCard p={p} i={i} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {list.length === 0 && (
        <div className="mx-auto mt-16 max-w-sm py-12 text-center">
          <p className="text-lg text-muted">{t("catalog.empty")}</p>
          <Button className="mt-5" variant="outline" onClick={reset}>{t("catalog.reset")}</Button>
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return <Suspense><Catalog /></Suspense>;
}

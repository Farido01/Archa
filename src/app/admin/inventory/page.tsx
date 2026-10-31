"use client";

import { AlertTriangle, Boxes, Layers, Minus, PackageCheck, Plus, Search, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminHeader, Card, COLORS, Empty, StatCard } from "@/components/admin-ui";
import { ProductArt } from "@/components/art";
import { Badge, Button, Input, Modal, Select, useToast } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { CATEGORIES, catName } from "@/lib/products";
import { useStore } from "@/lib/store";
import type { CategoryId } from "@/lib/types";

export default function InventoryPage() {
  const { t, tl, num, money } = useI18n();
  const { products, adjustStock } = useStore();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [onlyLow, setOnlyLow] = useState(false);
  const [restock, setRestock] = useState<string | null>(null);
  const [qty, setQty] = useState(10);

  const low = products.filter((p) => p.stock <= p.minStock);
  const units = products.reduce((s, p) => s + p.stock, 0);
  const value = products.reduce((s, p) => s + p.stock * p.price, 0);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products
      .filter((p) => (cat === "all" || p.category === cat) && (!onlyLow || p.stock <= p.minStock) && (!s || [p.name.ru, p.name.tg, p.sku].some((x) => x.toLowerCase().includes(s))))
      .sort((a, b) => a.stock / a.minStock - b.stock / b.minStock);
  }, [products, q, cat, onlyLow]);

  const target = products.find((p) => p.id === restock);

  return (
    <>
      <AdminHeader title={t("adm.title.inventory")} />

      {low.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
          <AlertTriangle className="text-amber-600" size={20} />
          <p className="flex-1 text-[15px] font-semibold">{t("inv.lowAlert", { n: low.length })}: <span className="font-normal text-muted">{low.slice(0, 3).map((p) => tl(p.name)).join(", ")}{low.length > 3 ? "…" : ""}</span></p>
          <Button size="sm" variant="outline" onClick={() => setOnlyLow(true)}>{t("inv.onlyLow")}</Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("inv.positions")} value={products.length} format={num} icon={Layers} hint={`${CATEGORIES.length} ${t("acat.category").toLowerCase()}`} />
        <StatCard label={t("inv.units")} value={units} format={num} icon={Boxes} color="#5b8def" hint={t("common.pcs")} />
        <StatCard label={t("inv.value")} value={value} format={money} icon={Wallet} color={COLORS.expense} hint="" />
        <StatCard label={t("inv.low")} value={low.length} format={num} icon={low.length ? AlertTriangle : PackageCheck} color={low.length ? "#e07a5f" : COLORS.income} hint="" />
      </div>

      <div className="my-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 sm:max-w-sm">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("catalog.searchPh")} className="!rounded-full !pl-11" aria-label={t("common.search")} />
        </div>
        <Select value={cat} onChange={(e) => setCat(e.target.value as CategoryId | "all")} className="!w-auto !rounded-full" aria-label={t("acat.category")}><option value="all">{t("common.all")}</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{tl(c.name)}</option>)}</Select>
        <label className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-medium"><input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} className="accent-brand-600" />{t("inv.onlyLow")}</label>
      </div>

      <Card pad={false}>
        {list.length === 0 ? <Empty text={t("common.none")} /> : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>{t("ord.product")}</th><th>{t("acat.category")}</th><th className="min-w-[180px]">{t("inv.level")}</th><th className="num">{t("inv.stock")}</th><th className="num">{t("inv.min")}</th><th>{t("common.status")}</th><th /></tr></thead>
              <tbody>
                {list.map((p) => {
                  const isLow = p.stock <= p.minStock;
                  const pct = Math.min(100, (p.stock / (p.minStock * 3)) * 100);
                  return (
                    <tr key={p.id}>
                      <td><div className="flex items-center gap-3"><div className="size-12 shrink-0 overflow-hidden rounded-xl"><ProductArt product={p} /></div><div><p className="font-semibold">{tl(p.name)}</p><p className="text-xs text-muted">{p.sku}</p></div></div></td>
                      <td className="text-muted">{tl(catName(p.category))}</td>
                      <td><div className="h-2 overflow-hidden rounded-full bg-surface-2"><div className={`h-full rounded-full transition-all duration-700 ${isLow ? "bg-amber-500" : "bg-brand-500"}`} style={{ width: `${pct}%` }} /></div></td>
                      <td className="num font-bold">{num(p.stock)}</td>
                      <td className="num text-muted">{num(p.minStock)}</td>
                      <td>{isLow ? <Badge tone="amber"><AlertTriangle size={12} />{t("inv.low")}</Badge> : <Badge tone="green">{t("inv.ok")}</Badge>}</td>
                      <td className="text-right"><Button size="sm" variant="outline" onClick={() => { setRestock(p.id); setQty(Math.max(10, p.minStock * 2 - p.stock)); }}>{t("inv.restock")}</Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!target} onClose={() => setRestock(null)} title={target ? `${t("inv.restock")}: ${tl(target.name)}` : ""}
        footer={target && <>
          <Button variant="ghost" onClick={() => { adjustStock(target.id, -qty); setRestock(null); toast(t("common.saved")); }}><Minus size={16} />{t("inv.writeoff")}</Button>
          <Button onClick={() => { adjustStock(target.id, qty); setRestock(null); toast(t("inv.restocked")); }}><Plus size={16} />{t("inv.restock")}</Button>
        </>}>
        {target && (
          <div className="space-y-5">
            <p className="text-[15px] text-muted">{t("inv.stock")}: <b className="text-fg">{target.stock}</b> · {t("inv.min")}: <b className="text-fg">{target.minStock}</b></p>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setQty(Math.max(1, qty - 5))} aria-label="-5"><Minus size={16} /></Button>
              <Input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} className="!text-center !text-lg !font-bold" aria-label={t("inv.qty")} />
              <Button variant="outline" onClick={() => setQty(qty + 5)} aria-label="+5"><Plus size={16} /></Button>
            </div>
            <p className="text-sm text-muted">→ {t("inv.stock")}: <b className="text-fg">{target.stock + qty}</b></p>
          </div>
        )}
      </Modal>
    </>
  );
}

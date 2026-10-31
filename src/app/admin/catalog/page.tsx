"use client";

import { ImagePlus, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminHeader, Card, Empty } from "@/components/admin-ui";
import { ProductArt } from "@/components/art";
import { Badge, Button, Field, Input, Modal, Select, Textarea, useToast } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { CATEGORIES, catName } from "@/lib/products";
import { uid } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type { ArtKind, CategoryId, Product } from "@/lib/types";

const ART_BY_CAT: Record<CategoryId, ArtKind> = { doors: "door", sofas: "sofa", dining: "dining", chairs: "chair", business: "office" };

const blank = (): Product => ({
  id: uid("p"), sku: "", category: "sofas",
  name: { ru: "", tg: "" }, desc: { ru: "", tg: "" },
  specs: [], colors: [{ name: { ru: "Базовый", tg: "Асосӣ" }, hex: "#d9c8aa" }],
  art: "sofa", tone: "#d9c8aa", accent: "#bfae90", price: 0, stock: 0, minStock: 5, featured: false,
});

function resizeImage(file: File, max = 900): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => rej(new Error("img"));
    img.src = url;
  });
}

export default function CatalogAdmin() {
  const { t, tl, money } = useI18n();
  const { products, upsertProduct, deleteProduct } = useStore();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [edit, setEdit] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products.filter((p) => (cat === "all" || p.category === cat) && (!s || [p.name.ru, p.name.tg, p.sku].some((x) => x.toLowerCase().includes(s))));
  }, [products, q, cat]);

  const save = () => {
    if (!edit) return;
    if (!edit.name.ru.trim()) return toast(t("common.required"));
    const p: Product = { ...edit, name: { ru: edit.name.ru.trim(), tg: edit.name.tg.trim() || edit.name.ru.trim() }, desc: { ru: edit.desc.ru, tg: edit.desc.tg || edit.desc.ru }, sku: edit.sku.trim() || `NEW-${Math.floor(Math.random() * 900 + 100)}`, specs: edit.specs.filter((s) => s.k.ru.trim()) };
    upsertProduct(p);
    setEdit(null);
    toast(isNew ? t("common.added") : t("common.saved"));
  };

  const upload = async (f?: File) => {
    if (!f || !edit) return;
    try { setEdit({ ...edit, image: await resizeImage(f) }); } catch { toast(t("acat.imgTooBig")); }
  };

  const set = <K extends keyof Product>(k: K, v: Product[K]) => edit && setEdit({ ...edit, [k]: v });

  return (
    <>
      <AdminHeader title={t("adm.title.catalog")} sub={t("acat.hint")} actions={<Button onClick={() => { setEdit(blank()); setIsNew(true); }}><Plus size={17} />{t("acat.add")}</Button>} />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 sm:max-w-sm">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("catalog.searchPh")} className="!rounded-full !pl-11" aria-label={t("common.search")} />
        </div>
        <Select value={cat} onChange={(e) => setCat(e.target.value as CategoryId | "all")} className="!w-auto !rounded-full" aria-label={t("acat.category")}><option value="all">{t("common.all")}</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{tl(c.name)}</option>)}</Select>
      </div>

      {list.length === 0 ? <Card><Empty text={t("catalog.empty")} /></Card> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {list.map((p) => (
            <article key={p.id} className="group overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition hover:shadow-lift">
              <div className="relative aspect-[4/3]">
                <ProductArt product={p} />
                {p.featured && <span className="absolute left-3 top-3 grid size-8 place-items-center rounded-full bg-amber-400 text-ink"><Star size={15} fill="currentColor" /></span>}
                <div className="absolute right-3 top-3 flex gap-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                  <button onClick={() => { setEdit(structuredClone(p)); setIsNew(false); }} className="grid size-9 place-items-center rounded-full bg-white text-ink shadow-soft hover:bg-brand-50" aria-label={t("common.edit")}><Pencil size={15} /></button>
                  <button onClick={() => { if (confirm(t("common.confirmDelete"))) { deleteProduct(p.id); toast(t("common.deleted")); } }} className="grid size-9 place-items-center rounded-full bg-white text-red-600 shadow-soft hover:bg-red-50" aria-label={t("common.delete")}><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2"><h3 className="font-semibold leading-snug">{tl(p.name)}</h3><span className="shrink-0 text-xs text-muted">{p.sku}</span></div>
                <p className="mt-1 text-xs text-muted">{tl(catName(p.category))}</p>
                <div className="mt-3 flex items-center justify-between"><b className="tabular-nums">{money(p.price)}</b><Badge tone={p.stock <= p.minStock ? "amber" : "green"}>{p.stock} {t("common.pcs")}</Badge></div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} wide title={isNew ? t("acat.add") : t("acat.edit")} footer={<><Button variant="ghost" onClick={() => setEdit(null)}>{t("common.cancel")}</Button><Button onClick={save}>{t("common.save")}</Button></>}>
        {edit && (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
              <div>
                <p className="mb-1.5 text-[13px] font-medium text-muted">{t("acat.image")}</p>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line">
                  <ProductArt product={edit} />
                  {edit.image && <button onClick={() => set("image", undefined)} className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white text-ink shadow-soft" aria-label={t("acat.remove")}><X size={14} /></button>}
                </div>
                <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line py-2.5 text-sm font-semibold text-brand-600 transition hover:border-brand-500 hover:bg-brand-50">
                  <ImagePlus size={16} />{t("acat.upload")}
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={`${t("acat.nameRu")} *`}><Input value={edit.name.ru} onChange={(e) => set("name", { ...edit.name, ru: e.target.value })} /></Field>
                <Field label={t("acat.nameTg")}><Input value={edit.name.tg} onChange={(e) => set("name", { ...edit.name, tg: e.target.value })} /></Field>
                <Field label={t("acat.category")}><Select value={edit.category} onChange={(e) => { const c = e.target.value as CategoryId; setEdit({ ...edit, category: c, art: isNew ? ART_BY_CAT[c] : edit.art }); }}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{tl(c.name)}</option>)}</Select></Field>
                <Field label={t("acat.sku")}><Input value={edit.sku} onChange={(e) => set("sku", e.target.value)} /></Field>
                <Field label={t("acat.price")}><Input type="number" min={0} value={edit.price} onChange={(e) => set("price", Math.max(0, Number(e.target.value) || 0))} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("acat.stock")}><Input type="number" min={0} value={edit.stock} onChange={(e) => set("stock", Math.max(0, Number(e.target.value) || 0))} /></Field>
                  <Field label={t("acat.minStock")}><Input type="number" min={0} value={edit.minStock} onChange={(e) => set("minStock", Math.max(0, Number(e.target.value) || 0))} /></Field>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("acat.descRu")}><Textarea value={edit.desc.ru} onChange={(e) => set("desc", { ...edit.desc, ru: e.target.value })} /></Field>
              <Field label={t("acat.descTg")}><Textarea value={edit.desc.tg} onChange={(e) => set("desc", { ...edit.desc, tg: e.target.value })} /></Field>
            </div>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium"><input type="checkbox" checked={edit.featured} onChange={(e) => set("featured", e.target.checked)} className="size-4 accent-brand-600" />{t("acat.featured")}</label>
            <div>
              <p className="mb-2 text-[13px] font-semibold text-muted">{t("acat.specs")}</p>
              <div className="space-y-2">
                {edit.specs.map((s, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <Input placeholder={t("acat.specKey")} value={s.k.ru} onChange={(e) => set("specs", edit.specs.map((x, j) => (j === i ? { k: { ru: e.target.value, tg: e.target.value }, v: x.v } : x)))} />
                    <Input placeholder={t("acat.specVal")} value={s.v.ru} onChange={(e) => set("specs", edit.specs.map((x, j) => (j === i ? { k: x.k, v: { ru: e.target.value, tg: e.target.value } } : x)))} />
                    <Button variant="ghost" size="sm" className="!h-11" onClick={() => set("specs", edit.specs.filter((_, j) => j !== i))} aria-label={t("common.delete")}><Trash2 size={15} /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => set("specs", [...edit.specs, { k: { ru: "", tg: "" }, v: { ru: "", tg: "" } }])}><Plus size={15} />{t("acat.addSpec")}</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

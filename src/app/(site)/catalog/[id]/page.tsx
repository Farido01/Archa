"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ProductArt, Scene, type SceneKind } from "@/components/art";
import { Photo } from "@/components/photo";
import { PHOTOS } from "@/lib/photos";
import { ProductCard, SectionHead, useLead } from "@/components/site";
import { Button } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { catName } from "@/lib/products";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";

const sceneFor = (p: Product): SceneKind => {
  if (p.category === "doors") return "hall";
  if (p.category === "sofas") return "living";
  if (p.category === "dining") return "dining";
  if (p.category === "chairs") return "cafe";
  return ({ theatre: "theatre", office: "office", desk: "school", bed: "clinic" } as Record<string, SceneKind>)[p.art] ?? "office";
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { t, tl } = useI18n();
  const { products } = useStore();
  const lead = useLead();
  const p = products.find((x) => x.id === id);
  const [shot, setShot] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);

  if (!p)
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="display text-4xl">{t("product.notFound")}</h1>
        <Link href="/catalog"><Button className="mt-8">{t("product.back")}</Button></Link>
      </div>
    );

  const col = p.colors[colorIdx] ?? p.colors[0];
  const shown = { ...p, tone: p.image ? p.tone : col?.hex ?? p.tone };
  const scene = sceneFor(p);
  const fill = (src: string | null, alt: string, fallback: React.ReactNode) => (
    <div className="relative h-full w-full"><Photo src={src} alt={alt} sizes="(min-width:1024px) 55vw, 100vw">{fallback}</Photo></div>
  );
  // с фото: товар + направление + интерьер; без фото: иллюстрация в цвете + варианты
  const shots = p.image
    ? [
        <ProductArt key="a" product={p} />,
        fill(PHOTOS.categories[p.category], tl(catName(p.category)), <ProductArt product={shown} variant="green" />),
        fill(PHOTOS.projects[scene], "", <Scene kind={scene} />),
      ]
    : [
        <ProductArt key="a" product={shown} />,
        <ProductArt key="b" product={shown} variant="green" />,
        <Scene key="c" kind={scene} />,
      ];
  const similar = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 sm:px-8 lg:pt-32">
      <Link href="/catalog" className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-brand-600"><ArrowLeft size={16} />{t("product.back")}</Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div>
          <motion.div key={shot} initial={{ opacity: 0.4, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="arch aspect-[4/4.2] overflow-hidden">
            {shots[shot]}
          </motion.div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {shots.map((s, i) => (
              <button key={i} onClick={() => setShot(i)} aria-label={`${i + 1}`} className={`aspect-[4/3] overflow-hidden rounded-2xl border-2 transition ${shot === i ? "border-brand-600" : "border-transparent opacity-70 hover:opacity-100"}`}>{s}</button>
            ))}
          </div>
        </div>

        <div className="lg:pt-4">
          <p className="text-sm font-semibold text-brand-600">{tl(catName(p.category))}</p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">{tl(p.name)}</h1>
          <p className="mt-2 text-sm text-muted">{t("product.sku")}: {p.sku}</p>
          <p className="mt-6 text-lg leading-relaxed text-muted">{tl(p.desc)}</p>

          {p.colors.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold">{t("product.colors")}: <span className="font-normal text-muted">{tl(col.name)}</span></h3>
              <div className="mt-3 flex flex-wrap gap-3">
                {p.colors.map((c, i) => (
                  <button key={c.name.ru} onClick={() => { setColorIdx(i); setShot(0); }} title={tl(c.name)} aria-label={tl(c.name)} aria-pressed={colorIdx === i} className={`grid size-11 place-items-center rounded-full border-2 transition ${colorIdx === i ? "border-brand-600" : "border-line hover:border-brand-300"}`}>
                    <span className="grid size-8 place-items-center rounded-full border border-black/10" style={{ background: c.hex }}>{colorIdx === i && <Check size={14} className={c.hex > "#bbbbbb" ? "text-ink" : "text-white"} />}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-9 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => lead(p.id)}>{t("common.learnPrice")}</Button>
            <Button size="lg" variant="outline" onClick={() => lead(p.id)}>{t("product.order")}</Button>
          </div>
          <p className="mt-4 text-sm text-muted">{t("product.priceNote")}</p>

          <h3 className="mb-3 mt-10 font-display text-xl font-semibold tracking-tight">{t("product.specs")}</h3>
          <dl className="divide-y divide-line rounded-2xl border border-line bg-surface">
            {p.specs.map((s) => (
              <div key={s.k.ru} className="grid grid-cols-[1fr_1.3fr] gap-4 px-5 py-3.5 text-[15px]">
                <dt className="text-muted">{tl(s.k)}</dt>
                <dd className="font-medium">{tl(s.v)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-24">
          <SectionHead eyebrow={tl(catName(p.category))} title={t("product.similar")} />
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{similar.map((x, i) => <ProductCard key={x.id} p={x} i={i} />)}</div>
        </section>
      )}
    </div>
  );
}

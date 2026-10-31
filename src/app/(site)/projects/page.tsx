"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Scene } from "@/components/art";
import { Photo } from "@/components/photo";
import { PHOTOS } from "@/lib/photos";
import { Modal } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { PROJECTS } from "@/lib/projects";

export default function ProjectsPage() {
  const { t } = useI18n();
  const [f, setF] = useState<"all" | "home" | "business">("all");
  const [open, setOpen] = useState<string | null>(null);
  const list = PROJECTS.filter((p) => f === "all" || p.type === f);
  const cur = PROJECTS.find((p) => p.id === open);

  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 lg:pt-12">
      <h1 className="display text-[2.2rem] sm:text-5xl lg:text-6xl">{t("projects.title")}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">{t("projects.sub")}</p>
      <div className="mt-8 flex gap-2">
        {(["all", "home", "business"] as const).map((k) => (
          <button key={k} onClick={() => setF(k)} className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${f === k ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-surface text-muted hover:text-fg"}`}>
            {k === "all" ? t("projects.f.all") : t(`projects.t.${k}`)}
          </button>
        ))}
      </div>
      <motion.div layout className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.button layout key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.04 }} onClick={() => setOpen(p.id)} className="group relative block w-full break-inside-avoid overflow-hidden rounded-3xl text-left" style={{ aspectRatio: i % 3 === 1 ? "4/5" : "4/3" }}>
              <div className="hover-zoom absolute inset-0"><Photo src={PHOTOS.projects[p.kind]} alt={t(p.key)} sizes="(min-width:1024px) 33vw, 50vw"><Scene kind={p.kind} /></Photo></div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 p-5 text-white opacity-0 transition group-hover:opacity-100">
                <p className="text-lg font-bold">{t(p.key)}</p>
                <p className="text-xs text-white/75">{t(`projects.t.${p.type}`)}</p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
      <Modal open={!!cur} onClose={() => setOpen(null)} title={cur ? t(cur.key) : ""} wide>
        {cur && <div className="relative aspect-[3/2] overflow-hidden rounded-2xl"><Photo src={PHOTOS.projects[cur.kind]} alt={t(cur.key)} sizes="(min-width:768px) 720px, 100vw"><Scene kind={cur.kind} /></Photo></div>}
      </Modal>
    </div>
  );
}

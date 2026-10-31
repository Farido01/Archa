"use client";

import { Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { LeadForm } from "@/components/site";
import { Instagram, Reveal } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function ContactsPage() {
  const { t } = useI18n();
  const { settings } = useStore();
  const c = settings.contacts;
  const rows = [
    { icon: Phone, k: "contacts.phone", v: c.phone, href: `tel:${c.phone}` },
    { icon: Instagram, k: "contacts.instagram", v: `@${c.instagram}`, href: `https://instagram.com/${c.instagram}` },
    { icon: Send, k: "contacts.telegram", v: `@${c.telegram}`, href: `https://t.me/${c.telegram}` },
    { icon: Mail, k: "contacts.email", v: c.email, href: `mailto:${c.email}` },
    c.whatsapp
      ? { icon: MessageCircle, k: "contacts.whatsapp", v: c.whatsapp, href: `https://wa.me/${c.whatsapp.replace(/\D/g, "")}` }
      : { icon: MessageCircle, k: "contacts.whatsapp", v: t("contacts.whatsappPending"), href: undefined },
  ];
  return (
    <div className="mx-auto max-w-7xl px-5 pb-8 pt-12 sm:px-8 lg:pt-16">
      <p className="eyebrow mb-3 text-brand-600">{t("nav.contacts")}</p>
      <h1 className="display text-4xl sm:text-6xl">{t("contacts.title")}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">{t("contacts.sub")}</p>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <Reveal className="space-y-3">
          {rows.map((r) => {
            const inner = (
              <>
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white"><r.icon size={20} /></span>
                <span className="min-w-0">
                  <span className="block text-[13px] text-muted">{t(r.k)}</span>
                  <span className={`block truncate text-lg font-semibold ${r.href ? "" : "text-muted"}`}>{r.v}</span>
                </span>
              </>
            );
            return r.href ? (
              <a key={r.k} href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="group flex items-center gap-4 rounded-3xl border border-line bg-surface p-4 transition hover:border-brand-400 hover:shadow-soft">{inner}</a>
            ) : (
              <div key={r.k} className="group flex items-center gap-4 rounded-3xl border border-dashed border-line bg-surface/60 p-4">{inner}</div>
            );
          })}
          <div className="flex items-start gap-4 rounded-3xl border border-dashed border-line bg-surface/60 p-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-2 text-muted"><MapPin size={20} /></span>
            <span>
              <span className="block text-[13px] text-muted">{t("contacts.address")}</span>
              <span className="block text-[15px] leading-snug text-muted">{c.address || t("contacts.addressPending")}</span>
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-[2rem] border border-line bg-surface p-6 shadow-soft sm:p-9">
            <h2 className="mb-5 text-2xl font-bold tracking-tight">{t("form.title")}</h2>
            <LeadForm />
          </div>
        </Reveal>
      </div>
    </div>
  );
}

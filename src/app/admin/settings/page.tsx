"use client";

import { Moon, Plus, RotateCcw, Sun, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdminHeader, Card } from "@/components/admin-ui";
import { Badge, Button, Field, Input, LangSwitch, Select, Textarea, useToast } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { uid } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type { DemoUser, Settings } from "@/lib/types";

const ROLES: DemoUser["role"][] = ["owner", "manager", "accountant", "warehouse"];

export default function SettingsPage() {
  const { t } = useI18n();
  const { settings, users, updateSettings, upsertUser, deleteUser, resetDemo } = useStore();
  const toast = useToast();
  const [co, setCo] = useState(settings.company);
  const [ct, setCt] = useState(settings.contacts);
  const [nu, setNu] = useState({ name: "", email: "", role: "manager" as DemoUser["role"] });

  const saveCompany = () => { updateSettings({ company: co, contacts: ct } as Partial<Settings>); toast(t("common.saved")); };
  const addUser = () => {
    if (!nu.name.trim() || !nu.email.includes("@")) return toast(t("common.required"));
    upsertUser({ id: uid("u"), name: nu.name.trim(), email: nu.email.trim(), role: nu.role, active: true });
    setNu({ name: "", email: "", role: "manager" });
    toast(t("set.userAdded"));
  };

  return (
    <>
      <AdminHeader title={t("adm.title.settings")} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title={t("set.company")}>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("set.companyName")}><Input value={co.name} onChange={(e) => setCo({ ...co, name: e.target.value })} /></Field>
              <Field label={t("set.slogan")}><Input value={co.slogan} onChange={(e) => setCo({ ...co, slogan: e.target.value })} /></Field>
            </div>
            <Field label={t("set.about")}><Textarea value={co.about} onChange={(e) => setCo({ ...co, about: e.target.value })} /></Field>
          </div>
        </Card>

        <Card title={t("set.contacts")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("common.phone")}><Input value={ct.phone} onChange={(e) => setCt({ ...ct, phone: e.target.value })} /></Field>
            <Field label={t("common.email")}><Input value={ct.email} onChange={(e) => setCt({ ...ct, email: e.target.value })} /></Field>
            <Field label="Instagram"><Input value={ct.instagram} onChange={(e) => setCt({ ...ct, instagram: e.target.value })} /></Field>
            <Field label="Telegram"><Input value={ct.telegram} onChange={(e) => setCt({ ...ct, telegram: e.target.value })} /></Field>
            <Field label="WhatsApp" hint={!ct.whatsapp ? t("set.whatsappEmpty") : undefined}><Input value={ct.whatsapp} onChange={(e) => setCt({ ...ct, whatsapp: e.target.value })} placeholder="+992…" /></Field>
            <Field label={t("contacts.address")} hint={!ct.address ? t("set.addressEmpty") : undefined}><Input value={ct.address} onChange={(e) => setCt({ ...ct, address: e.target.value })} /></Field>
          </div>
          <div className="mt-5 flex justify-end"><Button onClick={saveCompany}>{t("common.save")}</Button></div>
        </Card>

        <Card title={t("set.interface")}>
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-[13px] font-medium text-muted">{t("set.theme")}</p>
              <div className="inline-flex rounded-full bg-surface-2 p-1">
                {(["light", "dark"] as const).map((m) => (
                  <button key={m} onClick={() => updateSettings({ theme: m })} className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${settings.theme === m ? "bg-brand-600 text-white" : "text-muted"}`}>
                    {m === "light" ? <Sun size={15} /> : <Moon size={15} />}{t(`set.${m}`)}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <span className="text-[15px] font-medium">{t("set.compact")}</span>
              <button role="switch" aria-checked={settings.compact} onClick={() => updateSettings({ compact: !settings.compact })} className={`relative h-7 w-12 rounded-full transition ${settings.compact ? "bg-brand-600" : "bg-line"}`}><span className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-all ${settings.compact ? "left-[22px]" : "left-0.5"}`} /></button>
            </label>
            <div className="flex items-center justify-between gap-4"><span className="text-[15px] font-medium">{t("common.language")}</span><LangSwitch /></div>
            <Button variant="outline" onClick={() => { resetDemo(); toast(t("adm.resetDone")); }}><RotateCcw size={16} />{t("adm.reset")}</Button>
          </div>
        </Card>

        <Card title={t("set.users")} pad={false}>
          <p className="px-5 pt-3 text-xs leading-relaxed text-muted sm:px-6">{t("set.usersNote")}</p>
          <ul className="mt-3 divide-y divide-line">
            {users.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 sm:px-6">
                <div className="min-w-0 flex-1"><p className="truncate font-semibold">{u.name}</p><p className="truncate text-xs text-muted">{u.email}</p></div>
                <Select value={u.role} onChange={(e) => upsertUser({ ...u, role: e.target.value as DemoUser["role"] })} className="!h-9 !w-auto !rounded-full !text-sm" aria-label={t("set.role")}>{ROLES.map((r) => <option key={r} value={r}>{t(`set.role.${r}`)}</option>)}</Select>
                <button role="switch" aria-checked={u.active} aria-label={t("set.active")} onClick={() => upsertUser({ ...u, active: !u.active })} className="shrink-0"><Badge tone={u.active ? "green" : "neutral"}>{u.active ? t("set.active") : "—"}</Badge></button>
                <button onClick={() => { deleteUser(u.id); toast(t("common.deleted")); }} className="grid size-8 place-items-center rounded-full text-muted hover:bg-red-500/10 hover:text-red-600" aria-label={t("common.delete")}><Trash2 size={15} /></button>
              </li>
            ))}
          </ul>
          <div className="grid gap-3 border-t border-line p-5 sm:grid-cols-[1fr_1fr_auto_auto] sm:px-6">
            <Input placeholder={t("common.name")} value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} aria-label={t("common.name")} />
            <Input placeholder="email" type="email" value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} aria-label="email" />
            <Select value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value as DemoUser["role"] })} className="!w-auto" aria-label={t("set.role")}>{ROLES.map((r) => <option key={r} value={r}>{t(`set.role.${r}`)}</option>)}</Select>
            <Button onClick={addUser}><Plus size={16} />{t("common.add")}</Button>
          </div>
        </Card>
      </div>
    </>
  );
}

"use client";

import { Building2, Phone, Plus, Search, Trash2, User } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminHeader, Avatar, Card, Empty, StatusBadge } from "@/components/admin-ui";
import { Badge, Button, Field, Input, Modal, Select, useToast } from "@/components/ui";
import { customerStats } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

const PAGE = 14;

export default function CustomersPage() {
  const { t, tl, money, date } = useI18n();
  const { customers, orders, products, addCustomer, deleteCustomer } = useStore();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("all");
  const [type, setType] = useState<"all" | "private" | "business">("all");
  const [sort, setSort] = useState<"spent" | "recent" | "name">("spent");
  const [limit, setLimit] = useState(PAGE);
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", city: "Душанбе", type: "private" as "private" | "business" });

  const rows = useMemo(() => customers.map((c) => ({ c, s: customerStats(c, orders) })), [customers, orders]);
  const cities = useMemo(() => [...new Set(customers.map((c) => c.city))].sort(), [customers]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows
      .filter(({ c }) => (city === "all" || c.city === city) && (type === "all" || c.type === type) && (!s || [c.name, c.phone, c.city].some((x) => x.toLowerCase().includes(s))))
      .sort((a, b) => (sort === "spent" ? b.s.spent - a.s.spent : sort === "recent" ? b.s.last - a.s.last : a.c.name.localeCompare(b.c.name, "ru")));
  }, [rows, q, city, type, sort]);

  const open = rows.find((r) => r.c.id === openId);
  const prodName = (id: string) => { const p = products.find((x) => x.id === id); return p ? tl(p.name) : "—"; };

  const save = () => {
    if (!form.name.trim() || form.phone.replace(/\D/g, "").length < 4) return toast(t("common.required"));
    addCustomer({ name: form.name.trim(), phone: form.phone.trim(), city: form.city.trim() || "—", type: form.type });
    setAdding(false);
    setForm({ name: "", phone: "", city: "Душанбе", type: "private" });
    toast(t("cus.created"));
  };

  return (
    <>
      <AdminHeader title={t("adm.title.customers")} sub={`${customers.length}`} actions={<Button onClick={() => setAdding(true)}><Plus size={17} />{t("cus.add")}</Button>} />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 sm:max-w-md">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder={t("cus.searchPh")} className="!rounded-full !pl-11" aria-label={t("common.search")} />
        </div>
        <Select value={city} onChange={(e) => { setCity(e.target.value); setLimit(PAGE); }} className="!w-auto !rounded-full" aria-label={t("common.city")}>
          <option value="all">{t("cus.allCities")}</option>{cities.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Select value={type} onChange={(e) => { setType(e.target.value as typeof type); setLimit(PAGE); }} className="!w-auto !rounded-full" aria-label={t("cus.type")}>
          <option value="all">{t("cus.type")}: {t("common.all")}</option><option value="private">{t("cus.private")}</option><option value="business">{t("cus.business")}</option>
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="!w-auto !rounded-full" aria-label={t("catalog.sort")}>
          <option value="spent">{t("cus.sort.spent")}</option><option value="recent">{t("cus.sort.recent")}</option><option value="name">{t("cus.sort.name")}</option>
        </Select>
      </div>

      <Card pad={false}>
        {list.length === 0 ? <Empty text={t("common.none")} /> : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="tbl">
                <thead><tr><th>{t("ord.customer")}</th><th>{t("common.phone")}</th><th>{t("common.city")}</th><th className="num">{t("cus.orders")}</th><th className="num">{t("cus.spent")}</th><th>{t("cus.last")}</th></tr></thead>
                <tbody>
                  {list.slice(0, limit).map(({ c, s }) => (
                    <tr key={c.id} onClick={() => setOpenId(c.id)} className="cursor-pointer">
                      <td><div className="flex items-center gap-3"><Avatar name={c.name} /><div><p className="font-semibold">{c.name}</p><Badge tone={c.type === "business" ? "violet" : "neutral"}>{t(`cus.${c.type}`)}</Badge></div></div></td>
                      <td className="whitespace-nowrap text-muted">{c.phone}</td>
                      <td>{c.city}</td>
                      <td className="num">{s.count}</td>
                      <td className="num font-semibold">{money(s.spent)}</td>
                      <td className="whitespace-nowrap text-muted">{date(s.last)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-line md:hidden">
              {list.slice(0, limit).map(({ c, s }) => (
                <li key={c.id}>
                  <button onClick={() => setOpenId(c.id)} className="flex w-full items-center gap-3 px-5 py-4 text-left">
                    <Avatar name={c.name} size={42} />
                    <div className="min-w-0 flex-1"><p className="truncate font-semibold">{c.name}</p><p className="text-sm text-muted">{c.city} · {s.count} {t("cus.orders").toLowerCase()}</p></div>
                    <b className="text-sm tabular-nums">{money(s.spent)}</b>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-line px-5 py-4 text-sm text-muted">
              <span>{t("common.shown")}: {Math.min(limit, list.length)} {t("common.of")} {list.length}</span>
              {limit < list.length && <Button size="sm" variant="outline" onClick={() => setLimit(limit + PAGE)}>{t("ord.more", { n: Math.min(PAGE, list.length - limit) })}</Button>}
            </div>
          </>
        )}
      </Card>

      <Modal side open={!!open} onClose={() => setOpenId(null)} title={open?.c.name ?? ""}
        footer={open && <Button variant="ghost" className="!text-red-600" onClick={() => { if (confirm(open.s.count ? `${t("cus.hasOrders")}\n${t("common.confirmDelete")}` : t("common.confirmDelete"))) { deleteCustomer(open.c.id); setOpenId(null); toast(t("common.deleted")); } }}><Trash2 size={16} />{t("common.delete")}</Button>}>
        {open && (
          <div className="space-y-7">
            <div className="flex items-center gap-4">
              <Avatar name={open.c.name} size={56} />
              <div>
                <Badge tone={open.c.type === "business" ? "violet" : "neutral"}>{open.c.type === "business" ? <Building2 size={12} /> : <User size={12} />}{t(`cus.${open.c.type}`)}</Badge>
                <a href={`tel:${open.c.phone}`} className="mt-1.5 flex items-center gap-2 text-[15px] font-medium hover:text-brand-600"><Phone size={14} />{open.c.phone}</a>
                <p className="text-sm text-muted">{open.c.city} · {t("cus.since")} {date(open.c.created)}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[[t("cus.orders"), String(open.s.count)], [t("cus.spent"), money(open.s.spent)], [t("cus.last"), date(open.s.last, false)]].map(([l, v]) => (
                <div key={l} className="rounded-2xl bg-surface-2 p-3.5"><p className="text-xs text-muted">{l}</p><p className="mt-1 text-[15px] font-bold tabular-nums">{v}</p></div>
              ))}
            </div>
            {open.c.note && <p className="rounded-2xl border border-dashed border-line p-4 text-sm text-muted">{open.c.note}</p>}
            <div>
              <h3 className="mb-3 text-sm font-bold">{t("cus.history")}</h3>
              {open.s.orders.length === 0 ? <p className="text-sm text-muted">{t("cus.noOrders")}</p> : (
                <ul className="divide-y divide-line rounded-2xl border border-line">
                  {open.s.orders.slice(0, 15).map((o) => (
                    <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0"><p className="text-sm font-semibold">{o.num} <span className="font-normal text-muted">· {date(o.date)}</span></p><p className="truncate text-xs text-muted">{o.items.map((i) => prodName(i.productId)).join(", ") || "—"}</p></div>
                      <div className="shrink-0 text-right"><StatusBadge s={o.status} /><p className="mt-1 text-xs font-semibold tabular-nums">{o.total ? money(o.total) : t("ord.pending")}</p></div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={adding} onClose={() => setAdding(false)} title={t("cus.add")} footer={<><Button variant="ghost" onClick={() => setAdding(false)}>{t("common.cancel")}</Button><Button onClick={save}>{t("common.save")}</Button></>}>
        <div className="space-y-4">
          <Field label={`${t("common.name")} *`}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label={`${t("common.phone")} *`}><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+992 …" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("common.city")}><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            <Field label={t("cus.type")}><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "private" | "business" })}><option value="private">{t("cus.private")}</option><option value="business">{t("cus.business")}</option></Select></Field>
          </div>
        </div>
      </Modal>
    </>
  );
}

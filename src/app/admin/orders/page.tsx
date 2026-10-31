"use client";

import { Check, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminHeader, Avatar, Card, Empty, STATUSES, StatusBadge } from "@/components/admin-ui";
import { Badge, Button, Field, Input, Modal, Select, Textarea, useToast } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Order, OrderSource, OrderStatus } from "@/lib/types";

const FLOW: OrderStatus[] = ["new", "processing", "production", "ready", "delivered"];
const SOURCES: OrderSource[] = ["site", "phone", "instagram", "showroom"];
const PAGE = 12;

export default function OrdersPage() {
  const { t, tl, money, date } = useI18n();
  const { orders, customers, products, updateOrder, setOrderStatus, deleteOrder, addOrder, addCustomer, addTx } = useStore();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [st, setSt] = useState<OrderStatus | "all">("all");
  const [src, setSrc] = useState<OrderSource | "all">("all");
  const [limit, setLimit] = useState(PAGE);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const cust = (id: string) => customers.find((c) => c.id === id);
  const prod = (id: string) => products.find((p) => p.id === id);
  const itemsText = (o: Order) => o.items.map((i) => `${prod(i.productId) ? tl(prod(i.productId)!.name) : "—"}`).join(", ");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (st !== "all" && o.status !== st) return false;
      if (src !== "all" && o.source !== src) return false;
      if (!s) return true;
      return o.num.toLowerCase().includes(s) || (cust(o.customerId)?.name.toLowerCase().includes(s) ?? false) || itemsText(o).toLowerCase().includes(s);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, q, st, src, customers, products]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: orders.length };
    orders.forEach((o) => (m[o.status] = (m[o.status] ?? 0) + 1));
    return m;
  }, [orders]);

  const open = orders.find((o) => o.id === openId);
  const openCust = open ? cust(open.customerId) : undefined;

  const changeStatus = (o: Order, s: OrderStatus) => {
    setOrderStatus(o.id, s);
    if (s === "delivered" && o.total > o.paid) {
      addTx({ date: new Date().toISOString(), type: "income", category: "sales", amount: o.total - o.paid, note: o.num, orderId: o.id });
      updateOrder(o.id, { paid: o.total });
    }
    if (s === "cancelled") updateOrder(o.id, { paid: o.paid });
    toast(t("ord.statusChanged"));
  };

  return (
    <>
      <AdminHeader title={t("adm.title.orders")} actions={<Button onClick={() => setCreating(true)}><Plus size={17} />{t("ord.new")}</Button>} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 sm:max-w-md">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder={t("ord.searchPh")} className="!rounded-full !pl-11" aria-label={t("common.search")} />
        </div>
        <Select value={src} onChange={(e) => { setSrc(e.target.value as OrderSource | "all"); setLimit(PAGE); }} className="!w-auto !rounded-full" aria-label={t("ord.source")}>
          <option value="all">{t("ord.source")}: {t("common.all")}</option>
          {SOURCES.map((s) => <option key={s} value={s}>{t(`src.${s}`)}</option>)}
        </Select>
      </div>
      <div className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 py-1">
        {(["all", ...STATUSES] as const).map((s) => (
          <button key={s} onClick={() => { setSt(s); setLimit(PAGE); }} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${st === s ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-surface text-muted hover:text-fg"}`}>
            {s === "all" ? t("ord.allStatuses") : t(`status.${s}`)}
            <span className={`rounded-full px-1.5 text-xs ${st === s ? "bg-white/20" : "bg-surface-2"}`}>{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      <Card pad={false}>
        {filtered.length === 0 ? <Empty text={t("ord.empty")} /> : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="tbl">
                <thead><tr><th>{t("ord.num")}</th><th>{t("ord.customer")}</th><th>{t("ord.product")}</th><th>{t("common.date")}</th><th>{t("common.status")}</th><th className="num">{t("ord.amount")}</th></tr></thead>
                <tbody>
                  {filtered.slice(0, limit).map((o) => (
                    <tr key={o.id} onClick={() => setOpenId(o.id)} className="cursor-pointer">
                      <td className="font-semibold">{o.num}<div className="mt-0.5"><Badge>{t(`src.${o.source}`)}</Badge></div></td>
                      <td><div className="flex items-center gap-3"><Avatar name={cust(o.customerId)?.name ?? "?"} /><span className="max-w-[180px] truncate font-medium">{cust(o.customerId)?.name ?? "—"}</span></div></td>
                      <td className="max-w-[240px] text-muted"><span className="line-clamp-2">{itemsText(o) || "—"}</span></td>
                      <td className="whitespace-nowrap text-muted">{date(o.date)}</td>
                      <td><StatusBadge s={o.status} /></td>
                      <td className="num font-semibold">{o.total ? money(o.total) : <span className="font-normal text-muted">{t("ord.pending")}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-line md:hidden">
              {filtered.slice(0, limit).map((o) => (
                <li key={o.id}>
                  <button onClick={() => setOpenId(o.id)} className="flex w-full flex-col gap-2 px-5 py-4 text-left">
                    <div className="flex items-center justify-between"><b>{o.num}</b><StatusBadge s={o.status} /></div>
                    <p className="text-sm">{cust(o.customerId)?.name}</p>
                    <p className="line-clamp-1 text-sm text-muted">{itemsText(o) || "—"}</p>
                    <div className="flex items-center justify-between text-sm"><span className="text-muted">{date(o.date)}</span><b>{o.total ? money(o.total) : t("ord.pending")}</b></div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-line px-5 py-4 text-sm text-muted">
              <span>{t("common.shown")}: {Math.min(limit, filtered.length)} {t("common.of")} {filtered.length}</span>
              {limit < filtered.length && <Button size="sm" variant="outline" onClick={() => setLimit(limit + PAGE)}>{t("ord.more", { n: Math.min(PAGE, filtered.length - limit) })}</Button>}
            </div>
          </>
        )}
      </Card>

      {/* Details drawer */}
      <Modal side open={!!open} onClose={() => setOpenId(null)} title={open ? `${t("ord.details")} · ${open.num}` : ""}
        footer={open && <Button variant="ghost" className="!text-red-600" onClick={() => { if (confirm(t("common.confirmDelete"))) { deleteOrder(open.id); setOpenId(null); toast(t("common.deleted")); } }}><Trash2 size={16} />{t("common.delete")}</Button>}>
        {open && (
          <div className="space-y-7">
            <div className="flex items-center justify-between"><StatusBadge s={open.status} /><span className="text-sm text-muted">{date(open.date)} · {t(`src.${open.source}`)}</span></div>

            <div className="flex items-center gap-4 rounded-2xl bg-surface-2 p-4">
              <Avatar name={openCust?.name ?? "?"} size={46} />
              <div className="min-w-0"><p className="truncate font-semibold">{openCust?.name}</p><p className="text-sm text-muted">{openCust?.phone} · {open.city}</p></div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold">{t("ord.timeline")}</h3>
              <ol className="space-y-0">
                {FLOW.map((s, i) => {
                  const idx = FLOW.indexOf(open.status);
                  const done = open.status !== "cancelled" && i <= idx;
                  return (
                    <li key={s} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <button onClick={() => open.status !== s && changeStatus(open, s)} aria-label={t(`status.${s}`)} className={`grid size-7 place-items-center rounded-full border-2 transition ${done ? "border-brand-600 bg-brand-600 text-white" : "border-line text-transparent hover:border-brand-400"}`}><Check size={14} strokeWidth={3} /></button>
                        {i < FLOW.length - 1 && <span className={`h-6 w-0.5 ${done && i < idx ? "bg-brand-600" : "bg-line"}`} />}
                      </div>
                      <span className={`pt-0.5 text-[15px] ${done ? "font-semibold" : "text-muted"}`}>{t(`status.${s}`)}</span>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-4 flex flex-wrap gap-2">
                <Select value={open.status} onChange={(e) => changeStatus(open, e.target.value as OrderStatus)} className="!w-auto !rounded-full" aria-label={t("ord.changeStatus")}>
                  {STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
                </Select>
                {open.status !== "cancelled" && <Button variant="outline" size="sm" className="!h-11" onClick={() => changeStatus(open, "cancelled")}>{t("status.cancelled")}</Button>}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-bold">{t("ord.items")}</h3>
              {open.items.length === 0 ? <p className="text-sm text-muted">—</p> : (
                <ul className="divide-y divide-line rounded-2xl border border-line">
                  {open.items.map((it, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <span className="font-medium">{prod(it.productId) ? tl(prod(it.productId)!.name) : "—"}</span>
                      <span className="shrink-0 text-muted">× {it.qty} · {money((prod(it.productId)?.price ?? 0) * it.qty)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label={`${t("ord.amount")}, ${t("common.currency")}`}>
                <Input type="number" min={0} value={open.total} onChange={(e) => updateOrder(open.id, { total: Math.max(0, Number(e.target.value) || 0) })} />
              </Field>
              <Field label={t("ord.paid")}><div className="flex h-11 items-center rounded-xl bg-surface-2 px-3.5 font-semibold tabular-nums">{money(open.paid)}</div></Field>
            </div>
            <Field label={t("ord.note")}><Textarea defaultValue={open.note} onBlur={(e) => updateOrder(open.id, { note: e.target.value })} /></Field>
          </div>
        )}
      </Modal>

      <NewOrder open={creating} onClose={() => setCreating(false)} onCreate={(o, newCust) => {
        const cid = newCust ? addCustomer({ ...newCust, type: "private" }).id : o.customerId;
        addOrder({ ...o, customerId: cid });
        setCreating(false);
        toast(t("ord.created"));
      }} />
    </>
  );
}

function NewOrder({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (o: Omit<Order, "id" | "num">, newCust?: { name: string; phone: string; city: string }) => void }) {
  const { t, tl } = useI18n();
  const { customers, products } = useStore();
  const toast = useToast();
  const init = { mode: "existing" as "existing" | "new", cid: "", name: "", phone: "", city: "Душанбе", lines: [{ productId: "", qty: 1 }], source: "phone" as OrderSource, status: "processing" as OrderStatus, note: "", total: "" };
  const [f, setF] = useState(init);
  const auto = f.lines.reduce((s, l) => s + (products.find((p) => p.id === l.productId)?.price ?? 0) * l.qty, 0);

  const submit = () => {
    const valid = f.lines.filter((l) => l.productId);
    if (valid.length === 0 || (f.mode === "existing" ? !f.cid : !f.name.trim() || !f.phone.trim())) return toast(t("common.required"));
    const total = f.total === "" ? auto : Number(f.total) || 0;
    const city = f.mode === "existing" ? customers.find((c) => c.id === f.cid)?.city ?? "—" : f.city;
    onCreate(
      { customerId: f.cid, items: valid, total, paid: f.status === "new" ? 0 : Math.round(total * 0.5), date: new Date().toISOString(), status: f.status, source: f.source, city, note: f.note || undefined },
      f.mode === "new" ? { name: f.name.trim(), phone: f.phone.trim(), city: f.city } : undefined,
    );
    setF(init);
  };

  return (
    <Modal open={open} onClose={onClose} title={t("ord.new")} wide footer={<><Button variant="ghost" onClick={onClose}>{t("common.cancel")}</Button><Button onClick={submit}>{t("common.save")}</Button></>}>
      <div className="space-y-5">
        <div className="inline-flex rounded-full bg-surface-2 p-1 text-sm font-semibold">
          {(["existing", "new"] as const).map((m) => <button key={m} onClick={() => setF({ ...f, mode: m })} className={`rounded-full px-4 py-1.5 transition ${f.mode === m ? "bg-brand-600 text-white" : "text-muted"}`}>{t(m === "existing" ? "ord.customerExisting" : "ord.customerNew")}</button>)}
        </div>
        {f.mode === "existing" ? (
          <Field label={t("ord.customer")}>
            <Select value={f.cid} onChange={(e) => setF({ ...f, cid: e.target.value })}><option value="">—</option>{customers.slice(0, 200).map((c) => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}</Select>
          </Field>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("common.name")}><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label={t("common.phone")}><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
            <Field label={t("common.city")}><Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></Field>
          </div>
        )}
        <div className="space-y-3">
          {f.lines.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_90px_auto] gap-3">
              <Select value={l.productId} onChange={(e) => setF({ ...f, lines: f.lines.map((x, j) => (j === i ? { ...x, productId: e.target.value } : x)) })} aria-label={t("ord.product")}><option value="">{t("ord.product")}…</option>{products.map((p) => <option key={p.id} value={p.id}>{tl(p.name)}</option>)}</Select>
              <Input type="number" min={1} value={l.qty} onChange={(e) => setF({ ...f, lines: f.lines.map((x, j) => (j === i ? { ...x, qty: Math.max(1, Number(e.target.value) || 1) } : x)) })} aria-label={t("ord.qty")} />
              <Button variant="ghost" size="sm" className="!h-11" disabled={f.lines.length === 1} onClick={() => setF({ ...f, lines: f.lines.filter((_, j) => j !== i) })} aria-label={t("common.delete")}><Trash2 size={16} /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setF({ ...f, lines: [...f.lines, { productId: "", qty: 1 }] })}><Plus size={15} />{t("ord.addLine")}</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t("ord.source")}><Select value={f.source} onChange={(e) => setF({ ...f, source: e.target.value as OrderSource })}>{SOURCES.map((s) => <option key={s} value={s}>{t(`src.${s}`)}</option>)}</Select></Field>
          <Field label={t("common.status")}><Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as OrderStatus })}>{STATUSES.filter((s) => s !== "cancelled").map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}</Select></Field>
          <Field label={`${t("ord.amount")}, ${t("common.currency")}`} hint={`≈ ${auto}`}><Input type="number" min={0} placeholder={String(auto)} value={f.total} onChange={(e) => setF({ ...f, total: e.target.value })} /></Field>
        </div>
        <Field label={t("ord.note")}><Textarea value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}

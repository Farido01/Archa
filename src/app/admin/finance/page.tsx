"use client";

import { Banknote, Percent, PiggyBank, Plus, Search, Trash2, TrendingDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Area, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminHeader, Card, ChartTooltip, COLORS, compact, Delta, Empty, StatCard, axisProps, useNow } from "@/components/admin-ui";
import { Button, Field, Input, Modal, Segmented, Select, useToast } from "@/components/ui";
import { buildBuckets, buildSeries, inRange, pctDelta, totals, type Period } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { ExpenseCategory, IncomeCategory } from "@/lib/types";

const EXP: ExpenseCategory[] = ["materials", "salary", "rent", "logistics", "marketing", "utilities", "other"];
const INC: IncomeCategory[] = ["sales", "prepayment", "service"];
const PAGE = 12;

export default function FinancePage() {
  const { t, money, date } = useI18n();
  const { txs, orders, addTx, deleteTx } = useStore();
  const toast = useToast();
  const now = useNow();
  const [period, setPeriod] = useState<Period>("month");
  const [ft, setFt] = useState<"all" | "income" | "expense">("all");
  const [fc, setFc] = useState("all");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ type: "expense" as "income" | "expense", category: "materials", amount: "", note: "", date: new Date().toISOString().slice(0, 10) });

  const { cur, tc, tp } = useMemo(() => {
    const cur = buildSeries(buildBuckets(period, now, 0, t), txs, orders);
    const prev = buildSeries(buildBuckets(period, now, 1, t), txs, orders);
    return { cur, tc: totals(cur), tp: totals(prev) };
  }, [period, now, txs, orders, t]);

  const start = cur[0].start, end = cur[cur.length - 1].end;
  const inPeriod = useMemo(() => txs.filter((x) => inRange(x.date, start, end)), [txs, start, end]);
  const byCat = useMemo(() => {
    const m = new Map<string, number>();
    inPeriod.filter((x) => x.type === "expense").forEach((x) => m.set(x.category, (m.get(x.category) ?? 0) + x.amount));
    return EXP.map((c, i) => ({ key: c, name: t(`cat.${c}`), value: m.get(c) ?? 0, color: COLORS.palette[i] })).filter((x) => x.value > 0).sort((a, b) => b.value - a.value);
  }, [inPeriod, t]);

  const list = inPeriod.filter((x) => (ft === "all" || x.type === ft) && (fc === "all" || x.category === fc) && (!q || x.note.toLowerCase().includes(q.toLowerCase()) || t(`cat.${x.category}`).toLowerCase().includes(q.toLowerCase())));
  const margin = tc.income ? (tc.profit / tc.income) * 100 : 0;
  const prevMargin = tp.income ? (tp.profit / tp.income) * 100 : 0;
  const cats = f.type === "income" ? INC : EXP;

  const save = () => {
    const amount = Number(f.amount);
    if (!amount || amount <= 0 || !f.note.trim()) return toast(t("common.required"));
    addTx({ date: new Date(`${f.date}T12:00:00`).toISOString(), type: f.type, category: f.category as ExpenseCategory, amount, note: f.note.trim() });
    setAdding(false);
    setF({ ...f, amount: "", note: "" });
    toast(t("fin.txAdded"));
  };

  const cmp = [
    { label: t("fin.income"), a: tc.income, b: tp.income, color: COLORS.income },
    { label: t("fin.expense"), a: tc.expense, b: tp.expense, color: COLORS.expense, invert: true },
    { label: t("fin.profit"), a: tc.profit, b: tp.profit, color: COLORS.profit },
  ];

  return (
    <>
      <AdminHeader title={t("adm.title.finance")} sub={t("fin.formula")}
        actions={<><Segmented value={period} onChange={(p) => { setPeriod(p); setLimit(PAGE); }} options={[{ value: "week", label: t("period.week") }, { value: "month", label: t("period.month") }, { value: "year", label: t("period.year") }]} /><Button onClick={() => setAdding(true)}><Plus size={17} />{t("fin.add")}</Button></>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("fin.income")} value={tc.income} format={money} delta={pctDelta(tc.income, tp.income)} icon={Banknote} />
        <StatCard label={t("fin.expense")} value={tc.expense} format={money} delta={pctDelta(tc.expense, tp.expense)} invert icon={TrendingDown} color={COLORS.expense} />
        <StatCard label={t("fin.profit")} value={tc.profit} format={money} delta={pctDelta(tc.profit, tp.profit)} icon={PiggyBank} color={COLORS.profit} hint={t("kpi.formula")} />
        <StatCard label={t("fin.margin")} value={margin} format={(n) => `${n.toFixed(1)}%`} delta={prevMargin ? margin - prevMargin : null} icon={Percent} color="#5b8def" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.75fr_1fr]">
        <Card title={t("fin.dynamics")}>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cur} margin={{ top: 8, right: 4, left: -4, bottom: 0 }}>
                <defs>
                  <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COLORS.income} stopOpacity={0.3} /><stop offset="1" stopColor={COLORS.income} stopOpacity={0} /></linearGradient>
                  <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COLORS.expense} stopOpacity={0.25} /><stop offset="1" stopColor={COLORS.expense} stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="label" {...axisProps} interval={period === "month" ? 1 : 0} />
                <YAxis {...axisProps} tickFormatter={compact} width={54} />
                <Tooltip content={<ChartTooltip formatter={money} />} />
                <Area dataKey="income" name={t("fin.income")} type="monotone" stroke={COLORS.income} strokeWidth={2.2} fill="url(#gi)" />
                <Area dataKey="expense" name={t("fin.expense")} type="monotone" stroke={COLORS.expense} strokeWidth={2.2} fill="url(#ge)" />
                <Line dataKey="profit" name={t("fin.profit")} type="monotone" stroke={COLORS.profit} strokeWidth={2.2} strokeDasharray="5 4" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={t("fin.byCat")}>
          {byCat.length === 0 ? <Empty text={t("common.none")} /> : (
            <>
              <div className="mx-auto h-[170px] w-[170px]">
                <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={byCat} dataKey="value" innerRadius={54} outerRadius={82} paddingAngle={2} stroke="none" cornerRadius={4}>{byCat.map((d) => <Cell key={d.key} fill={d.color} />)}</Pie><Tooltip content={<ChartTooltip formatter={money} />} /></PieChart></ResponsiveContainer>
              </div>
              <ul className="mt-4 space-y-2.5">
                {byCat.map((d) => (
                  <li key={d.key} className="flex items-center gap-3 text-sm"><i className="size-2.5 rounded-full" style={{ background: d.color }} /><span className="flex-1">{d.name}</span><span className="tabular-nums text-muted">{money(d.value)}</span><b className="w-10 text-right tabular-nums">{Math.round((d.value / tc.expense) * 100)}%</b></li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      <Card title={t("fin.compare")} className="mt-4">
        <div className="grid gap-6 md:grid-cols-3">
          {cmp.map((c) => {
            const mx = Math.max(Math.abs(c.a), Math.abs(c.b), 1);
            return (
              <div key={c.label}>
                <div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold">{c.label}</span><Delta pct={pctDelta(c.a, c.b)} invert={c.invert} /></div>
                {[[t("period.current"), c.a, 1], [t("period.previous"), c.b, 0.4]].map(([l, v, o]) => (
                  <div key={String(l)} className="mb-2.5">
                    <div className="mb-1 flex justify-between text-xs text-muted"><span>{l}</span><b className="tabular-nums text-fg">{money(Number(v))}</b></div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${(Math.abs(Number(v)) / mx) * 100}%`, background: c.color, opacity: Number(o) }} /></div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </Card>

      <Card title={t("fin.history")} className="mt-4" pad={false}
        action={<div className="flex flex-wrap gap-2">
          <div className="relative"><Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><Input value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder={t("fin.searchPh")} className="!h-9 !w-44 !rounded-full !pl-9 !text-sm" aria-label={t("common.search")} /></div>
          <Select value={ft} onChange={(e) => { setFt(e.target.value as typeof ft); setFc("all"); }} className="!h-9 !w-auto !rounded-full !text-sm" aria-label={t("fin.type")}><option value="all">{t("fin.allTypes")}</option><option value="income">{t("fin.income")}</option><option value="expense">{t("fin.expense")}</option></Select>
          <Select value={fc} onChange={(e) => setFc(e.target.value)} className="!h-9 !w-auto !rounded-full !text-sm" aria-label={t("fin.category")}><option value="all">{t("fin.allCats")}</option>{(ft === "income" ? INC : ft === "expense" ? EXP : [...INC, ...EXP]).map((c) => <option key={c} value={c}>{t(`cat.${c}`)}</option>)}</Select>
        </div>}>
        <div className="mt-4">
          {list.length === 0 ? <Empty text={t("common.none")} /> : (
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead><tr><th>{t("common.date")}</th><th>{t("fin.note")}</th><th>{t("fin.category")}</th><th className="num">{t("fin.amount")}</th><th className="w-12" /></tr></thead>
                <tbody>
                  {list.slice(0, limit).map((x) => (
                    <tr key={x.id}>
                      <td className="whitespace-nowrap text-muted">{date(x.date)}</td>
                      <td className="font-medium">{x.note}</td>
                      <td><span className="inline-flex items-center gap-2 text-muted"><i className={`size-2 rounded-full ${x.type === "income" ? "bg-brand-500" : "bg-amber-500"}`} />{t(`cat.${x.category}`)}</span></td>
                      <td className={`num font-semibold ${x.type === "income" ? "text-brand-600 dark:text-brand-300" : ""}`}>{x.type === "income" ? "+" : "−"}{money(x.amount)}</td>
                      <td><button onClick={() => { deleteTx(x.id); toast(t("common.deleted")); }} className="grid size-8 place-items-center rounded-full text-muted transition hover:bg-red-500/10 hover:text-red-600" aria-label={t("common.delete")}><Trash2 size={15} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-line px-5 py-4 text-sm text-muted">
            <span>{t("common.shown")}: {Math.min(limit, list.length)} {t("common.of")} {list.length} · {t("fin.profit")}: <b className="text-fg">{money(list.filter((x) => x.type === "income").reduce((s, x) => s + x.amount, 0) - list.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0))}</b></span>
            {limit < list.length && <Button size="sm" variant="outline" onClick={() => setLimit(limit + PAGE)}>{t("ord.more", { n: Math.min(PAGE, list.length - limit) })}</Button>}
          </div>
        </div>
      </Card>

      <Modal open={adding} onClose={() => setAdding(false)} title={t("fin.add")} footer={<><Button variant="ghost" onClick={() => setAdding(false)}>{t("common.cancel")}</Button><Button onClick={save}>{t("common.save")}</Button></>}>
        <div className="space-y-4">
          <div className="inline-flex rounded-full bg-surface-2 p-1 text-sm font-semibold">
            {(["expense", "income"] as const).map((k) => <button key={k} onClick={() => setF({ ...f, type: k, category: k === "income" ? "sales" : "materials" })} className={`rounded-full px-5 py-1.5 transition ${f.type === k ? "bg-brand-600 text-white" : "text-muted"}`}>{t(`fin.${k}`)}</button>)}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("fin.category")}><Select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{cats.map((c) => <option key={c} value={c}>{t(`cat.${c}`)}</option>)}</Select></Field>
            <Field label={t("common.date")}><Input type="date" value={f.date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          </div>
          <Field label={`${t("fin.amount")}, ${t("common.currency")} *`}><Input type="number" min={0} value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
          <Field label={`${t("fin.note")} *`}><Input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
          <p className="text-xs text-muted">{t("fin.formula")}</p>
        </div>
      </Modal>
    </>
  );
}

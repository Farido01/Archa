"use client";

import { AlertTriangle, ArrowRight, Banknote, Inbox, PiggyBank, ShoppingBag, TrendingDown, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Bar, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminHeader, Card, ChartTooltip, COLORS, compact, Empty, StatCard, StatusBadge, axisProps, useNow } from "@/components/admin-ui";
import { Segmented } from "@/components/ui";
import { buildBuckets, buildSeries, isActive, pctDelta, productStats, totals, type Period } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/products";
import { useStore } from "@/lib/store";

export default function Overview() {
  const { t, tl, money, num, date } = useI18n();
  const { orders, txs, customers, products } = useStore();
  const now = useNow();
  const [period, setPeriod] = useState<Period>("month");

  const { cur, prev, tc, tp } = useMemo(() => {
    const b = buildBuckets(period, now, 0, t);
    const bp = buildBuckets(period, now, 1, t);
    const cur = buildSeries(b, txs, orders);
    const prev = buildSeries(bp, txs, orders);
    return { cur, prev, tc: totals(cur), tp: totals(prev) };
  }, [period, now, txs, orders, t]);

  const range = { start: cur[0].start, end: cur[cur.length - 1].end };
  const stats = useMemo(() => productStats(orders, products, range.start, range.end), [orders, products, range.start, range.end]);
  const catData = CATEGORIES.map((c, i) => ({ name: tl(c.name), value: Math.round(stats.revenueByCat.get(c.id) ?? 0), color: COLORS.palette[i] })).filter((x) => x.value > 0);
  const catTotal = catData.reduce((s, x) => s + x.value, 0);

  const newCustomers = customers.filter((c) => +new Date(c.created) >= range.start).length;
  const active = orders.filter(isActive).length;
  const leads = orders.filter((o) => o.status === "new").length;
  const low = products.filter((p) => p.stock <= p.minStock).length;
  const latest = orders.slice(0, 6);
  const recent = txs.slice(0, 8);
  const custOf = (id: string) => customers.find((c) => c.id === id)?.name ?? "—";
  const sp = (k: "income" | "expense" | "profit" | "orders") => cur.map((p) => p[k]);

  return (
    <>
      <AdminHeader
        title={t("adm.hello")}
        sub={t("adm.title.overview")}
        actions={<Segmented value={period} onChange={setPeriod} options={[{ value: "week", label: t("period.week") }, { value: "month", label: t("period.month") }, { value: "year", label: t("period.year") }]} />}
      />

      {(leads > 0 || low > 0) && (
        <div className="mb-6 grid gap-3 md:grid-cols-2">
          {leads > 0 && (
            <Link href="/admin/orders" className="group flex items-center gap-3 rounded-2xl border border-sky-500/25 bg-sky-500/8 px-4 py-3 text-sm font-medium transition hover:border-sky-500/50">
              <Inbox size={18} className="text-sky-600" /><span className="flex-1">{t("ov.newLeads", { n: leads })}</span><ArrowRight size={16} className="text-sky-600 transition group-hover:translate-x-1" />
            </Link>
          )}
          {low > 0 && (
            <Link href="/admin/inventory" className="group flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium transition hover:border-amber-500/60">
              <AlertTriangle size={18} className="text-amber-600" /><span className="flex-1">{t("ov.lowStock", { n: low })}</span><ArrowRight size={16} className="text-amber-600 transition group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label={t("kpi.revenue")} value={tc.income} format={money} delta={pctDelta(tc.income, tp.income)} icon={Banknote} spark={sp("income")} />
        <StatCard label={t("kpi.expenses")} value={tc.expense} format={money} delta={pctDelta(tc.expense, tp.expense)} invert icon={TrendingDown} color={COLORS.expense} spark={sp("expense")} />
        <StatCard label={t("kpi.profit")} value={tc.profit} format={money} delta={pctDelta(tc.profit, tp.profit)} icon={PiggyBank} color={COLORS.profit} spark={sp("profit")} hint={`${t("kpi.formula")} · ${tc.income ? ((tc.profit / tc.income) * 100).toFixed(1) : 0}%`} />
        <StatCard label={t("kpi.orders")} value={tc.orders} format={num} delta={pctDelta(tc.orders, tp.orders)} icon={ShoppingBag} color="#5b8def" spark={sp("orders")} />
        <StatCard label={t("kpi.customers")} value={customers.length} format={num} icon={Users} color="#b565a7" hint={`+${newCustomers} ${t("kpi.newCustomers")}`} />
        <StatCard label={t("kpi.active")} value={active} format={num} icon={Zap} color="#e07a5f" hint={`${leads} ${t("status.new").toLowerCase()}`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.75fr_1fr]">
        <Card title={t("ov.chart")} action={<div className="hidden items-center gap-4 text-xs text-muted sm:flex">{[["income", t("ov.income"), COLORS.income], ["expense", t("ov.expense"), COLORS.expense], ["profit", t("ov.profit"), COLORS.profit]].map(([k, l, c]) => <span key={k} className="flex items-center gap-1.5"><i className="size-2 rounded-full" style={{ background: c }} />{l}</span>)}</div>}>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cur} margin={{ top: 8, right: 4, left: -4, bottom: 0 }} barGap={2}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="label" {...axisProps} interval={period === "month" ? 1 : 0} />
                <YAxis {...axisProps} tickFormatter={compact} width={54} />
                <Tooltip cursor={{ fill: "var(--surface-2)", opacity: 0.6 }} content={<ChartTooltip formatter={money} />} />
                <Bar dataKey="income" name={t("ov.income")} fill={COLORS.income} radius={[5, 5, 0, 0]} maxBarSize={22} />
                <Bar dataKey="expense" name={t("ov.expense")} fill={COLORS.expense} radius={[5, 5, 0, 0]} maxBarSize={22} />
                <Line dataKey="profit" name={t("ov.profit")} type="monotone" stroke={COLORS.profit} strokeWidth={2.4} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={t("ov.salesByCat")}>
          {catData.length === 0 ? <Empty text={t("common.none")} /> : (
            <>
              <div className="relative mx-auto h-[190px] w-[190px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={catData} dataKey="value" innerRadius={62} outerRadius={90} paddingAngle={2} stroke="none" cornerRadius={5}>
                      {catData.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTooltip formatter={money} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div><p className="text-xs text-muted">{t("common.total")}</p><p className="text-lg font-bold tabular-nums">{compact(catTotal)}</p></div></div>
              </div>
              <ul className="mt-4 space-y-2.5">
                {catData.sort((a, b) => b.value - a.value).map((d) => (
                  <li key={d.name} className="flex items-center gap-3 text-sm">
                    <i className="size-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="flex-1 truncate">{d.name}</span>
                    <b className="tabular-nums">{Math.round((d.value / catTotal) * 100)}%</b>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card title={t("ov.newOrders")} pad={false} action={<Link href="/admin/orders" className="text-sm font-semibold text-brand-600 hover:underline">{t("ov.viewAll")}</Link>}>
          <div className="mt-3 overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>{t("ord.num")}</th><th>{t("ord.customer")}</th><th>{t("common.status")}</th><th className="num">{t("ord.amount")}</th></tr></thead>
              <tbody>
                {latest.map((o) => (
                  <tr key={o.id}>
                    <td className="font-semibold"><Link href="/admin/orders" className="hover:text-brand-600">{o.num}</Link><div className="text-xs font-normal text-muted">{date(o.date)}</div></td>
                    <td className="max-w-[200px] truncate">{custOf(o.customerId)}</td>
                    <td><StatusBadge s={o.status} /></td>
                    <td className="num font-semibold">{o.total ? money(o.total) : <span className="font-normal text-muted">{t("ord.pending")}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title={t("ov.recentTx")} action={<Link href="/admin/finance" className="text-sm font-semibold text-brand-600 hover:underline">{t("ov.viewAll")}</Link>}>
          <ul className="divide-y divide-line">
            {recent.map((x) => (
              <li key={x.id} className="flex items-center gap-3 py-3">
                <span className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold ${x.type === "income" ? "bg-brand-500/12 text-brand-600" : "bg-amber-500/14 text-amber-700"}`}>{x.type === "income" ? "+" : "−"}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{x.note}</p><p className="text-xs text-muted">{t(`cat.${x.category}`)} · {date(x.date, false)}</p></div>
                <b className={`text-sm tabular-nums ${x.type === "income" ? "text-brand-600 dark:text-brand-300" : ""}`}>{x.type === "income" ? "+" : "−"}{money(x.amount)}</b>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

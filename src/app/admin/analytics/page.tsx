"use client";

import { Download, Percent, Receipt, Repeat, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminHeader, Card, ChartTooltip, COLORS, compact, Delta, StatCard, axisProps, useNow } from "@/components/admin-ui";
import { ProductArt } from "@/components/art";
import { Button, Segmented, useToast } from "@/components/ui";
import { buildBuckets, buildSeries, downloadCsv, inRange, pctDelta, productStats, totals, type Period } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { OrderSource } from "@/lib/types";

const SRC: OrderSource[] = ["site", "phone", "instagram", "showroom"];

export default function AnalyticsPage() {
  const { t, tl, money, num } = useI18n();
  const { orders, txs, products } = useStore();
  const toast = useToast();
  const now = useNow();
  const [period, setPeriod] = useState<Period>("year");

  const d = useMemo(() => {
    const bc = buildBuckets(period, now, 0, t), bp = buildBuckets(period, now, 1, t);
    const cur = buildSeries(bc, txs, orders), prev = buildSeries(bp, txs, orders);
    const months = buildSeries(buildBuckets("year", now, 0, t), txs, orders);
    const range = { s: bc[0].start, e: bc[bc.length - 1].end, ps: bp[0].start, pe: bp[bp.length - 1].end };
    const eff = (s: number, e: number) => {
      const os = orders.filter((o) => inRange(o.date, s, e));
      const valid = os.filter((o) => o.status !== "cancelled" && o.total > 0);
      const done = os.filter((o) => o.status === "delivered").length;
      return {
        avg: valid.length ? valid.reduce((a, o) => a + o.total, 0) / valid.length : 0,
        completion: os.length ? (done / os.length) * 100 : 0,
        cancel: os.length ? (os.filter((o) => o.status === "cancelled").length / os.length) * 100 : 0,
        bySrc: SRC.map((k) => os.filter((o) => o.source === k).length),
        n: os.length,
      };
    };
    const e1 = eff(range.s, range.e), e0 = eff(range.ps, range.pe);
    const stats = productStats(orders, products, range.s, range.e);
    // повторные клиенты: >1 заказа за период
    const seen = new Map<string, number>();
    orders.filter((o) => inRange(o.date, range.s, range.e) && o.status !== "cancelled").forEach((o) => seen.set(o.customerId, (seen.get(o.customerId) ?? 0) + 1));
    const repeat = seen.size ? ([...seen.values()].filter((v) => v > 1).length / seen.size) * 100 : 0;
    return { cur, prev, months, tc: totals(cur), tp: totals(prev), e1, e0, top: stats.top.slice(0, 6), repeat };
  }, [period, now, txs, orders, products, t]);

  const maxQty = d.top[0]?.qty ?? 1;
  const srcData = SRC.map((k, i) => ({ name: t(`src.${k}`), value: d.e1.bySrc[i], color: COLORS.palette[i] })).filter((x) => x.value > 0);

  const exportCsv = () => {
    downloadCsv(`archa-report-${period}.csv`, [
      [t("common.date"), t("fin.income"), t("fin.expense"), t("fin.profit"), t("kpi.orders")],
      ...d.cur.map((p) => [p.label, p.income, p.expense, p.profit, p.orders]),
      [t("common.total"), d.tc.income, d.tc.expense, d.tc.profit, d.tc.orders],
    ]);
    toast(t("an.exported"));
  };

  return (
    <>
      <AdminHeader title={t("adm.title.analytics")}
        actions={<><Segmented value={period} onChange={setPeriod} options={[{ value: "week", label: t("period.week") }, { value: "month", label: t("period.month") }, { value: "year", label: t("period.year") }]} /><Button variant="outline" onClick={exportCsv}><Download size={16} />{t("an.export")}</Button></>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("kpi.avgCheck")} value={d.e1.avg} format={money} delta={pctDelta(d.e1.avg, d.e0.avg)} icon={Receipt} />
        <StatCard label={t("an.completion")} value={d.e1.completion} format={(n) => `${n.toFixed(1)}%`} delta={pctDelta(d.e1.completion, d.e0.completion)} icon={Percent} color="#5b8def" />
        <StatCard label={t("an.cancelRate")} value={d.e1.cancel} format={(n) => `${n.toFixed(1)}%`} delta={pctDelta(d.e1.cancel, d.e0.cancel)} invert icon={XCircle} color="#e07a5f" />
        <StatCard label={t("an.repeat")} value={d.repeat} format={(n) => `${n.toFixed(1)}%`} icon={Repeat} color="#b565a7" hint="" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card title={t("an.revDyn")}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.cur.map((p, i) => ({ ...p, prevIncome: d.prev[i]?.income ?? 0 }))} margin={{ top: 8, right: 4, left: -4, bottom: 0 }}>
                <defs><linearGradient id="ra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COLORS.income} stopOpacity={0.35} /><stop offset="1" stopColor={COLORS.income} stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="label" {...axisProps} interval={period === "month" ? 1 : 0} />
                <YAxis {...axisProps} tickFormatter={compact} width={54} />
                <Tooltip content={<ChartTooltip formatter={money} />} />
                <Area dataKey="prevIncome" name={t("period.previous")} type="monotone" stroke="var(--muted)" strokeWidth={1.6} strokeDasharray="4 4" fill="none" />
                <Area dataKey="income" name={t("period.current")} type="monotone" stroke={COLORS.income} strokeWidth={2.4} fill="url(#ra)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 flex items-center gap-2 text-xs text-muted">{t("an.compare")}: <Delta pct={pctDelta(d.tc.income, d.tp.income)} /></p>
        </Card>

        <Card title={t("an.profitByMonth")}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.months} margin={{ top: 8, right: 4, left: -4, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} tickFormatter={compact} width={54} />
                <Tooltip cursor={{ fill: "var(--surface-2)", opacity: 0.6 }} content={<ChartTooltip formatter={money} />} />
                <Bar dataKey="profit" name={t("fin.profit")} radius={[6, 6, 0, 0]} maxBarSize={28}>
                  {d.months.map((m) => <Cell key={m.start} fill={m.profit >= 0 ? COLORS.profit : "#e07a5f"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-muted">{t("period.last12")}</p>
        </Card>

        <Card title={t("an.ordersCount")}>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.cur} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="label" {...axisProps} interval={period === "month" ? 1 : 0} />
                <YAxis {...axisProps} allowDecimals={false} width={40} />
                <Tooltip cursor={{ fill: "var(--surface-2)", opacity: 0.6 }} content={<ChartTooltip formatter={num} />} />
                <Bar dataKey="orders" name={t("kpi.orders")} fill="#5b8def" radius={[6, 6, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={t("an.bySource")}>
          <div className="flex flex-wrap items-center gap-8">
            <div className="h-[200px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={srcData} dataKey="value" innerRadius={58} outerRadius={90} paddingAngle={2} stroke="none" cornerRadius={5}>{srcData.map((s) => <Cell key={s.name} fill={s.color} />)}</Pie><Tooltip content={<ChartTooltip formatter={num} />} /></PieChart></ResponsiveContainer>
            </div>
            <ul className="min-w-[160px] flex-1 space-y-3">
              {srcData.map((s) => <li key={s.name} className="flex items-center gap-3 text-sm"><i className="size-2.5 rounded-full" style={{ background: s.color }} /><span className="flex-1">{s.name}</span><b className="tabular-nums">{s.value}</b></li>)}
            </ul>
          </div>
        </Card>

        <Card title={t("an.popular")} className="xl:col-span-2">
          <ul className="grid gap-x-10 gap-y-4 md:grid-cols-2">
            {d.top.map(({ product: p, qty }, i) => (
              <li key={p.id} className="flex items-center gap-4">
                <span className="w-5 text-sm font-bold text-muted">{i + 1}</span>
                <div className="size-12 shrink-0 overflow-hidden rounded-xl"><ProductArt product={p} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3 text-sm"><span className="truncate font-semibold">{tl(p.name)}</span><span className="shrink-0 tabular-nums text-muted">{num(qty)} {t("common.pcs")}</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand-500 transition-all duration-700" style={{ width: `${(qty / maxQty) * 100}%` }} /></div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

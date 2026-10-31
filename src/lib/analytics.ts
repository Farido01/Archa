import { DAY, startOfDay } from "./seed";
import type { Customer, Order, Product, Tx } from "./types";

export type Period = "week" | "month" | "year";

export interface Bucket {
  label: string;
  start: number;
  end: number;
}

export interface Point extends Bucket {
  income: number;
  expense: number;
  profit: number;
  orders: number;
}

type T = (k: string) => string;

/** offset=0 — текущий период, offset=1 — предыдущий такой же длины. */
export function buildBuckets(period: Period, now: number, offset: number, t: T): Bucket[] {
  const today = startOfDay(now).getTime();
  const out: Bucket[] = [];
  if (period === "year") {
    const base = new Date(today);
    for (let i = 11; i >= 0; i--) {
      const s = new Date(base.getFullYear(), base.getMonth() - i - 12 * offset, 1);
      const e = new Date(s.getFullYear(), s.getMonth() + 1, 1);
      out.push({ label: t(`m.${s.getMonth()}`), start: s.getTime(), end: e.getTime() });
    }
    return out;
  }
  // неделя — 7 дней, месяц — 10 отрезков по 3 дня (график без дневного «шума»)
  const step = period === "week" ? 1 : 3;
  const count = period === "week" ? 7 : 10;
  for (let i = count - 1; i >= 0; i--) {
    const s = new Date(today);
    s.setDate(s.getDate() - (i + 1) * step + 1 - count * step * offset);
    const e = new Date(s);
    e.setDate(e.getDate() + step);
    out.push({
      label: period === "week" ? t(`wd.${s.getDay()}`) : `${s.getDate()} ${t(`m.${s.getMonth()}`)}`,
      start: s.getTime(),
      end: e.getTime(),
    });
  }
  return out;
}

export function buildSeries(buckets: Bucket[], txs: Tx[], orders: Order[]): Point[] {
  const pts: Point[] = buckets.map((b) => ({ ...b, income: 0, expense: 0, profit: 0, orders: 0 }));
  const lo = buckets[0].start;
  const hi = buckets[buckets.length - 1].end;
  const idx = (ts: number) => pts.findIndex((p) => ts >= p.start && ts < p.end);
  for (const x of txs) {
    const ts = +new Date(x.date);
    if (ts < lo || ts >= hi) continue;
    const i = idx(ts);
    if (i < 0) continue;
    if (x.type === "income") pts[i].income += x.amount;
    else pts[i].expense += x.amount;
  }
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    const ts = +new Date(o.date);
    if (ts < lo || ts >= hi) continue;
    const i = idx(ts);
    if (i >= 0) pts[i].orders++;
  }
  // Чистая прибыль = доходы − расходы
  for (const p of pts) p.profit = p.income - p.expense;
  return pts;
}

export const totals = (pts: Point[]) =>
  pts.reduce(
    (a, p) => ({ income: a.income + p.income, expense: a.expense + p.expense, profit: a.profit + p.profit, orders: a.orders + p.orders }),
    { income: 0, expense: 0, profit: 0, orders: 0 },
  );

export const pctDelta = (cur: number, prev: number) => (prev === 0 ? null : ((cur - prev) / Math.abs(prev)) * 100);

export const inRange = (iso: string, start: number, end: number) => {
  const t = +new Date(iso);
  return t >= start && t < end;
};

export function productStats(orders: Order[], products: Product[], start: number, end: number) {
  const byId = new Map(products.map((p) => [p.id, p]));
  const units = new Map<string, number>();
  const revenueByCat = new Map<string, number>();
  for (const o of orders) {
    if (o.status === "cancelled" || !inRange(o.date, start, end)) continue;
    const raw = o.items.reduce((s, it) => s + it.qty * (byId.get(it.productId)?.price ?? 0), 0);
    for (const it of o.items) {
      const p = byId.get(it.productId);
      if (!p) continue;
      units.set(p.id, (units.get(p.id) ?? 0) + it.qty);
      if (raw > 0 && o.total > 0) {
        const share = (it.qty * p.price) / raw;
        revenueByCat.set(p.category, (revenueByCat.get(p.category) ?? 0) + o.total * share);
      }
    }
  }
  const top = [...units.entries()]
    .map(([id, qty]) => ({ product: byId.get(id)!, qty }))
    .sort((a, b) => b.qty - a.qty);
  return { top, revenueByCat };
}

export function customerStats(c: Customer, orders: Order[]) {
  const mine = orders.filter((o) => o.customerId === c.id);
  const valid = mine.filter((o) => o.status !== "cancelled");
  const spent = valid.reduce((s, o) => s + o.total, 0);
  const last = mine.reduce((m, o) => Math.max(m, +new Date(o.date)), +new Date(c.created));
  return { orders: mine, count: valid.length, spent, last };
}

export const ACTIVE = ["new", "processing", "production", "ready"] as const;
export const isActive = (o: Order) => (ACTIVE as readonly string[]).includes(o.status);

export const periodDays = (p: Period) => (p === "week" ? 7 : p === "month" ? 30 : 365);
export { DAY };

export function downloadCsv(name: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const blob = new Blob(["﻿" + rows.map((r) => r.map(esc).join(";")).join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

"use client";

import { animate } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Inbox } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Badge } from "./ui";
import { useI18n } from "@/lib/i18n";
import type { OrderStatus } from "@/lib/types";

export const COLORS = {
  income: "#12843f",
  expense: "#d19b2f",
  profit: "#2a9d8f",
  palette: ["#12843f", "#d19b2f", "#2a9d8f", "#5b8def", "#b565a7", "#e07a5f", "#7a8b82"],
};

export const compact = (n: number) => {
  const a = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (a >= 1e6) return `${sign}${(a / 1e6).toFixed(1).replace(".0", "")}M`;
  if (a >= 1e3) return `${sign}${Math.round(a / 1e3)}k`;
  return `${n}`;
};

export const useNow = () => useMemo(() => Date.now(), []);

export function AdminHeader({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">{title}</h1>
        {sub && <p className="mt-1 text-[15px] text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, action, children, className = "", pad = true }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={`rounded-3xl border border-line bg-surface shadow-soft ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6">
          {title && <h2 className="text-[15px] font-bold tracking-tight">{title}</h2>}
          {action}
        </div>
      )}
      <div className={pad ? "p-5 sm:p-6" : ""}>{children}</div>
    </section>
  );
}

export function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const c = animate(from.current, value, { duration: 0.8, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(v) });
    from.current = value;
    return () => c.stop();
  }, [value]);
  return <>{format(shown)}</>;
}

export function Delta({ pct, invert = false }: { pct: number | null; invert?: boolean }) {
  if (pct === null) return <span className="text-xs text-muted">—</span>;
  const up = pct >= 0;
  const good = invert ? !up : up;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold ${good ? "bg-brand-500/12 text-brand-600 dark:text-brand-300" : "bg-red-500/12 text-red-600 dark:text-red-300"}`}>
      {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export function StatCard({
  label,
  value,
  format,
  delta,
  invert,
  icon: Icon,
  spark,
  color = COLORS.income,
  hint,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
  delta?: number | null;
  invert?: boolean;
  icon: React.ComponentType<{ size?: number }>;
  spark?: number[];
  color?: string;
  hint?: string;
}) {
  const { t } = useI18n();
  const gid = useMemo(() => `sp-${Math.random().toString(36).slice(2, 8)}`, []);
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        <span className="grid size-9 place-items-center rounded-xl" style={{ background: `${color}1f`, color }}><Icon size={18} /></span>
      </div>
      <p className="mt-3 text-[1.65rem] font-bold leading-none tracking-tight tabular-nums sm:text-[1.8rem]"><CountUp value={value} format={format} /></p>
      <div className="mt-3 flex min-h-6 items-center gap-2">
        {delta !== undefined && <Delta pct={delta} invert={invert} />}
        <span className="text-xs text-muted">{hint ?? (delta !== undefined ? t("period.vsPrev") : "")}</span>
      </div>
      {spark && spark.length > 1 && (
        <div className="pointer-events-none absolute bottom-0 right-0 h-14 w-28 opacity-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark.map((v) => ({ v }))} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={color} stopOpacity={0.35} />
                  <stop offset="1" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} fill={`url(#${gid})`} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function ChartTooltip({ active, payload, label, formatter }: { active?: boolean; payload?: { name?: string; value?: number; color?: string; dataKey?: string }[]; label?: string | number; formatter: (n: number) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm shadow-lift">
      {label !== undefined && <p className="mb-1.5 font-semibold">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-muted">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <b className="text-fg tabular-nums">{formatter(Number(p.value ?? 0))}</b>
        </p>
      ))}
    </div>
  );
}

export const axisProps = {
  tick: { fill: "var(--muted)", fontSize: 12 },
  axisLine: false,
  tickLine: false,
} as const;

const STATUS_TONE: Record<OrderStatus, "blue" | "amber" | "violet" | "green" | "neutral" | "red"> = {
  new: "blue",
  processing: "amber",
  production: "violet",
  ready: "green",
  delivered: "neutral",
  cancelled: "red",
};
export const STATUSES: OrderStatus[] = ["new", "processing", "production", "ready", "delivered", "cancelled"];
export function StatusBadge({ s }: { s: OrderStatus }) {
  const { t } = useI18n();
  return <Badge tone={STATUS_TONE[s]}>{t(`status.${s}`)}</Badge>;
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center text-muted">
      <Inbox size={32} strokeWidth={1.4} />
      <p>{text}</p>
    </div>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.replace(/[«»()]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <span className="grid shrink-0 place-items-center rounded-full bg-brand-500/14 text-xs font-bold text-brand-600 dark:text-brand-300" style={{ width: size, height: size }}>
      {initials}
    </span>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useId, useState } from "react";
import { useI18n } from "@/lib/i18n";

/* ── Logo ─────────────────────────────────────────── */
export function Logo({ className = "", tone = "green" }: { className?: string; tone?: "green" | "white" }) {
  const c = tone === "white" ? "#fff" : "#0b7134";
  return (
    <svg viewBox="0 0 120 56" className={className} role="img" aria-label="Арча">
      <ellipse cx="60" cy="28" rx="55" ry="22" fill="none" stroke={c} strokeWidth="2" />
      <ellipse cx="60" cy="28" rx="50" ry="18" fill="none" stroke={c} strokeWidth="0.8" opacity="0.5" />
      <text x="60" y="36" textAnchor="middle" fontSize="25" fontStyle="italic" fontFamily="Georgia, 'Times New Roman', serif" fill={c} fontWeight="600">
        Арча
      </text>
    </svg>
  );
}

/* ── Button ───────────────────────────────────────── */
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "dark" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
};
export function Button({ variant = "primary", size = "md", className = "", ...p }: BtnProps) {
  const v = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-[0_8px_20px_-8px_rgba(11,113,52,.6)]",
    dark: "bg-ink text-white hover:bg-brand-900",
    ghost: "text-fg hover:bg-surface-2",
    outline: "border border-line bg-surface text-fg hover:border-brand-500 hover:text-brand-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
  }[variant];
  const s = { sm: "h-9 px-3.5 text-sm", md: "h-11 px-5 text-[15px]", lg: "h-14 px-8 text-base" }[size];
  return (
    <button
      {...p}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${v} ${s} ${className}`}
    />
  );
}

/* ── Field ────────────────────────────────────────── */
const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3.5 text-[15px] text-fg placeholder:text-muted/70 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10";

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
export const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className={`${inputCls} h-11 ${p.className ?? ""}`} />
);
export const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...p} className={`${inputCls} h-11 appearance-none bg-[right_0.9rem_center] bg-no-repeat pr-9 ${p.className ?? ""}`}
    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2393a799' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", ...p.style }} />
);
export const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...p} className={`${inputCls} min-h-24 py-3 ${p.className ?? ""}`} />
);

/* ── Badge ────────────────────────────────────────── */
export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "red" | "blue" | "violet" }) {
  const c = {
    neutral: "bg-surface-2 text-muted",
    green: "bg-brand-500/12 text-brand-600 dark:text-brand-300",
    amber: "bg-amber-500/14 text-amber-700 dark:text-amber-300",
    red: "bg-red-500/12 text-red-700 dark:text-red-300",
    blue: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
    violet: "bg-violet-500/12 text-violet-700 dark:text-violet-300",
  }[tone];
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${c}`}>{children}</span>;
}

/* ── Segmented ────────────────────────────────────── */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  const id = useId();
  return (
    <div className="relative inline-flex rounded-full border border-line bg-surface p-1" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${value === o.value ? "text-white" : "text-muted hover:text-fg"}`}
        >
          {value === o.value && (
            <motion.span layoutId={`seg-${id}`} className="absolute inset-0 -z-10 rounded-full bg-brand-600" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
          )}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ── Modal / Drawer ───────────────────────────────── */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  side = false,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: boolean;
  wide?: boolean;
}) {
  const { t } = useI18n();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className={`fixed inset-0 z-[100] flex ${side ? "justify-end" : "items-end justify-center sm:items-center sm:p-6"}`}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={side ? { x: "100%" } : { y: 40, opacity: 0, scale: 0.98 }}
            animate={side ? { x: 0 } : { y: 0, opacity: 1, scale: 1 }}
            exit={side ? { x: "100%" } : { y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 40 }}
            className={`relative flex max-h-[92dvh] w-full flex-col bg-surface text-fg shadow-lift ${
              side ? "h-full max-h-none max-w-xl rounded-l-3xl" : `${wide ? "max-w-3xl" : "max-w-lg"} rounded-t-3xl sm:rounded-3xl`
            }`}
          >
            <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
              <h2 className="text-lg font-bold tracking-tight">{title}</h2>
              <button onClick={onClose} aria-label={t("common.close")} className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-fg">
                <X size={18} />
              </button>
            </div>
            <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ── Toasts ───────────────────────────────────────── */
const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<{ id: number; msg: string }[]>([]);
  const push = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x, { id, msg }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[200] flex flex-col items-center gap-2 px-4" aria-live="polite">
        <AnimatePresence>
          {items.map((i) => (
            <motion.div
              key={i.id}
              initial={{ y: 20, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-ink py-2.5 pl-3 pr-5 text-sm font-medium text-white shadow-lift"
            >
              <span className="grid size-6 place-items-center rounded-full bg-brand-500">
                <Check size={14} strokeWidth={3} />
              </span>
              {i.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* ── Reveal on scroll ─────────────────────────────── */
export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Lang switch ──────────────────────────────────── */
export function LangSwitch({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={`inline-flex rounded-full p-0.5 text-xs font-bold ${dark ? "bg-white/10" : "bg-surface-2"}`} role="group" aria-label="Language">
      {(["ru", "tg"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-3 py-1.5 uppercase transition ${
            lang === l ? "bg-brand-600 text-white" : dark ? "text-white/70 hover:text-white" : "text-muted hover:text-fg"
          }`}
        >
          {l === "tg" ? "TJ" : "RU"}
        </button>
      ))}
    </div>
  );
}

/* ── Brand icon (lucide v1 no longer ships brand logos) ── */
export function Instagram({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

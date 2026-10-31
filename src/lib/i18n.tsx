"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DICT } from "./dict";
import type { L, Lang } from "./types";

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tl: (v: L) => string;
  money: (n: number) => string;
  num: (n: number) => string;
  date: (d: string | number | Date, withYear?: boolean) => string;
}

const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    const saved = localStorage.getItem("archa-lang");
    if (saved === "ru" || saved === "tg") setLangState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang === "tg" ? "tg" : "ru";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("archa-lang", l);
  }, []);

  const value = useMemo<I18n>(() => {
    const idx = lang === "ru" ? 0 : 1;
    const t: I18n["t"] = (key, vars) => {
      const entry = DICT[key];
      let s = entry ? entry[idx] : key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
      return s;
    };
    const fmt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
    const num = (n: number) => fmt.format(Math.round(n)).replace(/ | /g, " ");
    return {
      lang,
      setLang,
      t,
      tl: (v) => v[lang] || v.ru,
      num,
      money: (n) => `${num(n)} ${t("common.currency")}`,
      date: (d, withYear = true) => {
        const x = new Date(d);
        const base = `${x.getDate()} ${t(`m.${x.getMonth()}`)}`;
        return withYear ? `${base} ${x.getFullYear()}` : base;
      },
    };
  }, [lang, setLang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}

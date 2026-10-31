import type {
  Customer,
  DemoUser,
  ExpenseCategory,
  Order,
  OrderSource,
  OrderStatus,
  Product,
  Settings,
  Tx,
} from "./types";

/** Детерминированный генератор — демо-данные одинаково выглядят при каждом запуске. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const DAY = 86400000;
export const startOfDay = (d: Date | number) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
export const iso = (d: Date | number) => new Date(d).toISOString();
export const uid = (p = "id") =>
  `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;

const MALE = ["Фарид", "Рустам", "Далер", "Умед", "Шерзод", "Бахтиёр", "Фируз", "Азиз", "Джамшед", "Сухроб", "Нодир", "Саидмурод", "Хуршед", "Парвиз", "Алишер", "Комрон", "Сохиб", "Зафар"];
const FEMALE = ["Мадина", "Нигина", "Зарина", "Фарангис", "Гулноза", "Дилором", "Севинч", "Парвина", "Махина", "Ситора", "Лола", "Робия", "Нозанин", "Шахноза"];
const LAST = ["Рахимов", "Шарипов", "Саидов", "Каримов", "Назаров", "Бобоев", "Хасанов", "Одинаев", "Мирзоев", "Юсупов", "Холов", "Давлатов", "Ашуров", "Сафаров"];
const CITIES = ["Душанбе", "Худжанд", "Бохтар", "Куляб", "Истаравшан", "Чкаловск", "Турсунзаде"];
const BIZ_PRE = ["ООО", "ИП", "Школа", "Клиника", "Кафе", "Отель", "Центр", "Студия"];
const BIZ_NAME = ["Нур Строй", "Гулистон", "Салому", "Сумбула", "Ариана", "Ватан", "Бахор", "Орзу", "Сомон", "Хаёт", "Пайванд", "Ситора"];

const STATUS_NOTES = ["Доставка на этаж", "Согласовать цвет", "Звонить после 18:00", "Нужен монтаж", "", "", ""];

export function seedCustomers(now: number): Customer[] {
  const r = rng(11);
  const out: Customer[] = [];
  for (let i = 0; i < 192; i++) {
    const biz = i % 8 === 7;
    const female = r() > 0.55;
    const name = biz
      ? `${BIZ_PRE[((i / 8) | 0) % BIZ_PRE.length]} «${BIZ_NAME[(((i / 8) | 0) * 5) % BIZ_NAME.length]}» (демо)`
      : female
        ? `${FEMALE[(r() * FEMALE.length) | 0]} ${LAST[(r() * LAST.length) | 0]}а`
        : `${MALE[(r() * MALE.length) | 0]} ${LAST[(r() * LAST.length) | 0]}`;
    out.push({
      id: `c-${i + 1}`,
      name,
      // Вымышленные номера в заведомо тестовом диапазоне
      phone: `+992 90 0${String((r() * 99) | 0).padStart(2, "0")} ${String((r() * 99) | 0).padStart(2, "0")} ${String((r() * 99) | 0).padStart(2, "0")}`,
      city: CITIES[(r() * r() * CITIES.length) | 0],
      type: biz ? "business" : "private",
      created: iso(now - ((r() * 700) | 0) * DAY),
      note: STATUS_NOTES[(r() * STATUS_NOTES.length) | 0] || undefined,
    });
  }
  return out;
}

export function seedOrders(now: number, products: Product[], customers: Customer[]): Order[] {
  const r = rng(29);
  const orders: Order[] = [];
  const weights = products.map((p) => (p.featured ? 3 : 1.4) * (p.price < 3000 ? 1.5 : 1));
  const wsum = weights.reduce((a, b) => a + b, 0);
  const pick = () => {
    let x = r() * wsum;
    for (let i = 0; i < products.length; i++) {
      x -= weights[i];
      if (x <= 0) return products[i];
    }
    return products[0];
  };
  const sources: OrderSource[] = ["site", "phone", "instagram", "showroom", "instagram", "phone"];
  let n = 0;
  // 24 месяца, мягкий рост и сезонность
  for (let m = 23; m >= 0; m--) {
    const base = 13 + (23 - m) * 0.55;
    const count = Math.round(base + r() * 7);
    for (let k = 0; k < count; k++) {
      const age = m * 30 + Math.floor(r() * 30);
      const date = startOfDay(now - age * DAY).getTime() + 9 * 3600000 + r() * 8 * 3600000;
      const cust = customers[(r() * customers.length) | 0];
      const items: { productId: string; qty: number }[] = [];
      const lines = cust.type === "business" ? 1 + ((r() * 2) | 0) : 1 + ((r() * 2.2) | 0);
      for (let l = 0; l < lines; l++) {
        const p = pick();
        const qty = cust.type === "business" ? 4 + ((r() * 40) | 0) : 1 + ((r() * 1.8) | 0);
        items.push({ productId: p.id, qty });
      }
      const total = Math.round(
        items.reduce((s, it) => s + it.qty * (products.find((p) => p.id === it.productId)?.price ?? 0), 0) / 10,
      ) * 10;
      let status: OrderStatus;
      const roll = r();
      if (age > 45) status = roll < 0.92 ? "delivered" : "cancelled";
      else if (age > 20) status = roll < 0.62 ? "delivered" : roll < 0.8 ? "ready" : roll < 0.93 ? "production" : "cancelled";
      else if (age > 7) status = roll < 0.3 ? "ready" : roll < 0.68 ? "production" : roll < 0.9 ? "processing" : "cancelled";
      else status = roll < 0.45 ? "new" : roll < 0.8 ? "processing" : "production";
      n++;
      orders.push({
        id: `o-${n}`,
        num: `ARC-${1000 + n}`,
        customerId: cust.id,
        items,
        total,
        paid: status === "delivered" ? total : status === "cancelled" || status === "new" ? 0 : Math.round(total * (status === "ready" ? 0.8 : 0.5)),
        date: iso(date),
        status,
        source: sources[(r() * sources.length) | 0],
        city: cust.city,
        note: STATUS_NOTES[(r() * STATUS_NOTES.length) | 0] || undefined,
      });
    }
  }
  return orders.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

/** Доходы = фактически оплаченные суммы заказов. Расходы — по статьям, пропорционально обороту. */
export function seedTransactions(now: number, orders: Order[]): Tx[] {
  const r = rng(53);
  const txs: Tx[] = [];
  let n = 0;
  for (const o of orders) {
    if (o.paid <= 0) continue;
    const full = o.status === "delivered";
    n++;
    txs.push({
      id: `t-${n}`,
      date: o.date,
      type: "income",
      category: full ? "sales" : "prepayment",
      amount: o.paid,
      note: o.num,
      orderId: o.id,
    });
  }
  const today = startOfDay(now);
  const incomeByMonth = new Map<string, number>();
  const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
  for (const t of txs) {
    const k = key(new Date(t.date));
    incomeByMonth.set(k, (incomeByMonth.get(k) ?? 0) + t.amount);
  }
  const split: [ExpenseCategory, number, string][] = [
    ["materials", 0.36, "Закупка материалов"],
    ["salary", 0.22, "Зарплата сотрудников"],
    ["rent", 0.06, "Аренда цеха и салона"],
    ["logistics", 0.06, "Доставка и логистика"],
    ["marketing", 0.05, "Реклама и SMM"],
    ["utilities", 0.03, "Коммунальные услуги"],
    ["other", 0.03, "Прочие расходы"],
  ];
  for (let m = 23; m >= 0; m--) {
    const first = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const income = incomeByMonth.get(key(first)) ?? 0;
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const lastDay = m === 0 ? today.getDate() : daysInMonth;
    const factor = 0.9 + r() * 0.08; // итоговая маржа ≈ 10–17%
    for (const [cat, share, label] of split) {
      const pieces = cat === "materials" ? 9 : cat === "logistics" ? 4 : cat === "marketing" ? 3 : cat === "salary" ? 2 : 1;
      const monthTotal = income * share * (factor + 0.12);
      for (let p = 0; p < pieces; p++) {
        let day = cat === "rent" ? 1 : cat === "salary" ? (p === 0 ? 5 : 20) : 1 + Math.floor(r() * daysInMonth);
        if (day > lastDay) day = Math.max(1, lastDay - Math.floor(r() * 3));
        const d = new Date(first.getFullYear(), first.getMonth(), day, 10 + ((r() * 6) | 0));
        if (d.getTime() > now) continue;
        n++;
        txs.push({
          id: `t-${n}`,
          date: iso(d),
          type: "expense",
          category: cat,
          amount: Math.round((monthTotal / pieces) * (0.85 + r() * 0.3) / 10) * 10,
          note: label,
        });
      }
    }
  }
  return txs.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export const SEED_USERS: DemoUser[] = [
  { id: "u-1", name: "Владелец (демо)", email: "owner@demo.archa", role: "owner", active: true },
  { id: "u-2", name: "Менеджер продаж", email: "sales@demo.archa", role: "manager", active: true },
  { id: "u-3", name: "Бухгалтер", email: "finance@demo.archa", role: "accountant", active: true },
  { id: "u-4", name: "Кладовщик", email: "stock@demo.archa", role: "warehouse", active: false },
];

export const SEED_SETTINGS: Settings = {
  company: {
    name: "Арча",
    slogan: "Мебель | Межкомнатные двери",
    about:
      "Собственное производство полного цикла в Таджикистане. 30 лет на рынке. Большой выбор для дома и офиса.",
    since: "1996",
  },
  contacts: {
    phone: "1040",
    email: "marketing@archagroup.tj",
    instagram: "archa.tajikistan",
    telegram: "archagroup.tj",
    whatsapp: "",
    address: "",
  },
  theme: "light",
  compact: false,
};

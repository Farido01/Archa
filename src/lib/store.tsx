"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { SEED_PRODUCTS } from "./products";
import {
  SEED_SETTINGS,
  SEED_USERS,
  iso,
  seedCustomers,
  seedOrders,
  seedTransactions,
  uid,
} from "./seed";
import type { Customer, DemoUser, Order, OrderStatus, Product, Settings, Tx } from "./types";

const KEY = "archa-demo-v4";

interface Data {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  txs: Tx[];
  users: DemoUser[];
  settings: Settings;
}

function freshData(): Data {
  const now = Date.now();
  const customers = seedCustomers(now);
  const orders = seedOrders(now, SEED_PRODUCTS, customers);
  return {
    products: SEED_PRODUCTS,
    customers,
    orders,
    txs: seedTransactions(now, orders),
    users: SEED_USERS,
    settings: SEED_SETTINGS,
  };
}

export interface LeadInput {
  name: string;
  phone: string;
  productId?: string;
  message?: string;
}

interface Store extends Data {
  /** false — на сервере и до чтения localStorage; админ-экраны ждут true */
  ready: boolean;
  storageError: boolean;
  upsertProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  addOrder: (o: Omit<Order, "id" | "num">) => Order;
  setOrderStatus: (id: string, s: OrderStatus) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  deleteOrder: (id: string) => void;
  addCustomer: (c: Omit<Customer, "id" | "created">) => Customer;
  deleteCustomer: (id: string) => void;
  addTx: (t: Omit<Tx, "id">) => void;
  deleteTx: (id: string) => void;
  submitLead: (l: LeadInput) => Order;
  upsertUser: (u: DemoUser) => void;
  deleteUser: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetDemo: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // На сервере и при первом рендере — только статичный каталог (без гидрации-расхождений).
  const [data, setData] = useState<Data>(() => ({
    products: SEED_PRODUCTS,
    customers: [],
    orders: [],
    txs: [],
    users: SEED_USERS,
    settings: SEED_SETTINGS,
  }));
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        setData(JSON.parse(raw) as Data);
        return;
      }
    } catch {
      /* битые данные — пересоздаём */
    }
    const d = freshData();
    setData(d);
    try {
      localStorage.setItem(KEY, JSON.stringify(d));
    } catch {
      setStorageError(true);
    }
  }, []);

  useEffect(() => {
    load();
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) {
        try {
          setData(JSON.parse(e.newValue) as Data);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [load]);

  const commit = useCallback((fn: (d: Data) => Data) => {
    const next = fn(dataRef.current);
    dataRef.current = next;
    setData(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, []);

  const api = useMemo<Omit<Store, keyof Data | "ready" | "storageError">>(
    () => ({
      upsertProduct: (p) =>
        commit((d) => ({
          ...d,
          products: d.products.some((x) => x.id === p.id)
            ? d.products.map((x) => (x.id === p.id ? p : x))
            : [p, ...d.products],
        })),
      deleteProduct: (id) => commit((d) => ({ ...d, products: d.products.filter((p) => p.id !== id) })),
      adjustStock: (id, delta) =>
        commit((d) => ({
          ...d,
          products: d.products.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)),
        })),
      addOrder: (o) => {
        const max = dataRef.current.orders.reduce((m, x) => Math.max(m, parseInt(x.num.slice(4), 10) || 0), 1000);
        const order: Order = { ...o, id: uid("o"), num: `ARC-${max + 1}` };
        commit((d) => ({ ...d, orders: [order, ...d.orders] }));
        return order;
      },
      setOrderStatus: (id, s) =>
        commit((d) => ({
          ...d,
          orders: d.orders.map((o) => (o.id === id ? { ...o, status: s } : o)),
        })),
      updateOrder: (id, patch) =>
        commit((d) => ({ ...d, orders: d.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
      updateCustomer: (id, patch) =>
        commit((d) => ({ ...d, customers: d.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteOrder: (id) =>
        commit((d) => ({
          ...d,
          orders: d.orders.filter((o) => o.id !== id),
          txs: d.txs.filter((t) => t.orderId !== id),
        })),
      addCustomer: (c) => {
        const cust: Customer = { ...c, id: uid("c"), created: iso(Date.now()) };
        commit((d) => ({ ...d, customers: [cust, ...d.customers] }));
        return cust;
      },
      deleteCustomer: (id) =>
        commit((d) => {
          const gone = new Set(d.orders.filter((o) => o.customerId === id).map((o) => o.id));
          return {
            ...d,
            customers: d.customers.filter((c) => c.id !== id),
            orders: d.orders.filter((o) => o.customerId !== id),
            txs: d.txs.filter((t) => !t.orderId || !gone.has(t.orderId)),
          };
        }),
      addTx: (t) => commit((d) => ({ ...d, txs: [{ ...t, id: uid("t") }, ...d.txs] })),
      deleteTx: (id) => commit((d) => ({ ...d, txs: d.txs.filter((t) => t.id !== id) })),
      submitLead: (l) => {
        const cur = dataRef.current;
        const phone = l.phone.trim();
        let cust = cur.customers.find((c) => c.phone.replace(/\D/g, "") === phone.replace(/\D/g, ""));
        const max = cur.orders.reduce((m, x) => Math.max(m, parseInt(x.num.slice(4), 10) || 0), 1000);
        const order: Order = {
          id: uid("o"),
          num: `ARC-${max + 1}`,
          customerId: "",
          items: l.productId ? [{ productId: l.productId, qty: 1 }] : [],
          total: 0,
          paid: 0,
          date: iso(Date.now()),
          status: "new",
          source: "site",
          city: cust?.city ?? "—",
          note: l.message?.trim() || undefined,
        };
        if (!cust) {
          cust = {
            id: uid("c"),
            name: l.name.trim(),
            phone,
            city: "—",
            type: "private",
            created: iso(Date.now()),
          };
        }
        order.customerId = cust.id;
        const c = cust;
        commit((d) => ({
          ...d,
          customers: d.customers.some((x) => x.id === c.id) ? d.customers : [c, ...d.customers],
          orders: [order, ...d.orders],
        }));
        return order;
      },
      upsertUser: (u) =>
        commit((d) => ({
          ...d,
          users: d.users.some((x) => x.id === u.id) ? d.users.map((x) => (x.id === u.id ? u : x)) : [...d.users, u],
        })),
      deleteUser: (id) => commit((d) => ({ ...d, users: d.users.filter((u) => u.id !== id) })),
      updateSettings: (patch) => commit((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
      resetDemo: () => commit(() => freshData()),
    }),
    [commit],
  );

  const value = useMemo<Store>(() => ({ ...data, ready, storageError, ...api }), [data, ready, storageError, api]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}

export type Lang = "ru" | "tg";
export type L = { ru: string; tg: string };

export type CategoryId = "doors" | "sofas" | "dining" | "chairs" | "business";

export type ArtKind =
  | "door"
  | "sofa"
  | "corner"
  | "dining"
  | "glassdining"
  | "chair"
  | "armchair"
  | "theatre"
  | "office"
  | "desk"
  | "bed";

export interface Product {
  id: string;
  sku: string;
  category: CategoryId;
  name: L;
  desc: L;
  specs: { k: L; v: L }[];
  colors: { name: L; hex: string }[];
  art: ArtKind;
  tone: string;
  accent: string;
  price: number;
  stock: number;
  minStock: number;
  featured: boolean;
  image?: string;
}

export type OrderStatus =
  | "new"
  | "processing"
  | "production"
  | "ready"
  | "delivered"
  | "cancelled";

export type OrderSource = "site" | "phone" | "instagram" | "showroom";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  city: string;
  type: "private" | "business";
  created: string;
  note?: string;
}

export interface Order {
  id: string;
  num: string;
  customerId: string;
  items: { productId: string; qty: number }[];
  total: number;
  paid: number;
  date: string;
  status: OrderStatus;
  source: OrderSource;
  city: string;
  note?: string;
}

export type ExpenseCategory =
  | "materials"
  | "salary"
  | "rent"
  | "logistics"
  | "marketing"
  | "utilities"
  | "other";
export type IncomeCategory = "sales" | "prepayment" | "service";

export interface Tx {
  id: string;
  date: string;
  type: "income" | "expense";
  category: ExpenseCategory | IncomeCategory;
  amount: number;
  note: string;
  orderId?: string;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "accountant" | "warehouse";
  active: boolean;
}

export interface Settings {
  company: { name: string; slogan: string; about: string; since: string };
  contacts: {
    phone: string;
    email: string;
    instagram: string;
    telegram: string;
    whatsapp: string;
    address: string;
  };
  theme: "light" | "dark";
  compact: boolean;
}

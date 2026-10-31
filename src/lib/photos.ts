import type { SceneKind } from "@/components/art";
import type { CategoryId } from "./types";

/**
 * Фотографии сайта (Unsplash, бесплатная лицензия, скачивания зарегистрированы через Unsplash API).
 * Для замены укажите путь к файлу из /public (например "/images/hero.jpg") или другой URL.
 * Значение null — на месте фото показывается фирменная иллюстрация.
 */
const u = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}`;

export const PHOTOS: {
  hero: string | null;
  heroSmall: string | null;
  categories: Record<CategoryId, string | null>;
  projects: Record<SceneKind, string | null>;
} = {
  hero: u("1691036561573-4b76998b60de", 2000),
  heroSmall: u("1579656592043-a20e25a4aa4b", 600),
  categories: {
    doors: u("1760893769005-b3d617bd7a69", 900),
    sofas: u("1564078516393-cf04bd966897", 900),
    dining: u("1616486338812-3dadae4b4ace", 900),
    chairs: u("1689414126346-b21dfbc308de", 900),
    business: u("1628062699790-7c45262b82b4", 900),
  },
  projects: {
    living: u("1633505899118-4ca6bd143043"),
    dining: u("1615803796379-b4cda8e9c09c"),
    hall: u("1544641724-73f0d1bee38b"),
    school: u("1740635341299-3b8e3490f546"),
    clinic: u("1710074213379-2a9c2653046a"),
    theatre: u("1566159171006-5165eaf723a6"),
    office: u("1594235048794-fae8583a5af5"),
    cafe: u("1611323128401-faa8f1b6de24"),
  },
};

/** Фото товаров каталога по id товара. */
export const PRODUCT_PHOTOS: Record<string, string> = {
  "p-door-classic": u("1760893769005-b3d617bd7a69", 1200),
  "p-door-walnut": u("1537199322506-85bfd51c0601", 1200),
  "p-door-minimal": u("1536160885591-301854e2ed04", 1200),
  "p-sofa-cloud": u("1615800001964-5afd0ae8e49a", 1200),
  "p-sofa-modul": u("1759722665935-0967b4e0da93", 1200),
  "p-sofa-velvet": u("1565330502541-4937be8552e3", 1200),
  "p-dining-oak": u("1616486338812-3dadae4b4ace", 1200),
  "p-dining-white": u("1615803796379-b4cda8e9c09c", 1200),
  "p-dining-glass": u("1617850687361-a07b256ff259", 1200),
  "p-chair-matrix": u("1598300042247-d088f8ab3a91", 1200),
  "p-chair-wood": u("1624345691006-e683ff409f3f", 1200),
  "p-chair-green": u("1579656592043-a20e25a4aa4b", 1200),
  "p-biz-theatre": u("1664267828602-61dc7012f1fd", 1200),
  "p-biz-office": u("1688578735427-994ecdea3ea4", 1200),
  "p-biz-school": u("1519406596751-0a3ccc4937fe", 1200),
  "p-biz-clinic": u("1710074213374-e68503a1b795", 1200),
};

/** Авторы фото — указываются в подвале по правилам Unsplash. */
export const PHOTO_CREDITS: { name: string; username: string }[] = [
  { name: "Bilal Mansuri", username: "itsbilalmn" },
  { name: "khloe arledge", username: "khloephoto" },
  { name: "Julian Rösner", username: "kipfarl" },
  { name: "Roberto Nickson", username: "rpnickson" },
  { name: "Spacejoy", username: "spacejoy" },
  { name: "Zoe", username: "_imd" },
  { name: "Michael Fousert", username: "michaelfousert" },
  { name: "Stephan Louis", username: "stephanlouis" },
  { name: "Jon Tyson", username: "jontyson" },
  { name: "Nathan Cima", username: "nathan_cima" },
  { name: "Zoshua Colah", username: "zoshuacolah" },
  { name: "Debby Ledet", username: "debbyledet" },
  { name: "Uneebo Office Design", username: "uneebo_office_design" },
  { name: "KWON JUNHO", username: "juno1412" },
  { name: "Behnam Norouzi", username: "behy_studio" },
  { name: "Sophie Dale", username: "allthestars" },
  { name: "Julia", username: "beazy" },
  { name: "Costa Live", username: "vendedorescostalive" },
  { name: "Adam Winger", username: "awcreativeut" },
  { name: "Cameron Smith", username: "cameronsmith" },
  { name: "Sam Moghadam", username: "sammoghadam" },
  { name: "Masjid Pogung Dalangan", username: "masjidmpd" },
  { name: "Li Yan", username: "yanli247" },
  { name: "EFFYDESK", username: "effydesk" },
  { name: "Jeffrey Hamilton", username: "pistos" },
];

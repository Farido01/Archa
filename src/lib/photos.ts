import type { SceneKind } from "@/components/art";
import type { CategoryId } from "./types";

/**
 * Фотографии сайта.
 * Укажите путь к файлу из /public (например "/images/hero.jpg") или URL
 * (images.unsplash.com уже разрешён в next.config.ts). Пока значение null,
 * на месте фото показывается фирменная иллюстрация.
 */
export const PHOTOS: {
  hero: string | null;
  heroSmall: string | null;
  about: string | null;
  categories: Record<CategoryId, string | null>;
  projects: Record<SceneKind, string | null>;
} = {
  hero: null,
  heroSmall: null,
  about: null,
  categories: { doors: null, sofas: null, dining: null, chairs: null, business: null },
  projects: { living: null, dining: null, hall: null, school: null, clinic: null, theatre: null, office: null, cafe: null },
};

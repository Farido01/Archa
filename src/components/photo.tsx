import Image from "next/image";

/** Фото с запасной иллюстрацией: пока src не задан, рендерится children. */
export function Photo({
  src,
  alt,
  children,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  className = "",
}: {
  src: string | null | undefined;
  alt: string;
  children: React.ReactNode;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) return <>{children}</>;
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />;
}

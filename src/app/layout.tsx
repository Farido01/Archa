import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Арча · Мебель и межкомнатные двери — демо платформы",
  description:
    "Демонстрационная версия цифровой платформы ARCHA: сайт для клиентов и система управления бизнесом. Все данные вымышленные.",
};
export const viewport: Viewport = { themeColor: "#0b7134", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

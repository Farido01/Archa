import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Арча — мебель и межкомнатные двери собственного производства",
  description:
    "Мебель и межкомнатные двери собственного производства в Таджикистане с 1996 года: диваны, обеденные группы, двери, мебель для бизнеса.",
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

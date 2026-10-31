"use client";

import { I18nProvider } from "@/lib/i18n";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "./ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <StoreProvider>
        <ToastProvider>{children}</ToastProvider>
      </StoreProvider>
    </I18nProvider>
  );
}

"use client";

import { MotionConfig } from "framer-motion";
import { I18nProvider } from "@/lib/i18n";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "./ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <StoreProvider>
        <ToastProvider><MotionConfig reducedMotion="user">{children}</MotionConfig></ToastProvider>
      </StoreProvider>
    </I18nProvider>
  );
}

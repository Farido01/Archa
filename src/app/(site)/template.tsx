"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Переход между страницами: зелёная шторка уходит вверх. */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <>
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[90] origin-top bg-juniper"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
        />
      )}
      {children}
    </>
  );
}

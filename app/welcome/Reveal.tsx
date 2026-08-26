"use client";

import { motion } from "motion/react";

// Isolated in its own client boundary so the rest of welcome/page.tsx can be
// a Server Component — it was the only reason that whole (mostly static)
// page needed "use client", pulling the full motion bundle into hydration
// for content that has no other interactivity.
const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={fadeUp.initial}
      whileInView={fadeUp.whileInView}
      viewport={fadeUp.viewport}
      transition={{ ...fadeUp.transition, delay }}
    >
      {children}
    </motion.div>
  );
}

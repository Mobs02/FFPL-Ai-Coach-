"use client";

import { useRef } from "react";
import { motion, useScroll } from "motion/react";

// A single glowing segment of the spiral thread. Tracks scroll progress of
// its own section (not the whole page), so as you scroll through that
// section the line draws itself in — lots of short scroll-linked segments
// read as one continuous thread rather than one giant fragile path spanning
// the entire page.
export function SpiralSegment({ path }: { path: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <div ref={ref} className="wp-spiral-layer" aria-hidden="true">
      <svg viewBox="0 0 400 400" preserveAspectRatio="none" width="100%" height="100%">
        <motion.path
          d={path}
          fill="none"
          stroke="#00e676"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ pathLength: scrollYProgress, filter: "drop-shadow(0 0 6px rgba(0,255,133,0.65))" }}
        />
      </svg>
    </div>
  );
}

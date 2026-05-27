import { motion } from "motion/react";
import { drawLine } from "@/lib/motion";

/**
 * Thin lime accent line that draws in horizontally when scrolled into view
 * (spec §2.1 / §7). Decorative — hidden from assistive tech.
 */
export function AccentLine({ className = "" }: { className?: string }) {
  return (
    <motion.span
      aria-hidden="true"
      className={`block h-px w-14 origin-left bg-lime ${className}`}
      variants={drawLine}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 1 }}
    />
  );
}

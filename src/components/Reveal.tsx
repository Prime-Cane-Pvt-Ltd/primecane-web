import type { ReactNode } from "react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { onScroll, inView } from "@/lib/motion";

/**
 * Scroll-triggered reveal wrapper. Animates once when it enters the viewport.
 * Respects reduced motion via the app-level <MotionConfig reducedMotion="user">.
 */
export function Reveal({
  children,
  className = "",
  variants = onScroll,
  delay,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </motion.div>
  );
}

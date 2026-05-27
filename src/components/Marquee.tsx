import { motion, useReducedMotion } from "motion/react";

/**
 * Seamless looping ticker (spec §3). Decorative, so hidden from assistive tech.
 * Content is duplicated and translated by exactly -50% for a seamless loop;
 * the transform is disabled automatically under reduced motion.
 */
export function Marquee({
  items,
  className = "",
}: {
  items: readonly string[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const loop = [...items, ...items];
  return (
    <div
      aria-hidden="true"
      className={`relative flex overflow-hidden select-none ${className}`}
    >
      <motion.div
        className="flex shrink-0 items-center gap-6 pr-6"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 22, ease: "linear", repeat: Infinity }}
      >
        {loop.map((item, i) => (
          <span key={i} className="flex items-center gap-6 whitespace-nowrap">
            <span className="eyebrow text-cream/70">{item}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-lime/80" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

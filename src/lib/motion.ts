import type { Variants } from "motion/react";

/**
 * Reusable Framer Motion variants (spec §7) — define once, use everywhere.
 * Entrances are quick (200–500ms); ambient loops live in the components.
 */

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

/** Reveal children upward, staggered. Pair with `riseItem` on each child. */
export const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const riseItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

/** A section sliding up as it scrolls into view. */
export const onScroll: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

/** Standard viewport trigger — animate once, a little before fully in view. */
export const inView = { once: true, amount: 0.3, margin: "0px 0px -10% 0px" } as const;

/** A thin accent line drawing in horizontally. */
export const drawLine: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO },
  },
};

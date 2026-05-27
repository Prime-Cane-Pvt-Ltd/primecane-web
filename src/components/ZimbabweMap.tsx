import { motion } from "motion/react";

/** Chiredzi sits in the south-east Lowveld (approx. position on the stylised map). */
const PIN = { x: 150, y: 104 };

/** Stylised Zimbabwe silhouette: NW (Vic Falls) → N → NE → E highlands → SE → S → SW → W. */
const OUTLINE =
  "M26,64 C28,50 38,44 54,40 L98,31 C122,29 146,33 162,42 L189,73 C185,86 171,97 151,106 L120,120 C100,122 77,118 59,107 C43,99 28,86 26,64 Z";

/**
 * Stylised (not survey-accurate) outline of Zimbabwe with a Chiredzi marker that
 * drops in and emits a single radar ripple when scrolled into view (spec §4).
 */
export function ZimbabweMap({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 210 150"
      className={className}
      role="img"
      aria-label="Map of Zimbabwe with Chiredzi marked in the south-east"
    >
      <motion.path
        d={OUTLINE}
        fill="var(--color-lime)"
        fillOpacity="0.06"
        stroke="var(--color-cream)"
        strokeOpacity="0.35"
        strokeWidth="1.5"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Radar ripple — one pulse */}
      <motion.circle
        cx={PIN.x}
        cy={PIN.y}
        r="6"
        fill="var(--color-lime)"
        initial={{ scale: 1, opacity: 0.5 }}
        whileInView={{ scale: 4, opacity: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: "easeOut", delay: 0.6 }}
        style={{ transformOrigin: `${PIN.x}px ${PIN.y}px` }}
      />

      {/* Pin — drops and bounces into place */}
      <motion.g
        initial={{ y: -38, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.5 }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        <path
          d={`M${PIN.x},${PIN.y - 22} a8,8 0 1 1 -0.01,0 Z M${PIN.x},${PIN.y - 6} L${PIN.x - 6},${PIN.y - 14} L${PIN.x + 6},${PIN.y - 14} Z`}
          fill="var(--color-lime)"
        />
        <circle cx={PIN.x} cy={PIN.y - 14} r="3.2" fill="var(--color-green-night)" />
      </motion.g>

      <text
        x={PIN.x + 12}
        y={PIN.y - 10}
        fill="var(--color-cream)"
        fontSize="9"
        fontFamily="var(--font-body)"
        letterSpacing="1.5"
      >
        CHIREDZI
      </text>
    </svg>
  );
}

import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";

const STALKS = [
  "M50,84 L50,30", // centre, tallest
  "M38,84 L38,42", // left
  "M62,84 L62,40", // right
];
const LEAVES = [
  "M38,58 C28,54 21,60 17,66",
  "M62,54 C72,50 79,56 83,62",
];

/**
 * Brand preloader (spec §0): the cane stalks "grow" upward, the disc fills with
 * lime, then the whole panel slides away to reveal the hero. Caps at ~1.6s; a
 * reduced-motion visitor gets a simple fade instead of the draw.
 */
export function Preloader({ onComplete }: { onComplete: () => void }) {
  const reduce = useReducedMotion();

  // Hold for a short minimum AND until the brand fonts are actually loaded, so
  // page content first paints in Fraunces/Hanken — no font-swap reflow (zero
  // CLS). We explicitly request BOTH families here (the display font is only
  // used by headings further down the page, so `fonts.ready` alone wouldn't
  // load it in time). Hard-capped so a slow font never blocks beyond spec's 2.5s.
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onComplete();
    };
    const minDelay = new Promise<void>((r) => setTimeout(r, reduce ? 600 : 1300));
    const fonts = document.fonts
      ? Promise.all([
          document.fonts.load("400 1rem 'Fraunces Variable'"),
          document.fonts.load("400 1rem 'Hanken Grotesk Variable'"),
          document.fonts.ready,
        ])
      : Promise.resolve();
    void Promise.all([minDelay, fonts]).then(finish);
    const cap = setTimeout(finish, 2500);
    return () => clearTimeout(cap);
  }, [onComplete, reduce]);

  const draw = reduce
    ? { pathLength: 1, opacity: 1 }
    : { pathLength: [0, 1] as number[], opacity: 1 };

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-green-night"
      initial={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.svg
        width="132"
        height="132"
        viewBox="0 0 100 100"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        aria-hidden="true"
      >
        {/* Disc fills after the stalks have drawn */}
        <motion.circle
          cx="50"
          cy="54"
          r="34"
          fill="var(--color-lime)"
          initial={{ scale: reduce ? 1 : 0.5, opacity: reduce ? 0.18 : 0 }}
          animate={{ scale: 1, opacity: 0.18 }}
          transition={{ delay: reduce ? 0 : 0.85, duration: 0.5, ease: "easeOut" }}
          style={{ transformOrigin: "50px 54px" }}
        />
        {STALKS.map((d, i) => (
          <motion.path
            key={`s${i}`}
            d={d}
            stroke="var(--color-lime)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0 }}
            animate={draw}
            transition={{ delay: reduce ? 0 : 0.1 + i * 0.12, duration: 0.55, ease: "easeOut" }}
          />
        ))}
        {LEAVES.map((d, i) => (
          <motion.path
            key={`l${i}`}
            d={d}
            stroke="var(--color-cream)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 0.9 : 0 }}
            animate={reduce ? { pathLength: 1, opacity: 0.9 } : { pathLength: [0, 1], opacity: 0.9 }}
            transition={{ delay: reduce ? 0 : 0.55 + i * 0.1, duration: 0.5, ease: "easeOut" }}
          />
        ))}
      </motion.svg>

      <span className="sr-only">Loading Prime Cane</span>
    </motion.div>
  );
}

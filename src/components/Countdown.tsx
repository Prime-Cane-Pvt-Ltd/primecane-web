import { AnimatePresence, motion } from "motion/react";
import { useCountdown } from "@/lib/useCountdown";
import { LAUNCH_DATE } from "@/lib/constants";

const pad = (n: number) => n.toString().padStart(2, "0");

// Derived from the single source of truth so the SR text never drifts.
const LAUNCH_LABEL = new Date(LAUNCH_DATE).toLocaleDateString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function Unit({ value, label }: { value: number; label: string }) {
  const text = pad(value);
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[1.15em] overflow-hidden font-body text-4xl font-semibold tabular-nums text-cream sm:text-5xl">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            initial={{ y: "-70%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "70%", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="block"
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="eyebrow mt-2 text-lime/80">{label}</span>
    </div>
  );
}

export function Countdown({ className = "" }: { className?: string }) {
  const { days, hours, mins, secs } = useCountdown(LAUNCH_DATE);

  return (
    <div className={className}>
      {/* Visual, animated countdown — decorative for assistive tech */}
      <div
        aria-hidden="true"
        className="flex items-start gap-5 sm:gap-7"
      >
        <Unit value={days} label="Days" />
        <span className="font-body text-3xl font-light text-lime/40 sm:text-4xl">:</span>
        <Unit value={hours} label="Hours" />
        <span className="font-body text-3xl font-light text-lime/40 sm:text-4xl">:</span>
        <Unit value={mins} label="Mins" />
        <span className="font-body text-3xl font-light text-lime/40 sm:text-4xl">:</span>
        <Unit value={secs} label="Secs" />
      </div>

      {/* Accessible summary — updates at most hourly, announced politely */}
      <p className="sr-only" aria-live="polite">
        {days} days and {hours} hours until launch on {LAUNCH_LABEL}.
      </p>
    </div>
  );
}

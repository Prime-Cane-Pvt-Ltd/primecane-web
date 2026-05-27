import logoSec from "@/assets/logos/Logo_sec.svg";
import logoPrimary from "@/assets/logos/Logo_primary.svg";

type Variant = "secondary" | "primary";

// Intrinsic emblem ratio (viewBox 210.7 × 203.39) — set so the browser reserves
// the correct height and the logo never causes layout shift (CLS).
const W = 211;
const H = 203;

/**
 * Prime Cane emblem.
 *  - "secondary" → white-text ring, for dark backgrounds (default / hero / footer)
 *  - "primary"   → green-text ring, for light backgrounds
 */
export function Logo({
  variant = "secondary",
  className = "",
  priority = false,
}: {
  variant?: Variant;
  className?: string;
  /** Set on the above-the-fold hero logo so it isn't lazy-loaded. */
  priority?: boolean;
}) {
  return (
    <img
      src={variant === "secondary" ? logoSec : logoPrimary}
      alt="Prime Cane (Pvt) Ltd"
      width={W}
      height={H}
      className={className}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      draggable={false}
    />
  );
}

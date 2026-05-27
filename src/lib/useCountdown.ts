import { useEffect, useMemo, useState } from "react";

export interface TimeLeft {
  days: number;
  hours: number;
  mins: number;
  secs: number;
  /** True once the target has passed. */
  done: boolean;
}

/** Pure computation from a fixed target — no stale closures (react-patterns §7). */
function compute(target: number): TimeLeft {
  const diff = target - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, done: true };
  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    mins: Math.floor((total % 3_600) / 60),
    secs: total % 60,
    done: false,
  };
}

/**
 * Live countdown to an ISO target. Ticks once per second and cleans up its
 * interval on unmount. Stops ticking after the target passes.
 */
export function useCountdown(targetISO: string): TimeLeft {
  const target = useMemo(() => new Date(targetISO).getTime(), [targetISO]);
  const [time, setTime] = useState<TimeLeft>(() => compute(target));

  useEffect(() => {
    if (compute(target).done) return;
    const id = setInterval(() => {
      const next = compute(target);
      setTime(next);
      if (next.done) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  return time;
}

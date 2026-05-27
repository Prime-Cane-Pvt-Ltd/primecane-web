import type { ReactNode } from "react";

/** Small uppercase, letter-spaced label (spec §2.2). */
export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

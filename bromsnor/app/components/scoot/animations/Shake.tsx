// ============================================================
// Shake: wraps content and shakes it when `trigger` changes —
// the universal "that didn't work" gesture for error states
// (no route found, invalid input).
// ============================================================

/**
 * Shakes its children each time `trigger` gets a new value.
 * Tie it to an error counter or message so every new failure
 * shakes again.
 *
 * @example
 * const [error, setError] = useState<string | null>(null);
 * <Shake trigger={error}>
 *   <input className={error ? "is-invalid" : ""} />
 * </Shake>
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import "./animations.css";

export type ShakeProps = {
  children: ReactNode;
  /** Shakes when this value changes to something truthy. */
  trigger: unknown;
  className?: string;
};

export function Shake({ children, trigger, className = "" }: ShakeProps) {
  const [shaking, setShaking] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!trigger) return;
    setShaking(true);
    const timer = setTimeout(() => setShaking(false), 450);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className={`${shaking ? "sc-shake" : ""} ${className}`.trim()}>
      {children}
    </div>
  );
}

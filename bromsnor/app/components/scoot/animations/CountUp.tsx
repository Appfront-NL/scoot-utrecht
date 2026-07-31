// ============================================================
// CountUp: a number that counts up (or down) to its value with
// an ease-out curve. Runs on setInterval, not rAF, so it keeps
// ticking in covered/background windows.
// ============================================================

/**
 * Animated number. Re-animates whenever `to` changes, starting
 * from the previously shown value — so live-updating stats (route
 * distance, ETA) glide instead of jump.
 *
 * @example
 * <CountUp to={5.8} decimals={1} suffix=" km" />
 *
 * @example // integers, custom speed
 * <CountUp to={340} durationMs={1500} suffix=" regels" />
 */

import { useEffect, useRef, useState } from "react";

export type CountUpProps = {
  /** Target value. */
  to: number;
  /** Starting value for the very first animation. Defaults to 0. */
  from?: number;
  /** Animation length. Defaults to 900. */
  durationMs?: number;
  /** Decimal places to show. Defaults to 0. */
  decimals?: number;
  /** Rendered before/after the number ("€ ", " km"). */
  prefix?: string;
  suffix?: string;
  /** Number locale (decimal comma vs point). Defaults to "nl-NL". */
  locale?: string;
  className?: string;
};

export function CountUp({
  to,
  from = 0,
  durationMs = 900,
  decimals = 0,
  prefix = "",
  suffix = "",
  locale = "nl-NL",
  className,
}: CountUpProps) {
  const [value, setValue] = useState(from);
  const shownRef = useRef(from);

  useEffect(() => {
    const start = shownRef.current;
    const delta = to - start;
    if (delta === 0) return;
    const t0 = Date.now();
    const timer = setInterval(() => {
      const t = Math.min(1, (Date.now() - t0) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = start + delta * eased;
      shownRef.current = next;
      setValue(next);
      if (t >= 1) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [to, durationMs]);

  const text = value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}{text}{suffix}
    </span>
  );
}

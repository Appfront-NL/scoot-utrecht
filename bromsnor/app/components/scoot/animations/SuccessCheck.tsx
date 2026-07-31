// ============================================================
// SuccessCheck: circle + checkmark that draw themselves in.
// For "route gevonden", arrival, saved settings — any success
// moment that deserves half a second of celebration.
// ============================================================

/**
 * Animated checkmark. Draws once on mount; remount (change the
 * `key`) to replay.
 *
 * @example
 * {routeFound && <SuccessCheck />}
 *
 * @example // with label, custom color
 * <SuccessCheck size={72} color="#10b981" label="Route gevonden" />
 */

import "./animations.css";

export type SuccessCheckProps = {
  /** Diameter in px. Defaults to 64. */
  size?: number;
  /** Stroke color. Defaults to success green. */
  color?: string;
  /** Optional text under the check. */
  label?: string;
  className?: string;
};

export function SuccessCheck({ size = 64, color = "#10b981", label, className = "" }: SuccessCheckProps) {
  return (
    <div
      className={`sc-check-pop ${className}`.trim()}
      style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8 }}
      role="status"
    >
      <svg width={size} height={size} viewBox="0 0 56 56" fill="none" aria-hidden="true">
        <circle
          className="sc-check-circle"
          cx="28" cy="28" r="25"
          stroke={color} strokeWidth="2.5"
        />
        <path
          className="sc-check-mark"
          d="M17 29l7.5 7.5L39 21"
          stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
      {label && (
        <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{label}</span>
      )}
    </div>
  );
}

// ============================================================
// RouteLoader: loading state with a bobbing scooter over a
// moving dashed road. Made for the wait while a routing API
// (TomTom, own backend) computes — friendlier than a spinner.
// ============================================================

/**
 * Scooter loading indicator.
 *
 * @example
 * {calculating && <RouteLoader />}
 *
 * @example // custom label and size
 * <RouteLoader label="Zones ophalen…" size={56} />
 */

import "./animations.css";

export type RouteLoaderProps = {
  /** Text under the scooter. Defaults to "Route berekenen…". Empty string hides it. */
  label?: string;
  /** Scooter width in px. Defaults to 44. */
  size?: number;
  /** Scooter color. Defaults to SCOOT violet. */
  color?: string;
  className?: string;
};

export function RouteLoader({
  label = "Route berekenen…",
  size = 44,
  color = "#8b5cf6",
  className = "",
}: RouteLoaderProps) {
  return (
    <div className={`sc-route-loader ${className}`.trim()} role="status" aria-live="polite">
      <svg
        className="sc-route-loader__scooter"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="5.5" cy="17" r="3" />
        <circle cx="18.5" cy="17" r="3" />
        <path d="M8.5 17h7" />
        <path d="M18.5 17V9a2 2 0 0 0-2-2h-2" />
        <path d="M5.5 14l3.2-6.5h4.1" />
        <path d="M12.8 7.5 15 12" />
      </svg>
      <svg width={size + 26} height="6" viewBox={`0 0 ${size + 26} 6`} aria-hidden="true">
        <line
          className="sc-route-loader__road"
          x1="0" y1="3" x2={size + 26} y2="3"
          stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round"
        />
      </svg>
      {label && <span>{label}</span>}
    </div>
  );
}

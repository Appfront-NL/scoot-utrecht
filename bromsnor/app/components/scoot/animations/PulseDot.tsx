// ============================================================
// PulseDot: a dot with expanding pulse rings — live position,
// danger spot, "here" marker. Comes in two flavours:
//   1. <PulseDot />          — React component
//   2. pulseDotHTML()        — plain HTML string for map libs
// The HTML flavour exists specifically for Leaflet's divIcon,
// which wants markup, not React.
// ============================================================

/**
 * Pulsing dot.
 *
 * @example
 * <PulseDot color="#ef4444" size={14} />
 *
 * @example // as a Leaflet marker
 * import { pulseDotHTML } from "~/components/scoot";
 * L.marker([52.09, 5.12], {
 *   icon: L.divIcon({
 *     html: pulseDotHTML({ color: "#8b5cf6" }),
 *     className: "",          // keep Leaflet's default box out of the way
 *     iconSize: [14, 14],
 *     iconAnchor: [7, 7],
 *   }),
 * }).addTo(map);
 */

import type { CSSProperties } from "react";
import "./animations.css";

export type PulseDotProps = {
  /** Dot color; the rings inherit it. Defaults to danger red. */
  color?: string;
  /** Dot diameter in px. Defaults to 14. */
  size?: number;
  className?: string;
  style?: CSSProperties;
};

export function PulseDot({ color = "#ef4444", size = 14, className = "", style }: PulseDotProps) {
  return (
    <span
      className={`sc-pulse-dot ${className}`.trim()}
      style={{
        ...style,
        width: size,
        height: size,
        ["--sc-pulse-color" as string]: color,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * The same dot as an HTML string, for places React can't reach
 * (Leaflet divIcon, tooltips, innerHTML). The CSS ships with any
 * import from this folder, so the class is always available.
 */
export function pulseDotHTML({ color = "#ef4444", size = 14 }: { color?: string; size?: number } = {}): string {
  return `<span class="sc-pulse-dot" style="width:${size}px;height:${size}px;--sc-pulse-color:${color}"></span>`;
}

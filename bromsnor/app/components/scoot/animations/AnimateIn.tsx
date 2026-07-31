// ============================================================
// AnimateIn: entrance-animation wrapper. Wrap anything and it
// slides/fades/pops in on mount. Self-contained (brings its own
// CSS); safe next to Leaflet, Tailwind or plain CSS.
// ============================================================

/**
 * Animates its children in when they mount. Remount (change the
 * `key`) to replay — handy when a panel's content swaps.
 *
 * @example
 * <AnimateIn from="bottom">
 *   <ResultCard />
 * </AnimateIn>
 *
 * @example // staggered list
 * {items.map((item, i) => (
 *   <AnimateIn key={item.id} from="left" delayMs={i * 60}>
 *     <Row item={item} />
 *   </AnimateIn>
 * ))}
 */

import type { CSSProperties, ReactNode } from "react";
import "./animations.css";

export type AnimateInProps = {
  children: ReactNode;
  /** Direction the content comes from, or "fade" / "pop". Defaults to "bottom". */
  from?: "bottom" | "top" | "left" | "right" | "fade" | "pop";
  /** Delay before the animation starts. Defaults to 0. */
  delayMs?: number;
  /** Animation length. Defaults to 400. */
  durationMs?: number;
  /** Extra class for the wrapper div. */
  className?: string;
  style?: CSSProperties;
};

export function AnimateIn({
  children,
  from = "bottom",
  delayMs = 0,
  durationMs = 400,
  className = "",
  style,
}: AnimateInProps) {
  return (
    <div
      className={`sc-animate-in sc-animate-in--${from} ${className}`.trim()}
      style={{
        ...style,
        ["--sc-delay" as string]: `${delayMs}ms`,
        ["--sc-duration" as string]: `${durationMs}ms`,
      }}
    >
      {children}
    </div>
  );
}

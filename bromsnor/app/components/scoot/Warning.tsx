import { useEffect, useRef } from "react";

/**
 * React wrapper around the standalone <scoot-warning> web component
 * (app/lib/warning-card.js — shadow DOM, own styling, zero deps).
 *
 * Inline in your layout:
 * @example
 * <Warning variant="nadert" distance={80} zone="Voetgangersgebied Steenweg"
 *   onAction={reroute} onDismiss={() => setShow(false)} />
 *
 * Or imperatively, floating top-of-screen (auto-dismiss included):
 * @example
 * const warn = useWarning();
 * warn.show({ variant: "verboden", duration: 9000, onAction: reroute });
 */
export type WarningVariant = "verboden" | "nadert" | "venstertijd" | "rijbaan" | "geen-route";

export function Warning({ variant = "verboden", zone, distance, window: win, title, body, cta, duration, onAction, onDismiss }: {
  variant?: WarningVariant;
  zone?: string;
  distance?: number;
  window?: string;
  title?: string;
  body?: string;
  cta?: string;
  duration?: number;
  onAction?: () => void;
  onDismiss?: () => void;
}) {
  const ref = useRef<HTMLElement | null>(null);

  // register the custom element client-side
  useEffect(() => { import("~/lib/warning-card.js"); }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const act = () => onAction?.();
    const dis = () => onDismiss?.();
    el.addEventListener("scoot-action", act);
    el.addEventListener("scoot-dismiss", dis);
    return () => {
      el.removeEventListener("scoot-action", act);
      el.removeEventListener("scoot-dismiss", dis);
    };
  }, [onAction, onDismiss]);

  return (
    // @ts-expect-error custom element
    <scoot-warning ref={ref} variant={variant} zone={zone}
      distance={distance} window={win} title={title} body={body}
      cta={cta} duration={duration} />
  );
}

/** Imperative variant: floats above everything, one at a time. */
export function useWarning() {
  const mod = useRef<any>(null);
  useEffect(() => { import("~/lib/warning-card.js").then((m) => { mod.current = m; }); }, []);
  return {
    show: (opts: Parameters<typeof Warning>[0] & { duration?: number }) =>
      mod.current?.showWarning(opts),
  };
}

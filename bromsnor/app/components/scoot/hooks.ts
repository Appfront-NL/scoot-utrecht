import { useEffect, useRef } from "react";

/**
 * SCOOT Wrapped (the story flow + share card) as a hook. The heavy
 * lifting lives in app/lib/wrapped.js; this loads it client-side
 * and hands you an open().
 *
 * @example
 * const wrapped = useWrapped();
 * <Button onClick={wrapped.open}>Bekijk je jaar</Button>
 */
export function useWrapped() {
  const mod = useRef<any>(null);
  useEffect(() => {
    import("~/lib/wrapped.js").then((m) => { m.initWrapped(); mod.current = m; });
  }, []);
  return { open: () => mod.current?.openWrapped() };
}

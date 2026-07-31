import { useCallback, useRef, useState } from "react";

/**
 * The pill toast + a convenience hook.
 *
 * @example
 * const { toast, show } = useToast();
 * show("Netjes geparkeerd. Like a glove.");
 * …
 * <Toast text={toast} />
 */
export function Toast({ text }: { text: string | null }) {
  if (!text) return null;
  return <div className="app-toast">{text}</div>;
}

export function useToast(durationMs = 2600) {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((text: string) => {
    setToast(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), durationMs);
  }, [durationMs]);
  return { toast, show };
}

// ============================================================
// Coachmark: a small dark-violet bubble that points at a
// control and explains it once.
// ============================================================

/**
 * @example
 * <Coachmark title="Zet lagen aan of uit" body="Kies welke regels je op de kaart ziet."
 *   cta="Begrepen" onDone={dismiss}
 *   style={{ right: 66, top: "42%" }} arrow="right" />
 */

import type { CSSProperties } from "react";

export function Coachmark({ title, body, cta = "Begrepen", counter, onDone, style, arrow = "right" }: {
  title: string; body: string; cta?: string; counter?: string;
  onDone: () => void; style?: CSSProperties; arrow?: "right" | "left" | "up" | "down";
}) {
  const tip: CSSProperties = { position: "absolute", width: 12, height: 12, background: "#4c1d95", transform: "rotate(45deg)" };
  const tipPos: Record<string, CSSProperties> = {
    right: { right: -5, top: 28 },
    left: { left: -5, top: 28 },
    up: { top: -5, left: 28 },
    down: { bottom: -5, left: 28 },
  };
  return (
    <div style={{
      position: "fixed", zIndex: 60, width: 300, borderRadius: 16,
      background: "#4c1d95", color: "#ede9fe", padding: "14px 16px",
      boxShadow: "0 14px 40px rgba(76,29,149,.4)",
      font: "400 13px 'DM Sans', sans-serif", ...style,
    }}>
      <span style={{ ...tip, ...tipPos[arrow] }} />
      <b style={{ display: "block", font: "600 14.5px 'DM Sans'", color: "#fff", marginBottom: 3 }}>{title}</b>
      <p style={{ margin: "0 0 12px", lineHeight: 1.5 }}>{body}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <small style={{ color: "#c4b5fd" }}>{counter ?? ""}</small>
        <button
          type="button" onClick={onDone}
          style={{
            padding: "7px 16px", borderRadius: 99, border: "none",
            background: "#fff", color: "#4c1d95", font: "600 13px 'DM Sans'", cursor: "pointer",
          }}
        >{cta}</button>
      </div>
    </div>
  );
}

// ============================================================
// DirectionList: the route as a readable list of turns — for
// reading the route up front instead of only while riding.
// ============================================================

/**
 * @example
 * <DirectionList steps={[
 *   { kind: "right", label: "Rechtsaf", street: "Lange Nieuwstraat", distanceM: 575 },
 *   { kind: "arrival", label: "Aankomst", street: "Domplein", distanceM: 276 },
 * ]} />
 */

export type DirectionStep = {
  kind: "left" | "right" | "straight" | "arrival";
  label: string;
  street?: string | null;
  distanceM?: number;
};

const ICONS: Record<DirectionStep["kind"], React.ReactNode> = {
  left: <path d="M9 14 5 10l4-4M5 10h8a4 4 0 0 1 4 4v4" />,
  right: <path d="M15 14l4-4-4-4M19 10h-8a4 4 0 0 0-4 4v4" />,
  straight: <path d="M12 19V5M8 9l4-4 4 4" />,
  arrival: <path d="M9 11.8l2.1 2.1 4-4.2" />,
};

const fmt = (m?: number) =>
  m === undefined ? "" : m >= 1000 ? (m / 1000).toFixed(1).replace(".", ",") + " km" : Math.max(10, Math.round(m / 10) * 10) + " m";

export function DirectionList({ steps }: { steps: DirectionStep[] }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12, padding: "0 15px" }}>
      {steps.map((s, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 13, padding: "12px 0",
          borderBottom: i < steps.length - 1 ? "1px solid #eef1f5" : "none",
          font: "400 12.5px 'DM Sans', sans-serif",
        }}>
          <span style={{
            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
            background: s.kind === "arrival" ? "#f0fdf4" : "#f5f3ff",
            color: s.kind === "arrival" ? "#10b981" : "#8b5cf6",
            display: "grid", placeItems: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {s.kind === "arrival" && <circle cx="12" cy="12" r="9" />}
              {ICONS[s.kind]}
            </svg>
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <b style={{ display: "block", font: "600 14.5px 'DM Sans'", color: "#0f172a" }}>{s.label}</b>
            {s.street && <small style={{ color: "#64748b" }}>{s.street}</small>}
          </span>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>{fmt(s.distanceM)}</span>
        </div>
      ))}
    </div>
  );
}

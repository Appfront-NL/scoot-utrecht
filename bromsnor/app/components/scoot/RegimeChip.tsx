// ============================================================
// RegimeChip: the regime of a zone as a small pill. Three
// variants matching the zone colors on the map. From the
// "Aanvulling op de kit" Figma canvas.
// ============================================================

/**
 * @example
 * <RegimeChip regime="verboden" />
 * <RegimeChip regime="rijbaan" />   // shows "· helm"
 * <RegimeChip regime="fietspad" />
 */

const STYLES: Record<string, { bg: string; fg: string; dot: string; label: string }> = {
  verboden: { bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444", label: "Verboden" },
  rijbaan: { bg: "#fffbeb", fg: "#b45309", dot: "#f59e0b", label: "Rijbaan · helm" },
  fietspad: { bg: "#f0fdf4", fg: "#15803d", dot: "#10b981", label: "Fietspad" },
};

export function RegimeChip({ regime, label }: { regime: "verboden" | "rijbaan" | "fietspad"; label?: string }) {
  const s = STYLES[regime] ?? STYLES.verboden;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: "6px 12px", borderRadius: 99, background: s.bg, color: s.fg,
      font: "600 12.5px 'DM Sans', sans-serif", letterSpacing: ".02em",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot }} />
      {label ?? s.label}
    </span>
  );
}

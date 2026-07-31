// ============================================================
// SourceLink: the reference to the decree behind a rule — the
// trust layer. Belongs wherever a regime is shown.
// ============================================================

/**
 * @example
 * <SourceLink sub="Gemeenteblad nr. 213902" onClick={openDecree} />
 */

export function SourceLink({ label = "Lees het verkeersbesluit", sub, onClick }: {
  label?: string; sub?: string; onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%",
        background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12,
        padding: "12px 14px", cursor: "pointer", textAlign: "left",
        font: "400 12.5px 'DM Sans', sans-serif",
      }}
    >
      <span style={{
        width: 34, height: 34, borderRadius: 10, background: "#eff6ff", color: "#2f6fed",
        display: "grid", placeItems: "center", flexShrink: 0,
      }}>
        <svg width="17" height="17" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" /><path d="M14 2v5h5" /></svg>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <b style={{ display: "block", font: "600 14px 'DM Sans'", color: "#2f6fed" }}>{label}</b>
        {sub && <small style={{ color: "#64748b" }}>{sub}</small>}
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
    </button>
  );
}

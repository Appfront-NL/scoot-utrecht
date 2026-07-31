// ============================================================
// EmptyState: an empty list with an icon, an explanation and a
// way out. For search, rides, notifications, achievements.
// ============================================================

/**
 * @example
 * <EmptyState title="Niets gevonden"
 *   body="Probeer een andere zoekterm of tik op de kaart."
 *   actionLabel="Zoek opnieuw" onAction={retry} />
 */

export function EmptyState({ title, body, actionLabel, onAction }: {
  title: string; body: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <div style={{
      display: "grid", justifyItems: "center", gap: 6, textAlign: "center",
      padding: "26px 18px", font: "400 13.5px 'DM Sans', sans-serif", color: "#64748b",
    }}>
      <span style={{
        width: 46, height: 46, borderRadius: "50%", marginBottom: 4,
        background: "#f1f5f9", color: "#94a3b8", display: "grid", placeItems: "center",
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9" fill="none" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></svg>
      </span>
      <b style={{ font: "600 15px 'DM Sans'", color: "#0f172a" }}>{title}</b>
      <p style={{ margin: 0, lineHeight: 1.5, maxWidth: 300 }}>{body}</p>
      {actionLabel && onAction && (
        <button
          type="button" onClick={onAction}
          style={{
            marginTop: 8, padding: "9px 18px", borderRadius: 99,
            border: "1px solid #c4b5fd", background: "#fff", color: "#6d3ae6",
            font: "600 13.5px 'DM Sans'", cursor: "pointer",
          }}
        >{actionLabel}</button>
      )}
    </div>
  );
}

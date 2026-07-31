// ============================================================
// ConfirmDialog: confirmation for something irreversible, with
// the consequences spelled out.
// ============================================================

/**
 * @example
 * <ConfirmDialog
 *   open={confirmStop}
 *   title="Rit stoppen?"
 *   body="Je route wordt niet bewaard en de zonewaarschuwingen stoppen."
 *   confirmLabel="Ja, stoppen"
 *   cancelLabel="Doorrijden"
 *   onConfirm={stop} onCancel={() => setConfirmStop(false)}
 * />
 */

export function ConfirmDialog({ open, title, body, confirmLabel, cancelLabel = "Annuleren", onConfirm, onCancel }: {
  open: boolean; title: string; body: string;
  confirmLabel: string; cancelLabel?: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog" aria-modal="true" aria-label={title}
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 80, display: "grid", placeItems: "center",
        background: "rgba(15,23,42,.42)", padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(340px, 92vw)", background: "#fff", borderRadius: 24,
          padding: "26px 22px 20px", textAlign: "center",
          boxShadow: "0 24px 60px rgba(15,23,42,.28)",
          font: "400 14px 'DM Sans', sans-serif", color: "#64748b",
        }}
      >
        <span style={{
          width: 52, height: 52, margin: "0 auto 14px", borderRadius: "50%",
          background: "#fef2f2", color: "#ef4444", display: "grid", placeItems: "center",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"><rect x="7" y="7" width="10" height="10" rx="1.5" /></svg>
        </span>
        <h2 style={{ margin: "0 0 6px", font: "600 19px 'DM Sans'", color: "#0f172a" }}>{title}</h2>
        <p style={{ margin: "0 0 18px", lineHeight: 1.5 }}>{body}</p>
        <button
          type="button" onClick={onConfirm}
          style={{
            width: "100%", padding: "13px 16px", borderRadius: 99, border: "none",
            background: "#ef4444", color: "#fff", font: "600 15px 'DM Sans'", cursor: "pointer",
          }}
        >{confirmLabel}</button>
        <button
          type="button" onClick={onCancel}
          style={{
            width: "100%", padding: "12px 16px", marginTop: 6, borderRadius: 99,
            border: "none", background: "transparent", color: "#64748b",
            font: "600 14.5px 'DM Sans'", cursor: "pointer",
          }}
        >{cancelLabel}</button>
      </div>
    </div>
  );
}

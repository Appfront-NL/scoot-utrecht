// ============================================================
// TimeWindowBar: a full day as a bar — when a ban applies and
// where "now" sits. Unique to this product: time windows come
// straight from the decree data.
// ============================================================

/**
 * @example
 * <TimeWindowBar from="11:00" to="18:00" />
 * <TimeWindowBar from="11:00" to="18:00" now="14:20" />  // fixed demo time
 */

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

export function TimeWindowBar({ from, to, now }: { from: string; to: string; now?: string }) {
  const d = new Date();
  const nowMin = now ? toMin(now) : d.getHours() * 60 + d.getMinutes();
  const pct = (min: number) => (min / 1440) * 100;
  const nowLabel = now ?? `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e8ecf2", borderRadius: 12,
      padding: "14px 16px 15px", display: "grid", gap: 9,
      font: "400 12.5px 'DM Sans', sans-serif", color: "#64748b",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></svg>
        <b style={{ flex: 1, font: "600 14px 'DM Sans'", color: "#0f172a" }}>Gesloten {from} tot {to}</b>
        <span>nu {nowLabel}</span>
      </div>
      <div style={{ position: "relative", height: 26, borderRadius: 7, background: "#f0fdf4", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: 0, bottom: 0,
          left: `${pct(toMin(from))}%`, width: `${pct(Math.max(0, toMin(to) - toMin(from)))}%`,
          background: "rgba(220,38,38,.24)",
        }} />
        <div style={{
          position: "absolute", top: 0, bottom: 0, width: 3, borderRadius: 2,
          left: `calc(${pct(nowMin)}% - 1px)`, background: "#0f172a",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#94a3b8" }}>
        <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
      </div>
    </div>
  );
}

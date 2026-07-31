import type { ZoneProps } from "./types";

/**
 * Zone-detail sheet (design 26): regime badge, description, live
 * venstertijd countdown, and the facts table that mirrors the
 * regeldata schema exactly (CONTRACT.md). Feed it the properties
 * of a tapped GeoJSON feature.
 *
 * @example
 * <ZoneDetail zone={feature.properties} onClose={close}
 *   onDecree={() => toast("Opent het Gemeenteblad")} />
 */
const REGIME_DETAIL: Record<string, { badge: string; cls: string; desc: (v: string, venster: boolean) => string }> = {
  verboden: { badge: "VERBODEN", cls: "", desc: (v, w) => `Hier mag je met een ${v} niet rijden${w ? " tijdens de venstertijd. Buiten die tijden is het wel toegestaan" : ""}.` },
  rijbaan: { badge: "NAAR DE RIJBAAN", cls: "rijbaan", desc: (v) => `Vanaf hier rijdt de ${v} op de rijbaan. Er geldt een helmplicht op dit weggedeelte.` },
  fietspad: { badge: "FIETSPAD TOEGESTAAN", cls: "fietspad", desc: (v) => `Hier mag je met een ${v} gewoon op het fietspad rijden.` },
};

export function ZoneDetail({ zone, onClose, onDecree }: {
  zone: ZoneProps; onClose: () => void; onDecree?: () => void;
}) {
  const regime = zone.regime && REGIME_DETAIL[zone.regime] ? zone.regime : "verboden";
  const info = REGIME_DETAIL[regime];
  const venster = zone.tijdvenster && zone.tijdvenster !== "null" ? zone.tijdvenster : null;
  return (
    <section className="panel sheet">
      <button className="grab" aria-label="Sluiten" onClick={onClose} />
      <span className={"zone-badge " + info.cls}>{info.badge}</span>
      <h2 className="panel-title">{zone.naam ?? "Zone"}</h2>
      <p className="sheet-sub">{info.desc(zone.voertuig ?? "scooter", !!venster)}</p>
      {venster && (
        <div className="zd-window">
          <b>{venster.replace(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/, "$1 tot $2")}</b>
          <span>{windowStatusLine(venster)}</span>
        </div>
      )}
      <dl className="zd-facts">
        <div><dt>Voertuig</dt><dd>{cap(zone.voertuig ?? "–")}</dd></div>
        <div><dt>Geldig vanaf</dt><dd>{fmtDateNl(zone.geldig_vanaf)}</dd></div>
        <div><dt>Zekerheid</dt><dd>{zone.zekerheid === "hard" ? "Hard, letterlijk in het besluit" : "Zacht, afgeleid uit de tekst"}</dd></div>
        <div><dt>Bron</dt><dd>{zone.bron === "mock" ? "Gemeenteblad (demo)" : zone.bron ?? "–"}</dd></div>
      </dl>
      <button className="zd-link" onClick={onDecree}>
        <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" /><path d="M14 2v5h5" /></svg>
        Lees het verkeersbesluit
      </button>
    </section>
  );
}

function windowStatusLine(venster: string): string {
  const m = venster.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!m) return "Geldt binnen de venstertijd.";
  const now = new Date();
  const nowH = now.getHours() + now.getMinutes() / 60;
  const from = +m[1] + +m[2] / 60, to = +m[3] + +m[4] / 60;
  if (nowH >= from && nowH < to) {
    const rest = Math.max(1, Math.round(to - nowH));
    return `Nu geldt het verbod. Over ${rest === 1 ? "1 uur" : rest + " uur"} mag je hier rijden.`;
  }
  return `Nu toegestaan. Vanaf ${m[1]}:${m[2]} geldt het verbod weer.`;
}
function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
function fmtDateNl(iso?: string) {
  if (!iso) return "–";
  const d = new Date(iso);
  if (isNaN(+d)) return iso;
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

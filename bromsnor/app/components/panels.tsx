// ============================================================
// Bottom panels + secondary sheets. Presentational; state and
// behavior live in the route (home.tsx).
// ============================================================

import { useMemo } from "react";

const ARROW = (
  <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
);

export type Destination = { name: string; area: string; point: [number, number]; saved?: boolean };

/* ---------- 1. search ---------- */

export function SearchPanel({ destinations, filter, onFilter, onPick, status }: {
  destinations: Destination[]; filter: string;
  onFilter: (v: string) => void; onPick: (d: Destination) => void;
  status: { text: string; error: boolean } | null;
}) {
  const list = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return destinations.filter((d) =>
      d.name.toLowerCase().includes(f) || d.area.toLowerCase().includes(f));
  }, [destinations, filter]);

  return (
    <section className="panel">
      <div className="grab" aria-hidden="true" />
      <h1 className="panel-title">
        Waar wil je heen?{" "}
        <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-3px" }}><circle cx="5.5" cy="17" r="3" /><circle cx="18.5" cy="17" r="3" /><path d="M8.5 17h7" /><path d="M18.5 17V9a2 2 0 0 0-2-2h-2" /><path d="M5.5 14l3.2-6.5h4.1" /><path d="M12.8 7.5 15 12" /></svg>
      </h1>
      <div className="search-field">
        <input value={filter} onChange={(e) => onFilter(e.target.value)}
          type="text" placeholder="Zoek op locatie…" autoComplete="off" enterKeyHint="search" />
        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></svg>
      </div>
      <div className="suggestions">
        {list.length ? list.map((d) => (
          <button className="suggestion" key={d.name} onClick={() => onPick(d)}>
            <span className="pin">
              {d.saved
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3-4.7-4.4 6.4-.8Z" /></svg>
                : <svg width="17" height="17" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10.5c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10.2" r="2.7" /></svg>}
            </span>
            <span><b>{d.name}</b><small>{d.area}</small></span>
          </button>
        )) : <p className="hint">Geen locatie gevonden. Of tik op de kaart.</p>}
      </div>
      {status && <p className={"hint" + (status.error ? " error" : "")} aria-live="polite">{status.text}</p>}
      <p className="hint">Of tik op de kaart om een bestemming te kiezen.</p>
    </section>
  );
}

/* ---------- 2. route overview ---------- */

export function OverviewPanel({ city, destination, distance, duration, warnings, onBack, onStart }: {
  city: string; destination: Destination;
  distance: string; duration: string; warnings: number;
  onBack: () => void; onStart: () => void;
}) {
  return (
    <section className="panel">
      <div className="grab" aria-hidden="true" />
      <button className="back" onClick={onBack} aria-label="Terug naar zoeken">
        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5-7 7 7 7" /></svg>
      </button>
      <h2 className="panel-title small">Route overzicht</h2>
      <div className="fromto">
        <div className="fromto-row"><span className="dot start" /><span><b>Huidige locatie</b><small>{city}</small></span></div>
        <div className="fromto-line" />
        <div className="fromto-row"><span className="dot end" /><span><b>{destination.name}</b><small>{destination.area ?? city}</small></span></div>
      </div>
      <div className="stats">
        <div className="stat"><span className="stat-value">{distance}</span><span className="stat-label">Afstand</span></div>
        <div className="stat"><span className="stat-value accent">{duration}</span><span className="stat-label">Reistijd</span></div>
        <div className="stat"><span className="stat-value">{warnings}</span><span className="stat-label">Waarschuwingen</span></div>
      </div>
      <button className="button" onClick={onStart}>Route starten {ARROW}</button>
    </section>
  );
}

/* ---------- 3. ride bar ---------- */

export function RidePanel({ time, distance, arrival, almost, onStop }: {
  time: string; distance: string; arrival: string; almost: boolean; onStop: () => void;
}) {
  return (
    <section className={"panel ride" + (almost ? " almost" : "")}>
      <div className="ride-stat"><span className="stat-value accent">{time}</span><span className="stat-label">{almost ? "Res. reistijd" : "Reistijd"}</span></div>
      <div className="ride-divider" />
      <div className="ride-stat"><span className="stat-value">{distance}</span><span className="stat-label">{almost ? "Res. afstand" : "Afstand"}</span></div>
      <div className="ride-divider" />
      <div className="ride-stat"><span className="stat-value">{arrival}</span><span className="stat-label">Aankomst</span></div>
      <button className="stop" onClick={onStop} aria-label="Rit stoppen">
        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.1" fill="none" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>
    </section>
  );
}

/* ---------- 4. arrived ---------- */

export function DonePanel({ destination, city, distance, duration, warnings, onNew }: {
  destination: string; city: string; distance: string; duration: string;
  warnings: number; onNew: () => void;
}) {
  return (
    <section className="panel">
      <div className="grab" aria-hidden="true" />
      <div className="done-check" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 5 5 10-11" /></svg>
      </div>
      <h2 className="panel-title small center">Je bent gearriveerd!</h2>
      <p className="done-sub">{destination}, {city}</p>
      <div className="stats">
        <div className="stat"><span className="stat-value">{distance}</span><span className="stat-label">Afstand</span></div>
        <div className="stat"><span className="stat-value">{duration}</span><span className="stat-label">Duur</span></div>
        <div className="stat"><span className="stat-value accent">{warnings}</span><span className="stat-label">Waarschuwingen</span></div>
      </div>
      <button className="button" onClick={onNew}>Nieuwe route plannen</button>
    </section>
  );
}

/* ---------- 5. route calculation loader (design 31) ---------- */

export function CalcPanel({ step, street, time }: { step: number; street: string | null; time: string }) {
  const items = [
    step > 0 && street ? `Route gevonden via ${street}` : "Route zoeken",
    "Verboden zones controleren",
    `Venstertijden voor ${time} checken`,
  ];
  return (
    <section className="panel">
      <div className="grab" aria-hidden="true" />
      <h2 className="panel-title">Route berekenen</h2>
      <p className="sheet-sub">We zoeken de snelste weg die binnen de regels blijft.</p>
      <ul className="calc-steps">
        {items.map((text, i) => (
          <li key={i} className={step > i ? "done" : step === i ? "active" : ""}>
            <span className="calc-ic" /><span>{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- sheets: kaartlagen (25) ---------- */

export type LayerState = { verboden: boolean; rijbaan: boolean; fietspad: boolean; venstertijd: boolean };

export function LayersSheet({ layers, onToggle, onWindow, onStreet, onClose }: {
  layers: LayerState;
  onToggle: (key: keyof LayerState, on: boolean) => void;
  onWindow: () => void; onStreet: () => void; onClose: () => void;
}) {
  const rows: { key: keyof LayerState; swatch: string; title: string; sub: string }[] = [
    { key: "verboden", swatch: "verboden", title: "Verboden", sub: "Hier mag je niet komen" },
    { key: "rijbaan", swatch: "rijbaan", title: "Naar de rijbaan", sub: "Helmplicht op dit weggedeelte" },
    { key: "fietspad", swatch: "fietspad", title: "Fietspad toegestaan", sub: "Gewoon doorrijden" },
    { key: "venstertijd", swatch: "venster", title: "Alleen binnen venstertijd", sub: "Wisselt per tijdstip" },
  ];
  return (
    <section className="panel sheet">
      <button className="grab" aria-label="Sluiten" onClick={onClose} />
      <h2 className="panel-title">Wat zie je op de kaart</h2>
      <p className="sheet-sub">Zet lagen aan of uit om te zien waar je met een snorfiets mag rijden.</p>
      <div className="layer-list">
        {rows.map((r) => (
          <label className="layer-row" key={r.key}>
            <span className={"layer-swatch " + r.swatch} />
            <span className="layer-copy"><b>{r.title}</b><small>{r.sub}</small></span>
            <span className="switch">
              <input type="checkbox" checked={layers[r.key]} onChange={(e) => onToggle(r.key, e.target.checked)} />
              <i />
            </span>
          </label>
        ))}
      </div>
      <div className="sheet-rows">
        <button className="sheet-row" onClick={onWindow}><b>Tijdvenster verkennen</b><span>›</span></button>
        <button className="sheet-row" onClick={onStreet}><b>Straat opzoeken</b><span>›</span></button>
      </div>
      <p className="hint">Helemaal inzoomen kan, maar dan zit je wel heeeeeeel erg op de details.</p>
    </section>
  );
}

/* ---------- sheets: zone-detail (26) ---------- */

export type ZoneProps = {
  regime?: string; naam?: string; tijdvenster?: string | null;
  voertuig?: string; geldig_vanaf?: string; zekerheid?: string; bron?: string;
};

const REGIME_DETAIL: Record<string, { badge: string; cls: string; desc: (v: string, venster: boolean) => string }> = {
  verboden: { badge: "VERBODEN", cls: "", desc: (v, w) => `Hier mag je met een ${v} niet rijden${w ? " tijdens de venstertijd. Buiten die tijden is het wel toegestaan" : ""}.` },
  rijbaan: { badge: "NAAR DE RIJBAAN", cls: "rijbaan", desc: (v) => `Vanaf hier rijdt de ${v} op de rijbaan. Er geldt een helmplicht op dit weggedeelte.` },
  fietspad: { badge: "FIETSPAD TOEGESTAAN", cls: "fietspad", desc: (v) => `Hier mag je met een ${v} gewoon op het fietspad rijden.` },
};

export function ZoneSheet({ zone, onClose, onDecree }: {
  zone: ZoneProps; onClose: () => void; onDecree: () => void;
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

/* ---------- sheets: tijdvenster verkennen (28) ---------- */

export function WindowSheet({ hour, onHour, onClose }: {
  hour: number; onHour: (h: number) => void; onClose: () => void;
}) {
  const hh = Math.floor(hour), mm = Math.round((hour - hh) * 60);
  const label = `${hh}:${String(mm).padStart(2, "0")}`;
  const closed = hour >= 11 && hour < 18;
  return (
    <section className="panel sheet">
      <button className="grab" aria-label="Sluiten" onClick={onClose} />
      <h2 className="panel-title">Hoe ziet de kaart er straks uit?</h2>
      <p className="sheet-sub">Sommige verboden gelden alleen binnen venstertijden. Schuif door de dag om te zien wat er verandert.</p>
      <input className="window-slider" type="range" min={6} max={23} step={0.25}
        value={hour} onChange={(e) => onHour(+e.target.value)} aria-label="Tijdstip" />
      <div className="window-marks"><span>06:00</span><span>11:00</span><span id="window-now">{label}</span><span>18:00</span><span>23:00</span></div>
      <div className={"window-state" + (closed ? "" : " open")}>
        {closed
          ? <><b>Nu gesloten: Steenweg en Lijnmarkt</b><span>Venstertijd ma-za 11:00 tot 18:00</span></>
          : <><b>Na 18:00 mag je hier wel rijden</b><span>Dan vervalt het voetgangersgebied</span></>}
      </div>
    </section>
  );
}

/* ---------- sheets: straat opzoeken (29) ---------- */

export function StreetSheet({ onClose }: { onClose: () => void }) {
  return (
    <section className="panel sheet">
      <button className="grab" aria-label="Sluiten" onClick={onClose} />
      <h2 className="panel-title">Mag ik hier rijden?</h2>
      <div className="search-field">
        <input type="text" defaultValue="Biltstraat" autoComplete="off" />
        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></svg>
      </div>
      <div className="street-cards">
        <div className="street-card rijbaan"><b>Naar de rijbaan</b><span>Tussen Nachtegaalstraat en Waterlinieweg. Helmplicht.</span></div>
        <div className="street-card fietspad"><b>Fietspad toegestaan</b><span>Ter hoogte van de kruising met de Oorsprongslaan.</span></div>
        <div className="street-card wijziging"><b>Verandert per 1 december</b><span>Dan gaat het hele weggedeelte naar de rijbaan.</span></div>
      </div>
    </section>
  );
}

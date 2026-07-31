import type { Destination } from "./types";
import { Stats } from "./Stats";
import { DirectionList, type DirectionStep } from "./DirectionList";

/**
 * "Route overzicht" — from/to, stats, start button (design 06).
 *
 * @example
 * <RouteOverview city="Utrecht" destination={dest} distance="620 m"
 *   duration="2 min" warnings={1} onBack={back} onStart={start} />
 */
export function RouteOverview({ city, destination, distance, duration, warnings, steps, onBack, onStart }: {
  city: string; destination: Destination;
  distance: string; duration: string; warnings: number;
  /** Optional turn-by-turn preview (DirectionList) under the stats. */
  steps?: DirectionStep[];
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
      <Stats items={[
        { value: distance, label: "Afstand" },
        { value: duration, label: "Reistijd", accent: true },
        { value: warnings, label: "Waarschuwingen" },
      ]} />
      {steps && steps.length > 0 && (
        <details style={{ margin: "0 0 14px" }}>
          <summary style={{
            cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", gap: 6,
            font: "600 13px 'DM Sans'", color: "#6d3ae6",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            Stap voor stap ({steps.length})
          </summary>
          <div style={{ marginTop: 10, maxHeight: 190, overflowY: "auto" }}>
            <DirectionList steps={steps} />
          </div>
        </details>
      )}
      <button className="button" onClick={onStart}>Route starten{" "}
        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
      </button>
    </section>
  );
}

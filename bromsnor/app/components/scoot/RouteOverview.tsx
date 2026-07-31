import type { Destination } from "./types";
import { Stats } from "./Stats";

/**
 * "Route overzicht" — from/to, stats, start button (design 06).
 *
 * @example
 * <RouteOverview city="Utrecht" destination={dest} distance="620 m"
 *   duration="2 min" warnings={1} onBack={back} onStart={start} />
 */
export function RouteOverview({ city, destination, distance, duration, warnings, onBack, onStart }: {
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
      <Stats items={[
        { value: distance, label: "Afstand" },
        { value: duration, label: "Reistijd", accent: true },
        { value: warnings, label: "Waarschuwingen" },
      ]} />
      <button className="button" onClick={onStart}>Route starten{" "}
        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
      </button>
    </section>
  );
}

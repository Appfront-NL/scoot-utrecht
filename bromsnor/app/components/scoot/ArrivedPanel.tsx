import { Stats } from "./Stats";

/**
 * "Je bent gearriveerd!" — trip summary + new-route button (design 10).
 *
 * @example
 * <ArrivedPanel destination="Domplein" city="Utrecht" distance="620 m"
 *   duration="2 min" warnings={1} onNew={reset} />
 */
export function ArrivedPanel({ destination, city, distance, duration, warnings, onNew }: {
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
      <Stats items={[
        { value: distance, label: "Afstand" },
        { value: duration, label: "Duur" },
        { value: warnings, label: "Waarschuwingen", accent: true },
      ]} />
      <button className="button" onClick={onNew}>Nieuwe route plannen</button>
    </section>
  );
}

/**
 * The bottom bar during a ride: remaining time/distance/ETA plus
 * the stop button. `almost` flips to the "Res." labels (design 09).
 *
 * @example
 * <RideBar time="2 min" distance="610 m" arrival="13:43" almost={false} onStop={stop} />
 */
export function RideBar({ time, distance, arrival, almost, onStop }: {
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

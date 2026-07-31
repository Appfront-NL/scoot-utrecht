import { Plate } from "./Plate";

/**
 * "Welk kenteken heeft je scooter?" — vehicle choice as real NL
 * plates (design 33). Controlled.
 *
 * @example
 * <PlatePicker vehicle={v} onSelect={setV} onNext={next} />
 */
export function PlatePicker({ vehicle, onSelect, onNext }: {
  vehicle: string; onSelect: (v: string) => void; onNext: () => void;
}) {
  const CHECK = (
    <svg width="15" height="15" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 5 5 10-11" /></svg>
  );
  return (
    <section className="plate-screen">
      <div className="plate-inner">
        <p className="eyebrow">SCOOT</p>
        <h2 className="plate-title">Welk kenteken heeft je scooter?</h2>
        <p className="plate-sub">De kleur van je plaat bepaalt waar je mag rijden. Op sommige wegen mag de een wel en de ander niet.</p>

        <button className={"plate-card" + (vehicle === "snorfiets" ? " selected" : "")} onClick={() => onSelect("snorfiets")}>
          <Plate color="blue" number="52-ND-3" />
          <span className="plate-meta"><b>Snorfiets</b><small>Maximaal 25 km/u</small></span>
          <span className="plate-check" aria-hidden="true">{CHECK}</span>
        </button>
        <button className={"plate-card" + (vehicle === "bromfiets" ? " selected" : "")} onClick={() => onSelect("bromfiets")}>
          <Plate color="yellow" number="8-TFP-42" />
          <span className="plate-meta"><b>Bromfiets</b><small>Maximaal 45 km/u</small></span>
          <span className="plate-check" aria-hidden="true">{CHECK}</span>
        </button>

        <div className="plate-note">
          <b>Helm verplicht</b>
          <span>Sinds 2023 ook voor snorfietsen met een blauwe plaat.</span>
        </div>
        <button className="button" onClick={onNext}>Verder</button>
      </div>
    </section>
  );
}

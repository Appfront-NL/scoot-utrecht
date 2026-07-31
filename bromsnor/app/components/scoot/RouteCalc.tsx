/**
 * "Route berekenen" checklist loader (design 31). Drive `step`
 * 0→3 while your route request is in flight; pass the street once
 * known and it appears in step one.
 *
 * @example
 * <RouteCalc step={calcStep} street="Oudegracht" time="14:20" />
 */
export function RouteCalc({ step, street, time }: {
  step: number; street: string | null; time: string;
}) {
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

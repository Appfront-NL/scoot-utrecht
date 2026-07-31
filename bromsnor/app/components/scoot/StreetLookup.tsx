/**
 * "Mag ik hier rijden?" — street rule lookup (design 29, demo data).
 *
 * @example
 * <StreetLookup onClose={close} />
 */
export function StreetLookup({ onClose }: { onClose: () => void }) {
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

/**
 * "Hoe ziet de kaart er straks uit?" — the time-window slider
 * (design 28). Controlled: you own the hour and can mirror it to
 * the map (e.g. hide window zones outside 11:00–18:00).
 *
 * @example
 * <WindowExplorer hour={h} onHour={setH} onClose={close} />
 */
export function WindowExplorer({ hour, onHour, onClose }: {
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

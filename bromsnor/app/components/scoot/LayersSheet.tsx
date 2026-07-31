import type { LayerState } from "./types";
import { Switch } from "./Switch";

/**
 * "Wat zie je op de kaart" — regime toggles + rows to the window
 * explorer and street lookup (design 25).
 *
 * @example
 * <LayersSheet layers={layers} onToggle={toggle}
 *   onWindow={openWindow} onStreet={openStreet} onClose={close} />
 */
export function LayersSheet({ layers, onToggle, onWindow, onStreet, onClose }: {
  layers: LayerState;
  onToggle: (key: keyof LayerState, on: boolean) => void;
  onWindow?: () => void; onStreet?: () => void; onClose: () => void;
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
            <Switch checked={layers[r.key]} onChange={(on) => onToggle(r.key, on)} label={r.title} />
          </label>
        ))}
      </div>
      {(onWindow || onStreet) && (
        <div className="sheet-rows">
          {onWindow && <button className="sheet-row" onClick={onWindow}><b>Tijdvenster verkennen</b><span>›</span></button>}
          {onStreet && <button className="sheet-row" onClick={onStreet}><b>Straat opzoeken</b><span>›</span></button>}
        </div>
      )}
      <p className="hint">Helemaal inzoomen kan, maar dan zit je wel heeeeeeel erg op de details.</p>
    </section>
  );
}

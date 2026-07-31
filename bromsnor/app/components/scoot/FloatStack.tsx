/**
 * Floating map controls, right side: layers, locate, and (while
 * riding) the voice toggle.
 *
 * @example
 * <FloatStack riding={riding} soundOn={soundOn}
 *   onSound={toggleSound} onLayers={openLayers} onLocate={recenter} />
 */
export function FloatStack({ riding, soundOn = true, onSound, onLayers, onLocate }: {
  riding?: boolean; soundOn?: boolean;
  onSound?: () => void; onLayers?: () => void; onLocate?: () => void;
}) {
  return (
    <div className="float-stack">
      {riding && (
        <button className={"info-button" + (soundOn ? "" : " active")} onClick={onSound} aria-label="Gesproken aanwijzingen">
          <svg width="19" height="19" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" /><path d="M15.5 8.8a4.5 4.5 0 0 1 0 6.4" /></svg>
        </button>
      )}
      <button className="info-button" onClick={onLayers} aria-label="Kaartlagen">
        <svg width="19" height="19" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2.7 9 5-9 5-9-5 9-5Z" /><path d="m3 12.8 9 5 9-5" /><path d="m3 17.3 9 5 9-5" /></svg>
      </button>
      <button className="info-button" onClick={onLocate} aria-label="Centreer op mijn locatie">
        <svg width="19" height="19" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
      </button>
    </div>
  );
}

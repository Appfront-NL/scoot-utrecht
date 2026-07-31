// ============================================================
// Map chrome — topbar, floating controls, nav banner, demo speed
// and the toast. Presentational; all behavior comes in as props.
// ============================================================

const ICON = {
  bell: <svg width="19" height="19" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>,
  info: <svg width="19" height="19" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.2" /><path d="M12 16v-4.5M12 8h.01" /></svg>,
  sound: <svg width="19" height="19" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" /><path d="M15.5 8.8a4.5 4.5 0 0 1 0 6.4" /></svg>,
  layers: <svg width="19" height="19" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2.7 9 5-9 5-9-5 9-5Z" /><path d="m3 12.8 9 5 9-5" /><path d="m3 17.3 9 5 9-5" /></svg>,
  locate: <svg width="19" height="19" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>,
};

export const ARROWS: Record<string, React.ReactNode> = {
  left: <svg width="26" height="26" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.1" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M15 20V11a4 4 0 0 0-4-4H6" /><path d="m10 3-5 4 5 4" /></svg>,
  right: <svg width="26" height="26" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.1" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 20V11a4 4 0 0 1 4-4h5" /><path d="m14 3 5 4-5 4" /></svg>,
  arrival: <svg width="26" height="26" viewBox="0 0 24 24" stroke="#fff" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4M5 5h11l-2 3.5 2 3.5H5" /></svg>,
};

export function TopBar({ city, hasUnread, onBell, onAccount, onRules }: {
  city: string; hasUnread: boolean;
  onBell: () => void; onAccount: () => void; onRules: () => void;
}) {
  return (
    <header className="topbar">
      <button className="info-button" onClick={onBell} aria-label="Meldingen">
        {ICON.bell}
        {hasUnread && <span className="notify-dot" aria-hidden="true" />}
      </button>
      <span className="map-title">{city}</span>
      <div className="top-right">
        <button className="avatar-button" onClick={onAccount} aria-label="Account">FD</button>
        <button className="info-button" onClick={onRules} aria-label="Regels en wetgeving">{ICON.info}</button>
      </div>
    </header>
  );
}

export function FloatStack({ riding, soundOn, onSound, onLayers, onLocate }: {
  riding: boolean; soundOn: boolean;
  onSound: () => void; onLayers: () => void; onLocate: () => void;
}) {
  return (
    <div className="float-stack">
      {riding && (
        <button className={"info-button" + (soundOn ? "" : " active")} onClick={onSound} aria-label="Gesproken aanwijzingen">
          {ICON.sound}
        </button>
      )}
      <button className="info-button" onClick={onLayers} aria-label="Kaartlagen">{ICON.layers}</button>
      <button className="info-button" onClick={onLocate} aria-label="Centreer op mijn locatie">{ICON.locate}</button>
    </div>
  );
}

export type BannerState = {
  distance: string; action: string; street: string | null;
  next: string | null; direction: string;
};

export function NavBanner({ banner }: { banner: BannerState }) {
  return (
    <div className="nav-banner" aria-live="polite">
      <div className="nav-banner-main">
        <span className="nav-banner-arrow">{ARROWS[banner.direction] ?? ARROWS.right}</span>
        <span style={{ minWidth: 0 }}>
          <span className="nav-banner-distance">{banner.distance}</span>
          <span className="nav-banner-action">{banner.action}</span>
          {banner.street && <span className="nav-banner-street">{banner.street}</span>}
        </span>
      </div>
      {banner.next && <div className="nav-banner-next">Volgende: <b>{banner.next}</b></div>}
    </div>
  );
}

export function DemoSpeed({ factor, onFactor }: { factor: number; onFactor: (x: number) => void }) {
  return (
    <div className="demo-speed" aria-label="Demosnelheid">
      {[1, 8, 25].map((x) => (
        <button key={x} className={factor === x ? "active" : ""} onClick={() => onFactor(x)}>{x}&times;</button>
      ))}
    </div>
  );
}

export function Toast({ text }: { text: string | null }) {
  if (!text) return null;
  return <div className="app-toast">{text}</div>;
}

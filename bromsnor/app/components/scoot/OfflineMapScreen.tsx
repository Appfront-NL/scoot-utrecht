// ============================================================
// Offline map screen: 75% download card with an animated
// progress bar, storage breakdown and the expiry note. Ported
// from app/lib/profile.js; styling in profile.css.
// ============================================================

/**
 * Fullscreen offline map status. The progress bar animates from
 * 0% to 75% each time the screen opens (skipped when the user
 * prefers reduced motion).
 *
 * @example
 * <OfflineMapScreen onBack={() => pop()} />
 */

import { useEffect, useState } from "react";

const backIcon = (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
);

export type OfflineMapScreenProps = {
  /** Whether the screen is slid in (adds the `is-open` class). Defaults to true. */
  open?: boolean;
  /** Stack z-index override, used by ProfileStack to layer screens. */
  zIndex?: number;
  onBack?: () => void;
};

export function OfflineMapScreen({ open = true, zIndex, onBack }: OfflineMapScreenProps) {
  const [barWidth, setBarWidth] = useState("0%");

  useEffect(() => {
    if (!open) {
      setBarWidth("0%");
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setBarWidth("75%");
      return;
    }
    setBarWidth("0%");
    // double rAF so the reset paints before the transition starts
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setBarWidth("75%"));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [open]);

  return (
    <section
      className={"profile-screen" + (open ? " is-open" : "")}
      data-screen="offline"
      role="dialog"
      aria-modal="true"
      aria-label="Offline kaart"
      style={zIndex !== undefined ? { zIndex } : undefined}
    >
      <div className="profile-screen-inner">
        <header className="profile-header">
          <button className="profile-back" onClick={onBack} aria-label="Terug">{backIcon}</button>
        </header>
        <h1 className="profile-title">Offline kaart</h1>
        <p className="profile-sub">Bewaar Utrecht op je telefoon. Handig als je in een tunnel of kelder geen bereik hebt.</p>
        <div className="profile-card profile-offline">
          <div className="profile-offline-head">
            <span className="profile-offline-pct">75%</span>
            <span className="profile-offline-label">Utrecht, 84 MB van 112 MB</span>
          </div>
          <div className="profile-progressbar" role="progressbar" aria-valuenow={75} aria-valuemin={0} aria-valuemax={100}>
            <i style={{ width: barWidth }} />
          </div>
          <dl className="profile-offline-break">
            <div><dt>Kaart en straten</dt><dd>68 MB</dd></div>
            <div><dt>Zones en verkeersbesluiten</dt><dd>14 MB</dd></div>
            <div><dt>Venstertijden</dt><dd>2 MB</dd></div>
          </dl>
        </div>
        <div className="profile-note">
          <b>Regels verlopen</b>
          <p>Offline zie je de regels van vandaag. Ververs minstens eens per maand.</p>
        </div>
      </div>
    </section>
  );
}

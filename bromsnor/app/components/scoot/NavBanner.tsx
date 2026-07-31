import type { BannerState } from "./types";

/**
 * The dark turn-by-turn banner (design 07): distance, maneuver,
 * street name and the "Volgende:" row.
 *
 * @example
 * <NavBanner banner={{ distance: "100 M", action: "Linksaf",
 *   street: "Christiaan Huygensplein", next: "→ Middenweg", direction: "left" }} />
 */
const ARROWS: Record<string, React.ReactNode> = {
  left: <svg width="26" height="26" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.1" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M15 20V11a4 4 0 0 0-4-4H6" /><path d="m10 3-5 4 5 4" /></svg>,
  right: <svg width="26" height="26" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.1" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 20V11a4 4 0 0 1 4-4h5" /><path d="m14 3 5 4-5 4" /></svg>,
  arrival: <svg width="26" height="26" viewBox="0 0 24 24" stroke="#fff" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4M5 5h11l-2 3.5 2 3.5H5" /></svg>,
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

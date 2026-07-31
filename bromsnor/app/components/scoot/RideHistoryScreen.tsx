// ============================================================
// Ride history screen: list of past rides with optional warning
// badges (Blikkendag, ganzendemonstratie, ...). Ported from
// app/lib/profile.js; presentational, styling in profile.css.
// ============================================================

/**
 * Fullscreen list of past rides. Renders the demo rides by default.
 *
 * @example
 * <RideHistoryScreen onBack={() => pop()} />
 *
 * @example
 * <RideHistoryScreen
 *   rides={[{ date: "Vandaag 13:35", route: "Oudegracht → Domplein", meta: "2,3 km · 8 min" }]}
 * />
 */

import { useNavigate } from "react-router";

const backIcon = (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
);

const warnIcon = (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 9v4M12 16.5h.01M10.3 3.9L2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
);

export type Ride = {
  date: string;
  route: string;
  meta: string;
  /** Optional warning badge text, e.g. "1 waarschuwing" or "Blikkendag". */
  warn?: string;
};

export const DEMO_RIDES: Ride[] = [
  { date: "Vandaag 13:35", route: "Oudegracht → Domplein", meta: "2,3 km · 8 min" },
  { date: "Gisteren 09:12", route: "Vredenburg → Rijnsweerd", meta: "5,8 km · 19 min", warn: "1 waarschuwing" },
  { date: "Vrijdag 16:04", route: "Kantoor → Café Thijssen", meta: "1,9 km · 7 min", warn: "Blikkendag" },
  { date: "28 juli 18:40", route: "Domplein → Utrecht Centraal", meta: "3,1 km · 11 min", warn: "3 min omgeleid · ganzendemonstratie" },
  { date: "27 juli 08:05", route: "Jaarbeurs → Wilhelminapark", meta: "4,2 km · 14 min", warn: "2 waarschuwingen" },
  { date: "26 juli 17:22", route: "Neude → Oudegracht", meta: "1,7 km · 6 min" },
];

export type RideHistoryScreenProps = {
  /** Whether the screen is slid in (adds the `is-open` class). Defaults to true. */
  open?: boolean;
  /** Stack z-index override, used by ProfileStack to layer screens. */
  zIndex?: number;
  /** Rides to show, newest first. Defaults to the demo rides. */
  rides?: Ride[];
  onBack?: () => void;
};

export function RideHistoryScreen({
  open = true,
  zIndex,
  rides = DEMO_RIDES,
  onBack,
}: RideHistoryScreenProps) {
  return (
    <section
      className={"profile-screen" + (open ? " is-open" : "")}
      data-screen="rides"
      role="dialog"
      aria-modal="true"
      aria-label="Ritgeschiedenis"
      style={zIndex !== undefined ? { zIndex } : undefined}
    >
      <div className="profile-screen-inner">
        <header className="profile-header">
          <button className="profile-back" onClick={onBack} aria-label="Terug">{backIcon}</button>
        </header>
        <h1 className="profile-title">Ritgeschiedenis</h1>
        <div className="profile-rides">
          {rides.map((ride) => (
            <article className="profile-ride" key={ride.date + ride.route}>
              <span className="profile-ride-date">{ride.date}</span>
              <b>{ride.route}</b>
              <span className="profile-ride-meta">
                {ride.meta}
                {ride.warn && (
                  <span className="profile-warnbadge">{warnIcon}{ride.warn}</span>
                )}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- route-module exports, same pattern as SettingsScreen:
   the screen is also reachable as a standalone page. ---------- */
export async function loader() {
  return null;
}

export default function RidesPage() {
  const navigate = useNavigate();
  return <RideHistoryScreen onBack={() => navigate(-1)} />;
}

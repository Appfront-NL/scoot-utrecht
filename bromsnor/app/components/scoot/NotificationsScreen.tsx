// ============================================================
// Notifications screen: list with unread dots; the Wrapped item
// is a tappable button that fires onWrapped. Ported from
// app/lib/profile.js; presentational, styling in profile.css.
// ============================================================

/**
 * Fullscreen notification list. Renders the demo notifications
 * by default; pass `notifications` for your own list.
 *
 * @example
 * <NotificationsScreen
 *   onBack={() => pop()}
 *   onWrapped={() => startWrapped()}
 * />
 */

const backIcon = (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
);

export type Notification = {
  title: string;
  time: string;
  body: string;
  unread?: boolean;
  /** Marks the tappable Wrapped notification. */
  wrapped?: boolean;
};

export const DEMO_NOTIFICATIONS: Notification[] = [
  { title: "Nieuwe regel op je route", time: "2 u", body: "De Vleutenseweg gaat per 1 september naar de rijbaan. Vanaf dan geldt daar een helmplicht.", unread: true },
  { title: "Je SCOOT Wrapped staat klaar", time: "1 d", body: "Bekijk hoeveel je dit jaar door Utrecht reed.", unread: true, wrapped: true },
  { title: "Venstertijd gewijzigd", time: "3 d", body: "De Steenweg is voortaan ook op zaterdag gesloten van 11:00 tot 18:00." },
  { title: "Kaart bijgewerkt", time: "1 w", body: "340 verkeersbesluiten opnieuw ingelezen." },
  { title: "Vergeet niet je uren te schrijven", time: "vr 15:00", body: "Oh wacht, verkeerde app. Maar nu je er toch bent." },
  { title: "Ganzenprotest op de Oudegracht", time: "2 d", body: "“Eerlijke korrels, geen dwangvoeding.” De route houdt vandaag wat afstand van het water." },
  { title: "Blikkendag", time: "vr 16:00", body: "Terrasroute naar Café Thijssen staat voor je klaar." },
  { title: "Regen op komst", time: "3 u", body: "Schuilbruggen langs je route gemarkeerd. Buienradar zei droog. Ja ja." },
  { title: "Geplande rit wacht", time: "9 mnd", body: "Poldersport Uithoorn staat nog steeds in je agenda. Ooit gaan we echt." },
];

export type NotificationsScreenProps = {
  /** Whether the screen is slid in (adds the `is-open` class). Defaults to true. */
  open?: boolean;
  /** Stack z-index override, used by ProfileStack to layer screens. */
  zIndex?: number;
  /** Notifications to show, newest first. Defaults to the demo list. */
  notifications?: Notification[];
  onBack?: () => void;
  /** Fired when the Wrapped notification is tapped. */
  onWrapped?: () => void;
};

export function NotificationsScreen({
  open = true,
  zIndex,
  notifications = DEMO_NOTIFICATIONS,
  onBack,
  onWrapped,
}: NotificationsScreenProps) {
  return (
    <section
      className={"profile-screen" + (open ? " is-open" : "")}
      data-screen="notifications"
      role="dialog"
      aria-modal="true"
      aria-label="Meldingen"
      style={zIndex !== undefined ? { zIndex } : undefined}
    >
      <div className="profile-screen-inner">
        <header className="profile-header">
          <button className="profile-back" onClick={onBack} aria-label="Terug">{backIcon}</button>
        </header>
        <h1 className="profile-title">Meldingen</h1>
        <div className="profile-notifs">
          {notifications.map((item) => {
            const inner = (
              <>
                <span className="profile-notif-head">
                  {item.unread && <span className="profile-dot" aria-label="Ongelezen" />}
                  <b>{item.title}</b>
                  <span className="profile-notif-time">{item.time}</span>
                </span>
                <p>{item.body}</p>
              </>
            );
            return item.wrapped ? (
              <button className="profile-notif" onClick={onWrapped} key={item.title}>
                {inner}
              </button>
            ) : (
              <article className="profile-notif" key={item.title}>
                {inner}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

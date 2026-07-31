/**
 * Map topbar (design 03): notifications bell (with unread dot),
 * centered city name, account avatar and info button.
 *
 * @example
 * <TopBar city="Utrecht" hasUnread onBell={openNotifications}
 *   onAccount={openAccount} onRules={openRules} />
 */
export function TopBar({ city, hasUnread, initials = "FD", onBell, onAccount, onRules }: {
  city: string; hasUnread?: boolean; initials?: string;
  onBell?: () => void; onAccount?: () => void; onRules?: () => void;
}) {
  return (
    <header className="topbar">
      <button className="info-button" onClick={onBell} aria-label="Meldingen">
        <svg width="19" height="19" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
        {hasUnread && <span className="notify-dot" aria-hidden="true" />}
      </button>
      <span className="map-title">{city}</span>
      <div className="top-right">
        <button className="avatar-button" onClick={onAccount} aria-label="Account">{initials}</button>
        <button className="info-button" onClick={onRules} aria-label="Regels en wetgeving">
          <svg width="19" height="19" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.2" /><path d="M12 16v-4.5M12 8h.01" /></svg>
        </button>
      </div>
    </header>
  );
}

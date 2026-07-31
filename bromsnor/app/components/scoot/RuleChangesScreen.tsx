// ============================================================
// Rule changes screen: timeline of upcoming and recent traffic
// decrees with "Lees het besluit" links. Ported from
// app/lib/profile.js; presentational, styling in profile.css.
// ============================================================

/**
 * Fullscreen timeline of rule changes. Every card has a
 * "Lees het besluit" link that fires `onDecree` (no-op by default;
 * the original demo shows the toast "Opent het Gemeenteblad").
 *
 * @example
 * <RuleChangesScreen
 *   onBack={() => pop()}
 *   onDecree={() => toast("Opent het Gemeenteblad")}
 * />
 */

const backIcon = (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
);

const arrowIcon = (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export type RuleChange = { date: string; title: string; body: string };

export const DEMO_CHANGES: RuleChange[] = [
  { date: "Per 1 september", title: "Vleutenseweg naar de rijbaan", body: "De fietspaden aan weerszijden worden gesloten voor snorfietsen. Helmplicht vanaf dat moment." },
  { date: "Per 1 december", title: "Biltstraat volgt later", body: "Uitgesteld vanwege herinrichtingswerkzaamheden." },
  { date: "Sinds 3 juni", title: "Steenweg voetgangersgebied", body: "Gesloten voor snorfietsen van ma-za 11:00 tot 18:00." },
];

export type RuleChangesScreenProps = {
  /** Whether the screen is slid in (adds the `is-open` class). Defaults to true. */
  open?: boolean;
  /** Stack z-index override, used by ProfileStack to layer screens. */
  zIndex?: number;
  onBack?: () => void;
  /** Fired when a "Lees het besluit" link is clicked. Defaults to a no-op. */
  onDecree?: () => void;
};

export function RuleChangesScreen({ open = true, zIndex, onBack, onDecree }: RuleChangesScreenProps) {
  return (
    <section
      className={"profile-screen" + (open ? " is-open" : "")}
      data-screen="rulechanges"
      role="dialog"
      aria-modal="true"
      aria-label="Regelwijzigingen"
      style={zIndex !== undefined ? { zIndex } : undefined}
    >
      <div className="profile-screen-inner">
        <header className="profile-header">
          <button className="profile-back" onClick={onBack} aria-label="Terug">{backIcon}</button>
        </header>
        <h1 className="profile-title">Wat verandert er</h1>
        <p className="profile-sub">Nieuwe verkeersbesluiten die jouw vaste routes raken.</p>
        <div className="profile-timeline">
          {DEMO_CHANGES.map((change) => (
            <article className="profile-change" key={change.title}>
              <span className="profile-change-date">{change.date}</span>
              <b>{change.title}</b>
              <p>{change.body}</p>
              <a
                href="#"
                className="profile-decree"
                onClick={(e) => {
                  e.preventDefault();
                  onDecree?.();
                }}
              >
                Lees het besluit {arrowIcon}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

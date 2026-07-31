// ============================================================
// Achievements screen: earned badges, quests with progress bars
// and the Mickront mystery quest. Ported from app/lib/profile.js;
// presentational, styling in profile.css.
// ============================================================

/**
 * Fullscreen achievements overview with the demo badges and quests
 * baked in (including the Mickront easter egg at 0/1).
 *
 * @example
 * <AchievementsScreen onBack={() => pop()} />
 */

import type { ReactNode } from "react";

const icon = (paths: ReactNode, size = 20) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths}</svg>
);

const ICONS = {
  back: icon(<path d="M15 18l-6-6 6-6" />, 22),
  clock: icon(<><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></>),
  helmet: icon(<><path d="M4 16v-2a8 8 0 0 1 16 0v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path d="M4 13.5h16" /></>, 24),
  shieldCheck: icon(<><path d="M12 3l7.5 3v5.2c0 4.6-3.2 7.7-7.5 9.3-4.3-1.6-7.5-4.7-7.5-9.3V6z" /><path d="M9 11.8l2.1 2.1 4-4.2" /></>, 24),
  waves: icon(<path d="M3 10c1.8-1.8 3.7-1.8 5.5 0s3.7 1.8 5.5 0 3.7-1.8 5.5 0M3 15c1.8-1.8 3.7-1.8 5.5 0s3.7 1.8 5.5 0 3.7-1.8 5.5 0" />, 24),
  moon: icon(<path d="M20.5 13.5A8.5 8.5 0 1 1 10.5 3.5a7 7 0 0 0 10 10z" />, 18),
  map: icon(<><path d="M9 4l6 2 5.5-2v14l-5.5 2-6-2-5.5 2V6z" /><path d="M9 4v14M15 6v14" /></>, 18),
  book: icon(<><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /></>, 18),
};

type Badge = { name: string; tint: "violet" | "green" | "blue"; icon: ReactNode };
type Quest = { icon: ReactNode; title: string; sub: string; count: string; pct: number };

const EARNED: Badge[] = [
  { name: "Helmheld", tint: "violet", icon: ICONS.helmet },
  { name: "Zonemeester", tint: "green", icon: ICONS.shieldCheck },
  { name: "Grachtenganger", tint: "blue", icon: ICONS.waves },
];

const QUESTS: Quest[] = [
  { icon: ICONS.map, title: "Kylian Mbappfront", sub: "Winnaar van de Saai Bedrijf Scooterpoule", count: "1/1", pct: 100 },
  { icon: ICONS.clock, title: "De Pakketjeswachter", sub: "Ritten uitgesteld omdat er nog een pakketje kwam", count: "12/15", pct: 80 },
  { icon: ICONS.moon, title: "Nachtbraker", sub: "25 ritten na 22:00 uur", count: "18/25", pct: 72 },
  { icon: ICONS.map, title: "Stratenmaker", sub: "200 verschillende straten gereden", count: "143/200", pct: 71.5 },
  { icon: ICONS.book, title: "Wetsgeleerde", sub: "Alle 12 regels in de kennisbank gelezen", count: "9/12", pct: 75 },
];

const MYSTERY: Quest = {
  icon: "🐭",
  title: "Mickront",
  sub: "Spot de muis die zich ergens op de kaart verstopt",
  count: "0/1",
  pct: 0,
};

function QuestRow({ quest }: { quest: Quest }) {
  return (
    <div className="profile-quest">
      <div className="profile-quest-head">
        <span className="profile-quest-icon">{quest.icon}</span>
        <span className="profile-quest-text"><b>{quest.title}</b><small>{quest.sub}</small></span>
        <span className="profile-quest-count">{quest.count}</span>
      </div>
      <div className="profile-progress"><i style={{ width: `${quest.pct}%` }} /></div>
    </div>
  );
}

export type AchievementsScreenProps = {
  /** Whether the screen is slid in (adds the `is-open` class). Defaults to true. */
  open?: boolean;
  /** Stack z-index override, used by ProfileStack to layer screens. */
  zIndex?: number;
  onBack?: () => void;
};

export function AchievementsScreen({ open = true, zIndex, onBack }: AchievementsScreenProps) {
  return (
    <section
      className={"profile-screen" + (open ? " is-open" : "")}
      data-screen="achievements"
      role="dialog"
      aria-modal="true"
      aria-label="Prestaties"
      style={zIndex !== undefined ? { zIndex } : undefined}
    >
      <div className="profile-screen-inner">
        <header className="profile-header">
          <button className="profile-back" onClick={onBack} aria-label="Terug">{ICONS.back}</button>
        </header>
        <h1 className="profile-title">Prestaties</h1>
        <p className="profile-sub">Verdiend door slim en netjes te rijden.</p>
        <div className="profile-badges">
          {EARNED.map((badge) => (
            <div className="profile-badge" key={badge.name}>
              <span className={`profile-badge-medal ${badge.tint}`}>{badge.icon}</span>
              <b>{badge.name}</b>
            </div>
          ))}
        </div>
        <div className="profile-card">
          {QUESTS.map((quest) => (
            <QuestRow quest={quest} key={quest.title} />
          ))}
        </div>
        <div className="profile-mystery">
          <QuestRow quest={MYSTERY} />
        </div>
      </div>
    </section>
  );
}

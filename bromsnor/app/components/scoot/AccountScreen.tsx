// ============================================================
// Account screen: identity, stat cards, Wrapped banner and the
// menu rows that link to the other profile screens. Ported from
// app/lib/profile.js; presentational, styling in profile.css.
// ============================================================

/**
 * Fullscreen account overview with demo data baked in as defaults.
 *
 * The payment row has no built-in flow: wire it up via `onPayment`
 * (this component ships no toast system of its own).
 *
 * @example
 * <AccountScreen
 *   onBack={() => setOpen(false)}
 *   onRideHistory={() => push("rides")}
 *   onPayment={() => openPaymentSheet()}
 *   onWrapped={() => startWrapped()}
 * />
 */

import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { useWrapped } from "./hooks";

const icon = (paths: ReactNode, size = 20) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths}</svg>
);

const ICONS = {
  back: icon(<path d="M15 18l-6-6 6-6" />, 22),
  chevron: icon(<path d="M9 6l6 6-6 6" />, 16),
  arrow: icon(<path d="M5 12h14M13 6l6 6-6 6" />),
  clock: icon(<><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></>),
  card: icon(<><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 9.5h19" /></>),
  shield: icon(<path d="M12 3l7.5 3v5.2c0 4.6-3.2 7.7-7.5 9.3-4.3-1.6-7.5-4.7-7.5-9.3V6z" />),
  sliders: icon(<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />),
  trophy: icon(<path d="M8 21h8M12 17v4M7 4h10v4.5a5 5 0 0 1-10 0zM7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4" />),
  doc: icon(<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>),
  download: icon(<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />),
};

export type AccountUser = { initials: string; name: string; email: string };

const DEMO_USER: AccountUser = {
  initials: "FD",
  name: "Fabian van Dijk",
  email: "fabian@appfront.nl",
};

export type AccountScreenProps = {
  /** Whether the screen is slid in (adds the `is-open` class). Defaults to true so a bare `<AccountScreen />` renders. */
  open?: boolean;
  /** Stack z-index override, used by ProfileStack to layer screens. */
  zIndex?: number;
  /** Identity shown in the header. Defaults to the demo user. */
  user?: AccountUser;
  onBack?: () => void;
  onRideHistory?: () => void;
  onPayment?: () => void;
  onRules?: () => void;
  onSettings?: () => void;
  onAchievements?: () => void;
  onRuleChanges?: () => void;
  onOfflineMap?: () => void;
  onWrapped?: () => void;
};

function Row({ icon: rowIcon, title, sub, onClick }: {
  icon: ReactNode; title: string; sub: string; onClick?: () => void;
}) {
  return (
    <button className="profile-row" onClick={onClick}>
      <span className="profile-row-icon">{rowIcon}</span>
      <span className="profile-row-text"><b>{title}</b><small>{sub}</small></span>
      <span className="profile-row-chevron">{ICONS.chevron}</span>
    </button>
  );
}

export function AccountScreen({
  open = true,
  zIndex,
  user = DEMO_USER,
  onBack,
  onRideHistory,
  onPayment,
  onRules,
  onSettings,
  onAchievements,
  onRuleChanges,
  onOfflineMap,
  onWrapped,
}: AccountScreenProps) {
  return (
    <section
      className={"profile-screen" + (open ? " is-open" : "")}
      data-screen="account"
      role="dialog"
      aria-modal="true"
      aria-label="Account"
      style={zIndex !== undefined ? { zIndex } : undefined}
    >
      <div className="profile-screen-inner">
        <header className="profile-header">
          <button className="profile-back" onClick={onBack} aria-label="Terug">{ICONS.back}</button>
        </header>
        <h1 className="profile-title">Account</h1>
        <div className="profile-identity">
          <span className="profile-avatar" aria-hidden="true">{user.initials}</span>
          <span><b>{user.name}</b><small>{user.email}</small></span>
        </div>
        <div className="profile-stats">
          <div className="profile-stat"><b>34</b><small>Ritten</small></div>
          <div className="profile-stat"><b>128 km</b><small>Gereden</small></div>
          <div className="profile-stat is-ok"><b>0</b><small>Overtredingen</small></div>
        </div>
        <button className="profile-wrapped" onClick={onWrapped}>
          <span className="profile-wrapped-icon">{ICONS.trophy}</span>
          <span className="profile-wrapped-copy">
            <b>SCOOT Wrapped 2026</b>
            <small>1.284 km, 0 overtredingen. Bekijk je jaar.</small>
          </span>
          <span className="profile-wrapped-arrow">{ICONS.arrow}</span>
        </button>
        <nav className="profile-rows" aria-label="Accountonderdelen">
          <Row icon={ICONS.clock} title="Ritgeschiedenis" sub="34 ritten" onClick={onRideHistory} />
          <Row icon={ICONS.card} title="Betaalmethode" sub="Visa •••• 4127" onClick={onPayment} />
          <Row icon={ICONS.shield} title="Regels en wetgeving" sub="Utrecht" onClick={onRules} />
          <Row icon={ICONS.sliders} title="Instellingen" sub="Voertuig, stem, meldingen" onClick={onSettings} />
          <Row icon={ICONS.trophy} title="Prestaties" sub="Verdiend door slim en netjes te rijden" onClick={onAchievements} />
          <Row icon={ICONS.doc} title="Regelwijzigingen" sub="Nieuwe verkeersbesluiten die jouw vaste routes raken" onClick={onRuleChanges} />
          <Row icon={ICONS.download} title="Offline kaart" sub="Utrecht, 84 MB van 112 MB" onClick={onOfflineMap} />
        </nav>
      </div>
    </section>
  );
}

/* ---------- route-module exports, same pattern as SettingsScreen:
   the screen is also reachable as a standalone page. ---------- */
export async function loader() {
  return null;
}

export default function AccountPage() {
  const navigate = useNavigate();
  const wrapped = useWrapped();
  return <AccountScreen
      onBack={() => navigate("/")}
      onRideHistory={() => navigate("/rides")}
      onSettings={() => navigate("/settings")}
      onAchievements={() => navigate("/achievements")}
      onRuleChanges={() => navigate("/rule-changes")}
      onOfflineMap={() => navigate("/offline-map")}
      onWrapped={wrapped.open}
    />;
}

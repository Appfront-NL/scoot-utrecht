// ============================================================
// Settings screen: vehicle card with the Dutch snorfiets plate
// plus five preference toggles. Toggles persist in localStorage
// under "scoot.profile.settings" (same key as the old vanilla
// module, so stored values carry over). Ported from
// app/lib/profile.js; styling in profile.css.
// ============================================================

/**
 * Fullscreen settings with self-contained toggle persistence.
 *
 * @example
 * <SettingsScreen onBack={() => pop()} />
 */

import { useEffect, useRef, useState } from "react";

const backIcon = (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
);

const SETTINGS_KEY = "scoot.profile.settings";

type Settings = {
  helm: boolean;
  zone: boolean;
  venster: boolean;
  stem: boolean;
  besluiten: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  helm: true,
  zone: true,
  venster: true,
  stem: true,
  besluiten: true,
};

const TOGGLES: { key: keyof Settings; title: string; sub: string }[] = [
  { key: "helm", title: "Helmherinnering", sub: "Waarschuw me voor routes over de rijbaan" },
  { key: "zone", title: "Zonewaarschuwing", sub: "Trilsignaal bij een naderende verboden zone" },
  { key: "venster", title: "Venstertijden meenemen", sub: "Houd rekening met tijdgebonden verboden" },
  { key: "stem", title: "Gesproken aanwijzingen", sub: "Stem tijdens het rijden" },
  { key: "besluiten", title: "Meld nieuwe besluiten", sub: "Bericht als er iets verandert op je routes" },
];

function loadSettings(): Settings {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    // storage unavailable or corrupt: fall back to defaults
    return { ...DEFAULT_SETTINGS };
  }
}

export type SettingsScreenProps = {
  /** Whether the screen is slid in (adds the `is-open` class). Defaults to true. */
  open?: boolean;
  /** Stack z-index override, used by ProfileStack to layer screens. */
  zIndex?: number;
  onBack?: () => void;
};

export function SettingsScreen({ open = true, zIndex, onBack }: SettingsScreenProps) {
  // Start from defaults so server and client render the same markup,
  // then hydrate the stored values on mount.
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const loaded = useRef(false);

  useEffect(() => {
    setSettings(loadSettings());
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // storage unavailable (private mode): the toggle still works for this session
    }
  }, [settings]);

  return (
    <section
      className={"profile-screen" + (open ? " is-open" : "")}
      data-screen="settings"
      role="dialog"
      aria-modal="true"
      aria-label="Instellingen"
      style={zIndex !== undefined ? { zIndex } : undefined}
    >
      <div className="profile-screen-inner">
        <header className="profile-header">
          <button className="profile-back" onClick={onBack} aria-label="Terug">{backIcon}</button>
        </header>
        <h1 className="profile-title">Instellingen</h1>
        <h2 className="profile-section">Jouw voertuig</h2>
        <p className="profile-sub">Bepaalt welke verkeersregels op je kaart staan.</p>
        <div className="profile-card profile-vehicle">
          <span className="profile-plate" aria-label="Kenteken 52-ND-3">
            <span className="profile-plate-band">NL</span>
            <span className="profile-plate-number">52-ND-3</span>
          </span>
          <span className="profile-vehicle-label">Snorfiets, blauw kenteken</span>
        </div>
        <div className="profile-card profile-toggles">
          {TOGGLES.map((item) => (
            <label className="profile-toggle" key={item.key}>
              <span className="profile-toggle-text"><b>{item.title}</b><small>{item.sub}</small></span>
              <span className="profile-switch">
                <input
                  type="checkbox"
                  checked={settings[item.key]}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, [item.key]: e.target.checked }))
                  }
                />
                <i />
              </span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Onboarding — login/registreren/wachtwoord (demo, no real auth),
// plate picker, "rules download" theatre and the welcome rules.
// Pure presentational React; the parent owns when it shows and
// receives the chosen vehicle when the chain completes.
// ============================================================

import { useEffect, useRef, useState } from "react";

const ARROW = (
  <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
);
const SCOOTER = (
  <svg width="34" height="34" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17" r="3" /><circle cx="18.5" cy="17" r="3" /><path d="M8.5 17h7" /><path d="M18.5 17V9a2 2 0 0 0-2-2h-2" /><path d="M5.5 14l3.2-6.5h4.1" /><path d="M12.8 7.5 15 12" /></svg>
);

type AuthView = "login" | "register" | "forgot";
type Stage = "auth" | "plate" | "download" | "rules";

export function Onboarding({ city, onDone, onToast }: {
  city: { name: string; rules: { title: string; text: string }[] };
  onDone: (vehicle: string) => void;
  onToast: (text: string) => void;
}) {
  const [stage, setStage] = useState<Stage>("auth");
  const [view, setView] = useState<AuthView>("login");
  const [vehicle, setVehicle] = useState("snorfiets");

  return (
    <>
      {stage === "auth" && (
        <section className="auth-screen">
          <div className="auth-inner">
            <div className="auth-logo" aria-hidden="true">{SCOOTER}</div>
            <p className="eyebrow">SCOOT</p>

            {view === "login" && (
              <div className="auth-view">
                <h2 className="auth-title">Log in op je account</h2>
                <p className="auth-sub">Voer je gegevens in om verder te gaan</p>
                <div className="auth-fields">
                  <input className="auth-field" type="email" placeholder="E-mailadres" defaultValue="fabian@appfront.nl" />
                  <input className="auth-field" type="password" placeholder="Wachtwoord" defaultValue="scoot2026" />
                </div>
                <button className="auth-link" onClick={() => setView("forgot")}>Wachtwoord vergeten?</button>
                <button className="button" onClick={() => setStage("plate")}>Inloggen {ARROW}</button>
                <p className="auth-foot">Nog geen account? <button className="auth-link inline" onClick={() => setView("register")}>Registreer</button></p>
              </div>
            )}

            {view === "register" && (
              <div className="auth-view">
                <h2 className="auth-title">Maak een account</h2>
                <p className="auth-sub">Je hebt een rijbewijs AM of B nodig om te mogen rijden</p>
                <div className="auth-fields">
                  <input className="auth-field" type="text" placeholder="Volledige naam" />
                  <input className="auth-field" type="email" placeholder="E-mailadres" />
                  <input className="auth-field" type="password" placeholder="Wachtwoord" />
                  <input className="auth-field" type="text" placeholder="Rijbewijsnummer" />
                </div>
                <button className="button" onClick={() => setStage("plate")}>Account aanmaken {ARROW}</button>
                <p className="auth-foot">Al een account? <button className="auth-link inline" onClick={() => setView("login")}>Inloggen</button></p>
              </div>
            )}

            {view === "forgot" && (
              <div className="auth-view">
                <h2 className="auth-title">Wachtwoord vergeten</h2>
                <p className="auth-sub">Vul je e-mailadres in. Je ontvangt een link om een nieuw wachtwoord in te stellen</p>
                <div className="auth-fields">
                  <input className="auth-field" type="email" placeholder="E-mailadres" />
                </div>
                <button className="button" onClick={() => { onToast("Link verstuurd. Check je mail."); setView("login"); }}>
                  Verstuur link
                </button>
                <p className="auth-foot">Weet je het weer? <button className="auth-link inline" onClick={() => setView("login")}>Inloggen</button></p>
              </div>
            )}
          </div>
        </section>
      )}

      {stage === "plate" && (
        <PlatePicker
          vehicle={vehicle}
          onSelect={setVehicle}
          onNext={() => setStage("download")}
        />
      )}

      {stage === "download" && (
        <RulesDownload cityName={city.name} onDone={() => setStage("rules")} />
      )}

      {stage === "rules" && (
        <RulesScreen mode="welcome" city={city} vehicle={vehicle} onClose={() => onDone(vehicle)} />
      )}
    </>
  );
}

/* ---------- plate picker (design 33) ---------- */

function PlatePicker({ vehicle, onSelect, onNext }: {
  vehicle: string; onSelect: (v: string) => void; onNext: () => void;
}) {
  const CHECK = (
    <svg width="15" height="15" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 5 5 10-11" /></svg>
  );
  return (
    <section className="plate-screen">
      <div className="plate-inner">
        <p className="eyebrow">SCOOT</p>
        <h2 className="plate-title">Welk kenteken heeft je scooter?</h2>
        <p className="plate-sub">De kleur van je plaat bepaalt waar je mag rijden. Op sommige wegen mag de een wel en de ander niet.</p>

        <button className={"plate-card" + (vehicle === "snorfiets" ? " selected" : "")} onClick={() => onSelect("snorfiets")}>
          <span className="plate plate--blue"><i>NL</i><b>52-ND-3</b></span>
          <span className="plate-meta"><b>Snorfiets</b><small>Maximaal 25 km/u</small></span>
          <span className="plate-check" aria-hidden="true">{CHECK}</span>
        </button>
        <button className={"plate-card" + (vehicle === "bromfiets" ? " selected" : "")} onClick={() => onSelect("bromfiets")}>
          <span className="plate plate--yellow"><i>NL</i><b>8-TFP-42</b></span>
          <span className="plate-meta"><b>Bromfiets</b><small>Maximaal 45 km/u</small></span>
          <span className="plate-check" aria-hidden="true">{CHECK}</span>
        </button>

        <div className="plate-note">
          <b>Helm verplicht</b>
          <span>Sinds 2023 ook voor snorfietsen met een blauwe plaat.</span>
        </div>
        <button className="button" onClick={onNext}>Verder</button>
      </div>
    </section>
  );
}

/* ---------- rules download theatre (design 32) ---------- */

function RulesDownload({ cityName, onDone }: { cityName: string; onDone: () => void }) {
  const [count, setCount] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const total = 340, duration = 2300, t0 = performance.now();
    const iv = setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / duration);
      setCount(Math.round(total * (1 - Math.pow(1 - p, 2))));
      if (p >= 1 && !done.current) {
        done.current = true;
        clearInterval(iv);
        setTimeout(onDone, 400);
      }
    }, 40);
    return () => clearInterval(iv);
  }, [onDone]);

  const tiles = Array.from({ length: 32 }, (_, i) =>
    ["", "c1", "", "c2", "", "c3", "", ""][i % 8]);

  return (
    <section className="rules-loading">
      <div className="rules-loading-inner">
        <div className="rules-loading-tiles" aria-hidden="true">
          {tiles.map((cls, i) => <i key={i} className={cls} style={{ animationDelay: `${i * 55}ms` }} />)}
        </div>
        <h2>We halen de regels van {cityName} op</h2>
        <p>Elk verkeersbesluit van de gemeente wordt omgezet naar een zone op je kaart.</p>
        <div className="rules-loading-count"><b>{count}</b> van 340 besluiten</div>
        <span className="rules-loading-once">Eenmalig</span>
      </div>
    </section>
  );
}

/* ---------- rules screen (design 02 welcome / 11 reference) ---------- */

export function RulesScreen({ mode, city, vehicle, onClose }: {
  mode: "welcome" | "reference";
  city: { name: string; rules: { title: string; text: string }[] };
  vehicle: string;
  onClose: () => void;
}) {
  const welcome = mode === "welcome";
  return (
    <section className="rules-screen">
      <div className="rules-screen-inner">
        <p className="eyebrow">SCOOT</p>
        <h2 className="rules-title">
          {welcome ? `Welkom in ${city.name}` : `Wet en regelgeving in ${city.name}`}
        </h2>
        {welcome && (
          <p className="rules-sub">
            {vehicle === "bromfiets"
              ? <>Je rijdt {city.name} binnen met een bromfiets met <u>geel kenteken</u>. Dit zijn de belangrijkste regels voor jouw voertuig.</>
              : <>Je rijdt {city.name} binnen met een snorfiets met <u>blauw kenteken</u>. Dit zijn de belangrijkste regels voor jouw voertuig.</>}
          </p>
        )}
        <div className="rules-list">
          {city.rules.map((r) => (
            <div className="rule-card" key={r.title}>
              <span className="icon">
                <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.2" /><path d="M12 16v-4.5M12 8h.01" /></svg>
              </span>
              <div><h4>{r.title}</h4><p>{r.text}</p></div>
            </div>
          ))}
        </div>
        <button className="button" onClick={onClose}>
          {welcome ? "Ik heb het begrepen" : "Sluiten"} {welcome && ARROW_SMALL}
        </button>
      </div>
    </section>
  );
}

const ARROW_SMALL = (
  <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
);

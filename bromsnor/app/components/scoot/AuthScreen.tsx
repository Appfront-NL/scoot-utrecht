import { useState } from "react";
import { useNavigate } from "react-router";

/**
 * Login / register / forgot-password (demo, no real auth; design
 * 01/15/16). Manages its own view switching; fires callbacks when
 * the user "logs in" or "registers".
 *
 * @example
 * <AuthScreen onDone={() => next()} onToast={show} />
 */
const ARROW = (
  <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
);
const SCOOTER = (
  <svg width="34" height="34" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17" r="3" /><circle cx="18.5" cy="17" r="3" /><path d="M8.5 17h7" /><path d="M18.5 17V9a2 2 0 0 0-2-2h-2" /><path d="M5.5 14l3.2-6.5h4.1" /><path d="M12.8 7.5 15 12" /></svg>
);

export function AuthScreen({ onDone, onToast }: {
  onDone: () => void;
  onToast?: (text: string) => void;
}) {
  const [view, setView] = useState<"login" | "register" | "forgot">("login");
  return (
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
            <button className="button" onClick={onDone}>Inloggen {ARROW}</button>
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
            <button className="button" onClick={onDone}>Account aanmaken {ARROW}</button>
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
            <button className="button" onClick={() => { onToast?.("Link verstuurd. Check je mail."); setView("login"); }}>
              Verstuur link
            </button>
            <p className="auth-foot">Weet je het weer? <button className="auth-link inline" onClick={() => setView("login")}>Inloggen</button></p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- route-module exports, same pattern as SettingsScreen:
   the screen is also reachable as a standalone page. Logging in
   (or registering) sends you to the map. ---------- */
export async function loader() {
  return null;
}

export default function LoginPage() {
  const navigate = useNavigate();
  return <AuthScreen onDone={() => navigate("/")} />;
}

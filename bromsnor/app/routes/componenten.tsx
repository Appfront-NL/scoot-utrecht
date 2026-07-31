// ============================================================
// /componenten — live catalog of the SCOOT component kit.
// Every block below is copy-pasteable: the import line is shown
// above each example. Mini-storybook for the team.
// ============================================================

import { useState } from "react";
import {
  Button, Switch, BottomSheet, Stats, Plate, Toast, useToast,
  TopBar, FloatStack, NavBanner, DemoSpeed,
  SearchPanel, RouteOverview, RouteCalc, RideBar, ArrivedPanel,
  LayersSheet, ZoneDetail, WindowExplorer, StreetLookup,
  AuthScreen, PlatePicker, RulesDownload, RulesScreen,
  AccountScreen, RideHistoryScreen, SettingsScreen, NotificationsScreen,
  AchievementsScreen, RuleChangesScreen, OfflineMapScreen,
  Warning,
  AnimateIn, CountUp, PulseDot, RouteLoader, SuccessCheck, Shake,
  RegimeChip, TimeWindowBar, SourceLink, DirectionList, ConfirmDialog, EmptyState, Coachmark,
  type Destination, type LayerState,
} from "~/components/scoot";

export function meta() {
  return [{ title: "SCOOT — componentenkit" }];
}

const DEMO_DESTINATIONS: Destination[] = [
  { name: "Fontijnboot", area: "Opgeslagen · Westerdok", point: [5.1178, 52.099], saved: true },
  { name: "Domplein", area: "Binnenstad", point: [5.12222, 52.09062] },
  { name: "Utrecht Centraal", area: "Stationsgebied", point: [5.10999, 52.08949] },
];
const demoChip: React.CSSProperties = {
  display: "inline-block", padding: "8px 14px", borderRadius: 99,
  background: "#f5f3ff", border: "1px solid #c4b5fd",
  font: "600 13px 'DM Sans'", color: "#6d3ae6",
};
const demoKnop: React.CSSProperties = {
  padding: "8px 14px", borderRadius: 99, border: "1px solid #cbd5e1",
  background: "#fff", font: "600 13px 'DM Sans'", cursor: "pointer",
};

const DEMO_CITY = {
  name: "Utrecht",
  rules: [
    { title: "Rijd op de rijbaan", text: "Op wegen waar je maximaal 50 km/u mag rijden, gebruik je met een bromscooter meestal de rijbaan." },
    { title: "Let op wisselende rijzones", text: "Op sommige locaties gaat de scooterroute over in een verplicht fiets-/bromfietspad." },
  ],
};

function Blok({ titel, imp, children, hoog }: {
  titel: string; imp: string; children: React.ReactNode; hoog?: boolean;
}) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ font: "700 12px/1 'DM Sans'", letterSpacing: ".1em", textTransform: "uppercase", color: "#8b5cf6", margin: "0 0 6px" }}>{titel}</h2>
      <code style={{ display: "block", fontSize: 11.5, color: "#64748b", marginBottom: 10, wordBreak: "break-all" }}>{imp}</code>
      <div style={{
        position: "relative", border: "1px solid #e8ecf2", borderRadius: 16, background: "#fff",
        padding: 16, minHeight: hoog ? 560 : undefined, overflow: "hidden",
      }}>
        {children}
      </div>
    </section>
  );
}

/* Panels position fixed by default; inside the catalog we scope them
   to their preview box. */
const scoped = `
  /* scoot.css locks body scrolling for the fullscreen map app;
     the catalog is a long document, so undo that here only. */
  html, body { overflow: auto !important; height: auto !important; }

  .kit-scope .panel, .kit-scope .topbar, .kit-scope .float-stack,
  .kit-scope .nav-banner, .kit-scope .demo-speed, .kit-scope .app-toast,
  .kit-scope .auth-screen, .kit-scope .plate-screen,
  .kit-scope .rules-loading, .kit-scope .rules-screen,
  .kit-scope [class^="profile-screen"], .kit-scope [class*=" profile-screen"] {
    position: relative; inset: auto; max-width: 100%; margin: 0;
    animation: none; z-index: 1;
  }
  .kit-scope .rules-screen, .kit-scope .auth-screen, .kit-scope .plate-screen,
  .kit-scope .rules-loading { min-height: 540px; border-radius: 12px; overflow-y: auto; }
  .kit-scope .float-stack { flex-direction: row; }
`;

export default function Componenten() {
  const { toast, show } = useToast();
  const [aan, setAan] = useState(true);
  const [factor, setFactor] = useState(8);
  const [filter, setFilter] = useState("");
  const [layers, setLayers] = useState<LayerState>({ verboden: true, rijbaan: true, fietspad: true, venstertijd: true });
  const [uur, setUur] = useState(14.33);
  const [kaal, setKaal] = useState(0); // demo-teller RouteCalc
  const [vehicle, setVehicle] = useState("snorfiets");
  const [replay, setReplay] = useState(0);     // demo: animaties opnieuw
  const [dlg, setDlg] = useState(false);
  const [mark, setMark] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);

  return (
    <main className="kit-scope" style={{ maxWidth: 520, margin: "0 auto", padding: "30px 18px 80px", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{scoped}</style>
      <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-.02em", margin: "0 0 4px" }}>SCOOT componentenkit</h1>
      <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 30px", lineHeight: 1.55 }}>
        Alle widgets als losse React-componenten. Eén per bestand in{" "}
        <code>app/components/scoot/</code>, elk met JSDoc-voorbeeld. Dit is de live versie.
      </p>

      <Blok titel="Warning (web component-wrapper)" imp={`import { Warning, useWarning } from "~/components/scoot"`}>
        <div style={{ display: "grid", gap: 10 }}>
          <Warning variant="nadert" distance={80} zone="Voetgangersgebied Steenweg" onAction={() => show("scoot-action")} />
          <Warning variant="rijbaan" />
          <Warning variant="geen-route" />
        </div>
      </Blok>

      <Blok titel="Animaties — AnimateIn / CountUp / PulseDot / RouteLoader / SuccessCheck / Shake" imp={`import { AnimateIn, CountUp, PulseDot, RouteLoader, SuccessCheck, Shake, pulseDotHTML } from "~/components/scoot"`}>
        <div style={{ display: "grid", gap: 18 }}>
          <div key={replay} style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
            <AnimateIn from="bottom"><span style={demoChip}>from="bottom"</span></AnimateIn>
            <AnimateIn from="left" delayMs={120}><span style={demoChip}>from="left"</span></AnimateIn>
            <AnimateIn from="pop" delayMs={240}><span style={demoChip}>from="pop"</span></AnimateIn>
            <SuccessCheck size={44} />
            <span style={{ font: "600 20px 'DM Sans'" }}>
              <CountUp to={5.8} decimals={1} suffix=" km" />
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 26, flexWrap: "wrap" }}>
            <RouteLoader size={38} />
            <PulseDot color="#ef4444" />
            <PulseDot color="#8b5cf6" />
            <Shake trigger={shakeCount}>
              <span style={demoChip}>Shake bij fout</span>
            </Shake>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={demoKnop} onClick={() => setReplay(r => r + 1)}>Opnieuw afspelen</button>
            <button style={demoKnop} onClick={() => setShakeCount(c => c + 1)}>Trigger shake</button>
          </div>
          <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
            <code>pulseDotHTML()</code> geeft dezelfde dot als HTML-string, voor een Leaflet{" "}
            <code>divIcon</code> — zie het JSDoc-voorbeeld in <code>PulseDot.tsx</code>.
          </p>
        </div>
      </Blok>

      <Blok titel="Aanvulling — RegimeChip / TimeWindowBar / SourceLink / DirectionList / EmptyState / ConfirmDialog / Coachmark" imp={`import { RegimeChip, TimeWindowBar, SourceLink, DirectionList, ConfirmDialog, EmptyState, Coachmark } from "~/components/scoot"`}>
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <RegimeChip regime="verboden" />
            <RegimeChip regime="rijbaan" />
            <RegimeChip regime="fietspad" />
          </div>
          <TimeWindowBar from="11:00" to="18:00" now="14:20" />
          <SourceLink sub="Gemeenteblad nr. 213902" onClick={() => show("Opent het Gemeenteblad")} />
          <DirectionList steps={[
            { kind: "right", label: "Rechtsaf", street: "Lange Nieuwstraat", distanceM: 575 },
            { kind: "left", label: "Linksaf", street: "Oudegracht", distanceM: 551 },
            { kind: "arrival", label: "Aankomst", street: "Domplein", distanceM: 276 },
          ]} />
          <EmptyState title="Niets gevonden" body="We konden deze plek niet vinden. Probeer een andere zoekterm." actionLabel="Zoek opnieuw" onAction={() => show("Opnieuw!")} />
          <div style={{ display: "flex", gap: 8 }}>
            <button style={demoKnop} onClick={() => setDlg(true)}>Open ConfirmDialog</button>
            <button style={demoKnop} onClick={() => setMark(true)}>Toon Coachmark</button>
          </div>
          <ConfirmDialog open={dlg} title="Rit stoppen?" body="Je route wordt niet bewaard en de zonewaarschuwingen stoppen ook." confirmLabel="Ja, stoppen" cancelLabel="Doorrijden" onConfirm={() => { setDlg(false); show("Gestopt"); }} onCancel={() => setDlg(false)} />
          {mark && <Coachmark title="Zet lagen aan of uit" body="Kies welke regels je op de kaart ziet." counter="1 van 1" arrow="right" style={{ right: 40, top: "30%" }} onDone={() => setMark(false)} />}
        </div>
      </Blok>

      <Blok titel="Button / Switch / Plate / Stats" imp={`import { Button, Switch, Plate, Stats } from "~/components/scoot"`}>
        <div style={{ display: "grid", gap: 12 }}>
          <Button onClick={() => show("Klik!")}>Route starten</Button>
          <Button variant="danger" size="small">Route herbereken</Button>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Switch checked={aan} onChange={setAan} label="Demo" />
            <Plate color="blue" number="52-ND-3" />
            <Plate color="yellow" number="8-TFP-42" />
          </div>
          <Stats items={[
            { value: "620 m", label: "Afstand" },
            { value: "2 min", label: "Reistijd", accent: true },
            { value: "1", label: "Waarschuwingen" },
          ]} />
        </div>
      </Blok>

      <Blok titel="TopBar / FloatStack / DemoSpeed" imp={`import { TopBar, FloatStack, DemoSpeed } from "~/components/scoot"`}>
        <div style={{ display: "grid", gap: 12, background: "#eceef1", borderRadius: 12, padding: 12 }}>
          <TopBar city="Utrecht" hasUnread onBell={() => show("meldingen")} onAccount={() => show("account")} onRules={() => show("regels")} />
          <FloatStack riding soundOn onSound={() => show("geluid")} onLayers={() => show("lagen")} onLocate={() => show("centreer")} />
          <DemoSpeed factor={factor} onFactor={setFactor} />
        </div>
      </Blok>

      <Blok titel="NavBanner" imp={`import { NavBanner } from "~/components/scoot"`}>
        <NavBanner banner={{ distance: "100 M", action: "Linksaf", street: "Christiaan Huygensplein", next: "→ Middenweg", direction: "left" }} />
      </Blok>

      <Blok titel="SearchPanel" imp={`import { SearchPanel } from "~/components/scoot"`}>
        <SearchPanel destinations={DEMO_DESTINATIONS} filter={filter} onFilter={setFilter}
          onPick={(d) => show(`Gekozen: ${d.name}`)} status={null} />
      </Blok>

      <Blok titel="RouteOverview / RideBar / ArrivedPanel" imp={`import { RouteOverview, RideBar, ArrivedPanel } from "~/components/scoot"`}>
        <div style={{ display: "grid", gap: 12 }}>
          <RouteOverview city="Utrecht" destination={DEMO_DESTINATIONS[1]} distance="620 m" duration="2 min"
            warnings={1} onBack={() => show("terug")} onStart={() => show("start!")} />
          <RideBar time="2 min" distance="610 m" arrival="13:43" almost={false} onStop={() => show("stop")} />
          <ArrivedPanel destination="Domplein" city="Utrecht" distance="620 m" duration="2 min" warnings={1} onNew={() => show("nieuw")} />
        </div>
      </Blok>

      <Blok titel="RouteCalc (klik om te stappen)" imp={`import { RouteCalc } from "~/components/scoot"`}>
        <div onClick={() => setKaal((s) => (s + 1) % 4)} style={{ cursor: "pointer" }}>
          <RouteCalc step={kaal} street="Oudegracht" time="14:20" />
        </div>
      </Blok>

      <Blok titel="LayersSheet / WindowExplorer / StreetLookup" imp={`import { LayersSheet, WindowExplorer, StreetLookup } from "~/components/scoot"`}>
        <div style={{ display: "grid", gap: 12 }}>
          <LayersSheet layers={layers} onToggle={(k, on) => setLayers((l) => ({ ...l, [k]: on }))}
            onWindow={() => show("venster")} onStreet={() => show("straat")} onClose={() => show("dicht")} />
          <WindowExplorer hour={uur} onHour={setUur} onClose={() => show("dicht")} />
          <StreetLookup onClose={() => show("dicht")} />
        </div>
      </Blok>

      <Blok titel="ZoneDetail (regeldata-schema)" imp={`import { ZoneDetail } from "~/components/scoot"`}>
        <ZoneDetail zone={{
          regime: "verboden", naam: "Voetgangersgebied Steenweg",
          tijdvenster: "ma-za 11:00-18:00", voertuig: "snorfiets",
          geldig_vanaf: "2026-06-03", zekerheid: "hard", bron: "mock",
        }} onClose={() => show("dicht")} onDecree={() => show("Opent het Gemeenteblad (demo)")} />
      </Blok>

      <Blok titel="Profiel-schermen (elk ook los bruikbaar)" imp={`import { AccountScreen, NotificationsScreen, AchievementsScreen, … } from "~/components/scoot"`} hoog>
        <div style={{ display: "grid", gap: 12 }}>
          <AccountScreen onWrapped={() => show("wrapped")} onRideHistory={() => show("ritten")} />
          <NotificationsScreen onWrapped={() => show("wrapped")} />
          <AchievementsScreen />
          <RideHistoryScreen />
          <SettingsScreen />
          <RuleChangesScreen onDecree={() => show("Opent het Gemeenteblad (demo)")} />
          <OfflineMapScreen />
        </div>
      </Blok>

      <Blok titel="AuthScreen" imp={`import { AuthScreen } from "~/components/scoot"`} hoog>
        <AuthScreen onDone={() => show("ingelogd")} onToast={show} />
      </Blok>

      <Blok titel="PlatePicker" imp={`import { PlatePicker } from "~/components/scoot"`} hoog>
        <PlatePicker vehicle={vehicle} onSelect={setVehicle} onNext={() => show(`voertuig: ${vehicle}`)} />
      </Blok>

      <Blok titel="RulesScreen (reference-modus)" imp={`import { RulesScreen } from "~/components/scoot"`} hoog>
        <RulesScreen mode="reference" city={DEMO_CITY} vehicle="snorfiets" onClose={() => show("dicht")} />
      </Blok>

      <Toast text={toast} />
    </main>
  );
}

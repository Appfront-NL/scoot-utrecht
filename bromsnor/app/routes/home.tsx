// ============================================================
// SCOOT — the app route. React owns the UI state machine;
// the proven modules in app/lib own the map, the simulation and
// the contract (see /CONTRACT.md in the repo root).
//
// Everything that touches the browser (MapLibre, custom elements,
// the wrapped/profile overlays) loads client-side in effects, so
// SSR stays intact.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";

// pure modules: safe on the server
import { CONFIG } from "~/lib/config.js";
import { CITIES } from "~/lib/cities.js";
import { fetchRoute } from "~/lib/api.js";
import { buildManeuvers, startSimulation, fmtDistance, fmtDuration, fmtArrival } from "~/lib/navigation.js";

import {
  OnboardingFlow, RulesScreen, ProfileStack,
  TopBar, FloatStack, NavBanner, DemoSpeed, Toast,
  SearchPanel, RouteOverview, RouteCalc, RideBar, ArrivedPanel,
  LayersSheet, ZoneDetail, WindowExplorer, StreetLookup,
  type BannerState, type Destination, type LayerState, type ZoneProps,
} from "~/components/scoot";

export function meta() {
  return [
    { title: "SCOOT — veilig rijden in Utrecht" },
    { name: "description", content: "Deelscooter-navigatie die je om verboden zones heen leidt." },
  ];
}

type Phase = "boot" | "onboarding" | "app";
type Panel = "search" | "overview" | "ride" | "done" | "calc";
type Sheet = null | "layers" | "window" | "street" | "zone";

const ONBOARDED_KEY = "scoot.onboarded";
const VEHICLE_KEY = "scoot.vehicle";

export default function Home() {
  const city = (CITIES as Record<string, any>)[CONFIG.defaultCity];

  /* ---------- state ---------- */
  const [phase, setPhase] = useState<Phase>("boot");
  const [panel, setPanel] = useState<Panel>("search");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [rulesOverlay, setRulesOverlay] = useState(false);   // i-button reference view
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState<{ text: string; error: boolean } | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [route, setRoute] = useState<any>(null);
  const [calc, setCalc] = useState({ step: 0, street: null as string | null });
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [ride, setRide] = useState({ time: "–", distance: "–", arrival: "–", almost: false });
  const [layers, setLayers] = useState<LayerState>({ verboden: true, rijbaan: true, fietspad: true, venstertijd: true });
  const [zoneDetail, setZoneDetail] = useState<ZoneProps | null>(null);
  const [windowHour, setWindowHour] = useState(14.33);
  const [toast, setToast] = useState<string | null>(null);
  const [unread, setUnread] = useState(true);
  const [profileView, setProfileView] = useState<null | "account" | "notifications">(null);
  const [factor, setFactor] = useState(8);
  const [soundOn, setSoundOn] = useState(true);

  /* ---------- refs to imperative modules ---------- */
  const mapRef = useRef<any>(null);          // app/lib/map.js namespace
  const warnRef = useRef<any>(null);         // warning-card helpers
  const wrappedRef = useRef<any>(null);
  const simRef = useRef<any>(null);
  const startRef = useRef<[number, number]>(city.start as [number, number]);
  const vehicleRef = useRef("snorfiets");
  const lastStepRef = useRef<any>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((text: string) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  /* ---------- refs mirroring state for module callbacks ---------- */
  const panelRef = useRef(panel); panelRef.current = panel;
  const sheetRef = useRef(sheet); sheetRef.current = sheet;

  /* ---------- boot: client-only modules + map ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      vehicleRef.current = localStorage.getItem(VEHICLE_KEY) || "snorfiets";
      setPhase(localStorage.getItem(ONBOARDED_KEY) ? "app" : "onboarding");

      const [map, warn, wrapped] = await Promise.all([
        import("~/lib/map.js"),
        import("~/lib/warning-card.js"),
        import("~/lib/wrapped.js"),
      ]);
      if (cancelled) return;
      mapRef.current = map;
      warnRef.current = warn;
      wrappedRef.current = wrapped;

      wrapped.initWrapped();

      await map.initMap(city.center);
      if (cancelled) return;
      map.setRider(startRef.current, 0);
      try {
        const { loadRules } = await import("~/lib/api.js");
        map.drawZones(await loadRules(city.rulesUrl));
      } catch (e) {
        console.warn("Zones niet geladen:", e);
      }
      map.onZoneClick((props: ZoneProps) => openZone(props));
      map.onMapClick((point: [number, number], screenPoint: unknown) => onMapTap(point, screenPoint));

      // shareable URL: #eind=lon,lat&naam=…
      const p = new URLSearchParams(location.hash.slice(1));
      const eind = p.get("eind")?.split(",").map(Number);
      if (eind && eind.length === 2 && !eind.some(isNaN)) {
        plan({ name: p.get("naam") || "Gedeelde bestemming", area: "Via link", point: eind as [number, number] });
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openZone = useCallback((props: ZoneProps) => {
    if (panelRef.current === "ride") return;
    setZoneDetail(props);
    setSheet("zone");
  }, []);

  const onMapTap = useCallback((point: [number, number], screenPoint: unknown) => {
    if (panelRef.current === "ride") return;
    const zone = screenPoint && mapRef.current?.zoneAt(screenPoint);
    if (zone) { openZone(zone); return; }
    if (sheetRef.current) { setSheet(null); return; }
    plan({ name: "Gekozen punt", area: "Via de kaart", point });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- escape closes sheets ---------- */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setSheet(null); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  /* ---------- planning (design 31 loader included) ---------- */
  const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function plan(dest: Destination) {
    setDestination(dest);
    history.replaceState(null, "",
      `#eind=${dest.point[0].toFixed(5)},${dest.point[1].toFixed(5)}&naam=${encodeURIComponent(dest.name)}`);
    setCalc({ step: 0, street: null });
    setPanel("calc");
    setSheet(null);

    const timeline = (async () => {
      await pause(700); setCalc((c) => ({ ...c, step: 1 }));
      await pause(700); setCalc((c) => ({ ...c, step: 2 }));
      await pause(600); setCalc((c) => ({ ...c, step: 3 }));
      await pause(250);
    })();

    let r: any = null, error: unknown = null;
    try {
      [r] = await Promise.all([
        fetchRoute(startRef.current, dest.point, vehicleRef.current, city),
        timeline,
      ]);
    } catch (e) { error = e; }
    if (error) { showNoRoute(String((error as Error)?.message ?? error)); return; }

    try {
      setRoute(r);
      setCalc({ step: 3, street: r.straten?.[0] ?? null });
      const map = mapRef.current;
      map.drawRoute(r.route);
      map.setDestination(dest.point, dest.name);
      map.setWarnings(r.waarschuwingen);
      map.markArrival(null);
      map.frameRoute(r.route.coordinates);
      await pause(350);
      setPanel("overview");
    } catch (e) {
      console.error("Route tonen mislukte:", e);
      showNoRoute("Er ging iets mis bij het tonen van de route. Probeer het opnieuw.");
    }
  }

  function showNoRoute(message?: string) {
    setPanel("search");
    warnRef.current?.showWarning({
      variant: "geen-route",
      body: message && !/^Route-API/.test(message) ? message : undefined,
      onAction: () => setPanel("search"),
    });
  }

  /* ---------- riding ---------- */
  function startRide(withRoute?: any) {
    const r = withRoute ?? route;
    const { ruler, maneuvers } = buildManeuvers(r.route.coordinates, r.straten);
    setPanel("ride");
    setRide({ time: "–", distance: "–", arrival: "–", almost: false });

    simRef.current?.stop();
    simRef.current = startSimulation({
      ruler, maneuvers,
      warnings: r.waarschuwingen,
      onStep: (step: any) => {
        lastStepRef.current = step;
        const map = mapRef.current;
        map.setRider(step.point, step.heading);
        map.followRider(step.point, step.heading);
        setBanner({
          distance: fmtDistance(step.toManeuverM).toUpperCase(),
          action: step.maneuver.label,
          street: step.maneuver.street ?? null,
          direction: step.maneuver.direction,
          next: step.nextManeuver
            ? (step.nextManeuver.street ? `→ ${step.nextManeuver.street}` : step.nextManeuver.label)
            : null,
        });
        setRide({
          time: fmtDuration(step.remainingS),
          distance: fmtDistance(step.remainingM),
          arrival: fmtArrival(step.remainingS),
          almost: step.remainingM < 150,
        });
      },
      onWarning: (w: any) => {
        const isRijbaan = w.type === "rijbaan";
        setBanner(null);
        warnRef.current?.showWarning({
          variant: isRijbaan ? "rijbaan" : "verboden",
          duration: 9000,
          onAction: () => { if (!isRijbaan) recalc(); },
        });
      },
      onDone: endRide,
    });
    simRef.current.setFactor(factor);
  }

  function endRide() {
    simRef.current?.stop();
    simRef.current = null;
    setPanel("done");
    setBanner(null);
    const map = mapRef.current;
    if (destination) {
      map.markArrival(destination.point);
      map.overviewCamera(destination.point);
    }
    setTimeout(() => showToast("Netjes geparkeerd. Like a glove."), 900);
  }

  /** Reroute from the rider's current position — same contract call
      with the current position as the new start. */
  async function recalc() {
    const from = lastStepRef.current?.point ?? startRef.current;
    simRef.current?.stop();
    try {
      const r = await fetchRoute(from, destination!.point, vehicleRef.current, city);
      setRoute(r);
      mapRef.current.drawRoute(r.route);
      mapRef.current.setWarnings(r.waarschuwingen);
      startRide(r);
    } catch (e) {
      showNoRoute(String((e as Error)?.message ?? e));
    }
  }

  function newRoute() {
    simRef.current?.stop();
    simRef.current = null;
    setRoute(null);
    setDestination(null);
    setBanner(null);
    history.replaceState(null, "", location.pathname);
    const map = mapRef.current;
    map.clearRoute();
    map.setRider(startRef.current, 0);
    map.overviewCamera(startRef.current);
    setPanel("search");
  }

  /* ---------- layers & window explorer ---------- */
  function toggleLayer(key: keyof LayerState, on: boolean) {
    setLayers((l) => ({ ...l, [key]: on }));
    if (key === "venstertijd") mapRef.current?.setWindowZonesVisible(on);
    else mapRef.current?.setRegimeVisible(key, on);
  }
  function onWindowHour(h: number) {
    setWindowHour(h);
    mapRef.current?.setWindowZonesVisible(h >= 11 && h < 18);
  }

  /* ---------- onboarding done ---------- */
  function finishOnboarding(vehicle: string) {
    vehicleRef.current = vehicle;
    localStorage.setItem(VEHICLE_KEY, vehicle);
    localStorage.setItem(ONBOARDED_KEY, "1");
    setPhase("app");
  }

  const now = new Date();
  const timeLabel = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

  /* ---------- render ---------- */
  return (
    <div className="scoot-app">
      <div id="map" />

      {phase === "onboarding" && (
        <OnboardingFlow city={city} onDone={finishOnboarding} onToast={showToast} />
      )}

      {phase === "app" && (
        <>
          <TopBar
            city={city.name}
            hasUnread={unread}
            onBell={() => { setUnread(false); setProfileView("notifications"); }}
            onAccount={() => setProfileView("account")}
            onRules={() => setRulesOverlay(true)}
          />

          {panel !== "calc" && (
            <FloatStack
              riding={panel === "ride"}
              soundOn={soundOn}
              onSound={() => {
                setSoundOn((s) => {
                  showToast(s ? "Gesproken aanwijzingen uit" : "Gesproken aanwijzingen aan");
                  return !s;
                });
              }}
              onLayers={() => setSheet("layers")}
              onLocate={() => {
                const map = mapRef.current;
                if (simRef.current && lastStepRef.current) {
                  map.followRider(lastStepRef.current.point, lastStepRef.current.heading);
                } else map.overviewCamera(startRef.current);
              }}
            />
          )}

          {panel === "ride" && banner && <NavBanner banner={banner} />}
          {panel === "ride" && (
            <DemoSpeed factor={factor} onFactor={(x) => { setFactor(x); simRef.current?.setFactor(x); }} />
          )}

          {/* main bottom panels (one at a time), unless a sheet covers them */}
          {!sheet && panel === "search" && (
            <SearchPanel
              destinations={city.destinations as Destination[]}
              filter={filter} onFilter={(v) => { setFilter(v); setStatus(null); }}
              onPick={plan} status={status}
            />
          )}
          {!sheet && panel === "calc" && (
            <RouteCalc step={calc.step} street={calc.street} time={timeLabel} />
          )}
          {!sheet && panel === "overview" && destination && route && (
            <RouteOverview
              city={city.name} destination={destination}
              distance={fmtDistance(route.afstand_m)}
              duration={fmtDuration(route.duur_s)}
              warnings={route.waarschuwingen.length}
              onBack={() => { mapRef.current.clearRoute(); setPanel("search"); }}
              onStart={() => startRide()}
            />
          )}
          {!sheet && panel === "ride" && <RideBar {...ride} onStop={endRide} />}
          {!sheet && panel === "done" && destination && route && (
            <ArrivedPanel
              destination={destination.name} city={city.name}
              distance={fmtDistance(route.afstand_m)}
              duration={fmtDuration(route.duur_s)}
              warnings={route.waarschuwingen.length}
              onNew={newRoute}
            />
          )}

          {/* secondary sheets */}
          {sheet === "layers" && (
            <LayersSheet layers={layers} onToggle={toggleLayer}
              onWindow={() => setSheet("window")} onStreet={() => setSheet("street")}
              onClose={() => setSheet(null)} />
          )}
          {sheet === "zone" && zoneDetail && (
            <ZoneDetail zone={zoneDetail} onClose={() => setSheet(null)}
              onDecree={() => showToast("Opent het Gemeenteblad (demo)")} />
          )}
          {sheet === "window" && (
            <WindowExplorer hour={windowHour} onHour={onWindowHour} onClose={() => setSheet(null)} />
          )}
          {sheet === "street" && <StreetLookup onClose={() => setSheet(null)} />}
        </>
      )}

      <ProfileStack
        open={profileView !== null}
        initial={profileView ?? "account"}
        onClose={() => setProfileView(null)}
        onWrapped={() => wrappedRef.current?.openWrapped()}
        onRules={() => setRulesOverlay(true)}
      />

      {rulesOverlay && (
        <RulesScreen mode="reference" city={city} vehicle={vehicleRef.current}
          onClose={() => setRulesOverlay(false)} />
      )}

      <Toast text={toast} />
    </div>
  );
}

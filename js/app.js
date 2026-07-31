// ============================================================
// APP — the glue: screens, events and the flow
// search → overview → ride → arrived (plus the rules screen).
//
// Kept deliberately dumb: this file knows no MapLibre and no
// fetch. Map work lives in map.js, network in api.js, math in
// geo.js/navigation.js. To change the flow, this is the only
// place to be. All user-facing copy is Dutch on purpose.
// ============================================================

import { CONFIG } from './config.js';
import { CITIES, cityFor } from './cities.js';
import { fetchRoute, loadRules } from './api.js';
import * as map from './map.js';
import { buildManeuvers, startSimulation, fmtDistance, fmtDuration, fmtArrival } from './navigation.js';
import { initWrapped, openWrapped } from './wrapped.js';
import { initProfile, openAccount, openNotifications } from './profile.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const ONBOARDED_KEY = 'scoot.onboarded';
const VEHICLE_KEY = 'scoot.vehicle';

/* ---------- app state ---------- */
const state = {
  vehicle: localStorage.getItem(VEHICLE_KEY) || 'snorfiets', // contract value, verbatim in requests
  city: CITIES[CONFIG.defaultCity],
  start: CITIES[CONFIG.defaultCity].start,  // geolocation may refresh this
  destination: null,      // { name, point }
  route: null,            // normalized API response
  simulation: null,       // handles from startSimulation
  lastStep: null,         // most recent simulation step (for rerouting)
};

/* ---------- boot ---------- */
init();
async function init() {
  renderRules();
  initWrapped();
  initProfile({ onOpenRules: () => openRules('reference'), onOpenWrapped: openWrapped });

  // Onboarding chain (first run): login -> plate -> rules download
  // -> welcome rules -> map. Bound BEFORE the map loads so no
  // button is ever dead while tiles come in.
  bindOnboarding();
  $('#rules-ok').addEventListener('click', closeRules);
  $('#btn-rules').addEventListener('click', () => openRules('reference'));
  $('#btn-account').addEventListener('click', openAccount);
  $('#btn-notifications').addEventListener('click', () => {
    $('.notify-dot')?.classList.add('hidden');
    openNotifications();
  });
  if (!localStorage.getItem(ONBOARDED_KEY)) $('#auth-screen').classList.remove('hidden');

  await map.initMap(state.city.center);
  map.setRider(state.start, 0);

  // Track C's zone rules go on immediately — they are the product.
  try {
    map.drawZones(await loadRules(state.city.rulesUrl));
  } catch (e) {
    console.warn('Zones niet geladen:', e.message);
  }

  // One click handler, three meanings: a tap on a zone opens its
  // detail sheet, a tap with a sheet open closes the sheet, and a
  // plain tap picks a destination. Never during a ride.
  map.onMapClick((point, screenPoint) => {
    if (!$('#panel-ride').classList.contains('hidden')) return;
    const zone = screenPoint && map.zoneAt(screenPoint);
    if (zone) { openZoneDetail(zone); return; }
    if (activeSheet) { closeSheet(); return; }
    chooseDestination({ name: 'Gekozen punt', area: 'Via de kaart', point });
  });
  map.onZoneClick((props) => {
    if (!$('#panel-ride').classList.contains('hidden')) return;
    openZoneDetail(props);
  });

  fillSuggestions('');
  bindEvents();
  bindSheets();

  // Shareable URL: #eind=lon,lat&naam=… plans the route directly.
  const shared = readHash();
  if (shared) chooseDestination(shared);

  tryGeolocation();
}

/**
 * Uses the device position as the start point when it falls inside
 * a known city (cities.js), and switches the app to that city's
 * dataset. Outside every known city we keep the default city's
 * demo start: planning a route without rules or destinations for
 * the area would demo nothing. Non-blocking: the app works fine
 * on the fallback while (or if never) this resolves.
 */
function tryGeolocation() {
  if (!('geolocation' in navigator)) return;
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const here = [pos.coords.longitude, pos.coords.latitude];
      const city = cityFor(here);
      if (!city) return;                 // unknown territory: keep the demo city
      if (city !== state.city) await switchCity(city);
      state.start = here;
      map.setRider(here, 0);
      // Only recenter when the user isn't already doing something.
      if (!$('#panel-search').classList.contains('hidden') && !state.route) {
        map.overviewCamera(here);
      }
    },
    () => { /* denied or unavailable: fallback stays */ },
    { timeout: 5000, maximumAge: 60000 },
  );
}

/** Adopt another city's dataset: rules, destinations, zones. */
async function switchCity(city) {
  state.city = city;
  state.start = city.start;
  renderRules();
  fillSuggestions($('#search-input').value);
  try {
    map.drawZones(await loadRules(city.rulesUrl));
  } catch (e) {
    console.warn('Zones niet geladen:', e.message);
  }
}

/* ---------- panel switching ---------- */
const PANELS = ['#panel-search', '#panel-overview', '#panel-ride', '#panel-done', '#panel-calc'];
const SHEETS = ['#panel-layers', '#panel-zone', '#panel-window', '#panel-street'];
let activeSheet = null;
let lastMainPanel = '#panel-search';

function showPanel(id) {
  activeSheet = null;
  SHEETS.forEach(s => $(s).classList.add('hidden'));
  PANELS.forEach(p => $(p).classList.toggle('hidden', p !== id));
  if (id !== '#panel-calc') lastMainPanel = id;
  $('#demo-speed').classList.toggle('hidden', id !== '#panel-ride');
  $('#nav-banner').classList.toggle('hidden', id !== '#panel-ride');
  $('#btn-sound').classList.toggle('hidden', id !== '#panel-ride');
  $('#float-stack').classList.toggle('hidden', id === '#panel-calc');
  if (id !== '#panel-ride') hideZoneCard();
}

/* Secondary sheets slide over the current main panel and return
   to it when closed (map tap, Escape, or opening another sheet). */
function openSheet(id) {
  PANELS.forEach(p => $(p).classList.add('hidden'));
  SHEETS.forEach(s => $(s).classList.toggle('hidden', s !== id));
  activeSheet = id;
}
function closeSheet() {
  if (!activeSheet) return;
  activeSheet = null;
  showPanel(lastMainPanel);
}

/* ---------- search ---------- */
function fillSuggestions(filter) {
  const all = state.city.destinations;
  const f = filter.trim().toLowerCase();
  const list = all.filter(d =>
    d.name.toLowerCase().includes(f) || d.area.toLowerCase().includes(f));

  $('#suggestions').innerHTML = list.length
    ? list.map(d => `
      <button class="suggestion" data-i="${all.indexOf(d)}">
        <span class="pin">${d.saved
          ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3-4.7-4.4 6.4-.8Z"/></svg>'
          : '<svg width="17" height="17" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10.5c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10.2" r="2.7"/></svg>'}</span>
        <span><b>${d.name}</b><small>${d.area}</small></span>
      </button>`).join('')
    : '<p class="hint">Geen locatie gevonden. Of tik op de kaart.</p>';

  $('#suggestions').querySelectorAll('.suggestion').forEach(el =>
    el.addEventListener('click', () => chooseDestination(state.city.destinations[+el.dataset.i])));
}

/** Status line under the search field: loading / error feedback. */
function setSearchStatus(text, isError = false) {
  const el = $('#search-status');
  el.textContent = text ?? '';
  el.classList.toggle('error', isError);
  el.classList.toggle('hidden', !text);
}

/* ---------- planning ---------- */
async function chooseDestination(destination) {
  state.destination = destination;
  writeHash(destination);
  showCalcPanel();

  let route, error = null;
  try {
    [route] = await Promise.all([
      fetchRoute(state.start, destination.point, state.vehicle, state.city),
      calcTimeline(),          // min. duration so the steps are readable
    ]);
  } catch (e) {
    error = e;
  }
  if (error) { showNoRoute(error.message); return; }
  state.route = route;

  const r = state.route;
  finishCalcPanel(r.straten?.[0]);
  map.drawRoute(r.route);
  map.setDestination(destination.point, destination.name);
  map.setWarnings(r.waarschuwingen);
  map.markArrival(null);
  map.frameRoute(r.route.coordinates);

  $('#from-area').textContent = state.city.name;
  $('#to-area').textContent = destination.area ?? state.city.name;
  $('#overview-destination').textContent = destination.name;
  $('#overview-distance').textContent = fmtDistance(r.afstand_m);
  $('#overview-time').textContent = fmtDuration(r.duur_s);
  $('#overview-warnings').textContent = r.waarschuwingen.length;
  await pause(350);
  showPanel('#panel-overview');
}

/* "Route berekenen" loader (design 31): staged checklist that runs
   while the API call is in flight. The mock resolves instantly, the
   real backend won't — same screen serves both. */
const pause = (ms) => new Promise(r => setTimeout(r, ms));
function showCalcPanel() {
  const now = new Date();
  $('#calc-step-0').textContent = 'Route zoeken';
  $('#calc-step-2').textContent = 'Venstertijden voor ' +
    now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0') + ' checken';
  $$('#calc-steps li').forEach(li => li.classList.remove('active', 'done'));
  showPanel('#panel-calc');
}
async function calcTimeline() {
  const steps = $$('#calc-steps li');
  steps[0].classList.add('active');
  await pause(700);
  steps[0].classList.replace('active', 'done');
  steps[1].classList.add('active');
  await pause(700);
  steps[1].classList.replace('active', 'done');
  steps[2].classList.add('active');
  await pause(600);
  steps[2].classList.replace('active', 'done');
  await pause(250);
}
function finishCalcPanel(street) {
  if (street) $('#calc-step-0').textContent = 'Route gevonden via ' + street;
}

/* ---------- riding ---------- */
function startRide() {
  const r = state.route;
  const { ruler, maneuvers } = buildManeuvers(r.route.coordinates, r.straten);
  showPanel('#panel-ride');
  setRideLabels(false);

  state.simulation = startSimulation({
    ruler,
    maneuvers,
    warnings: r.waarschuwingen,
    onStep: (step) => {
      state.lastStep = step;
      map.setRider(step.point, step.heading);
      map.followRider(step.point, step.heading);
      $('#nav-distance').textContent = fmtDistance(step.toManeuverM).toUpperCase();
      $('#nav-action').textContent = step.maneuver.label;
      $('#nav-street').textContent = step.maneuver.street ?? '';
      $('#nav-arrow').innerHTML = ARROWS[step.maneuver.direction];
      const nextRow = $('#nav-next');
      nextRow.classList.toggle('hidden', !step.nextManeuver);
      if (step.nextManeuver) {
        nextRow.innerHTML = 'Volgende: <b>' +
          (step.nextManeuver.street ? '→ ' + step.nextManeuver.street : step.nextManeuver.label) + '</b>';
      }
      // Design 09: within 150 m the bar flips to "Res." labels.
      setRideLabels(step.remainingM < 150);
      $('#ride-time').textContent = fmtDuration(step.remainingS);
      $('#ride-distance').textContent = fmtDistance(step.remainingM);
      $('#ride-arrival').textContent = fmtArrival(step.remainingS);
    },
    onWarning: showZoneCard,
    onDone: endRide,
  });
}

function endRide() {
  const r = state.route;
  $('#done-destination').textContent = state.destination.name + ', ' + state.city.name;
  $('#done-distance').textContent = fmtDistance(r.afstand_m);
  $('#done-time').textContent = fmtDuration(r.duur_s);
  $('#done-warnings').textContent = r.waarschuwingen.length;
  showPanel('#panel-done');
  map.markArrival(state.destination.point);
  map.overviewCamera(state.destination.point);
  setTimeout(() => showToast('Netjes geparkeerd. Like a glove.'), 900);
}

/** Swap the ride bar labels to the "almost there" variant (design 09). */
function setRideLabels(almost) {
  const panel = $('#panel-ride');
  if (panel.classList.contains('almost') === almost) return;
  panel.classList.toggle('almost', almost);
  const labels = panel.querySelectorAll('.stat-label');
  labels[0].textContent = almost ? 'Res. reistijd' : 'Reistijd';
  labels[1].textContent = almost ? 'Res. afstand' : 'Afstand';
}

function stopRide() {
  state.simulation?.stop();
  endRide();
}

function newRoute() {
  state.simulation?.stop();
  state.route = null;
  state.lastStep = null;
  writeHash(null);
  map.clearRoute();
  map.setRider(state.start, 0);
  map.overviewCamera(state.start);
  showPanel('#panel-search');
}

/**
 * Reroute from the rider's current position — the design's
 * "Reroute now" button. Uses the exact same contract call, just
 * with the current position as the new start. With the real
 * backend this yields a route that avoids the zone.
 */
async function recalcRoute() {
  hideZoneCard();
  state.simulation?.stop();
  const from = state.lastStep?.point ?? state.start;
  try {
    state.route = await fetchRoute(from, state.destination.point, state.vehicle, state.city);
  } catch (e) {
    setSearchStatus('Route ophalen mislukte: ' + e.message, true);
    showPanel('#panel-search');
    return;
  }
  map.drawRoute(state.route.route);
  map.setWarnings(state.route.waarschuwingen);
  startRide();   // fresh simulation from the new route's start = current position
}

/* ---------- warning card (design 08/12/14) ----------
   Light tinted card at the top; the nav banner steps aside while
   it shows. Variants: red = niet-toegestane zone (with reroute),
   amber = naar de rijbaan (dismiss), grey = geen route gevonden. */
let zoneCardTimer = null;
let zoneCardAction = null;   // what the big CTA does right now

function showZoneCard(w) {
  const el = $('#zone-card');
  const isRijbaan = w.type === 'rijbaan';
  el.classList.remove('hidden', 'noroute');
  el.classList.toggle('rijbaan', isRijbaan);
  $('#nav-banner').classList.add('hidden');

  if (isRijbaan) {
    $('#zone-title').textContent = 'Je gaat naar de rijbaan';
    $('#zone-body').textContent =
      'Vanaf hier rijdt de snorfiets op de rijbaan. Daarmee geldt een helmplicht op dit weggedeelte.';
    $('#zone-cta-text').textContent = 'Begrepen';
    zoneCardAction = hideZoneCard;
  } else {
    $('#zone-title').textContent = 'Je rijdt in een niet-toegestane zone';
    $('#zone-body').textContent =
      'Deze rijzone is niet toegestaan voor jouw type scooter. Verlaat de zone zodra dit veilig kan.';
    $('#zone-cta-text').textContent = 'Route herbereken';
    zoneCardAction = recalcRoute;
  }

  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(zoneCardTimer);
  zoneCardTimer = setTimeout(hideZoneCard, 9000);
}

/** Grey variant for the contract's { fout } response (design 14). */
function showNoRoute(message) {
  showPanel('#panel-search');
  const el = $('#zone-card');
  el.classList.remove('hidden', 'rijbaan');
  el.classList.add('noroute');
  $('#zone-title').textContent = 'Geen route gevonden';
  $('#zone-body').textContent = message && !/^Route-API/.test(message)
    ? message
    : 'We vonden geen route die alle verboden zones vermijdt. Kies een bestemming iets verderop, of loop het laatste stuk.';
  $('#zone-cta-text').textContent = 'Andere bestemming';
  zoneCardAction = () => { hideZoneCard(); showPanel('#panel-search'); };
  clearTimeout(zoneCardTimer);
}

function hideZoneCard() {
  clearTimeout(zoneCardTimer);
  $('#zone-card').classList.add('hidden');
  // banner terug zodra we nog rijden
  if (!$('#panel-ride').classList.contains('hidden')) {
    $('#nav-banner').classList.remove('hidden');
  }
}

/* ---------- rules screen (the design's Welkom-page) ---------- */
function renderRules() {
  $('#rules-list').innerHTML = state.city.rules.map(r => `
    <div class="rule-card">
      <span class="icon"><svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.2"/><path d="M12 16v-4.5M12 8h.01"/></svg></span>
      <div><h4>${r.title}</h4><p>${r.text}</p></div>
    </div>`).join('');
}
function openRules(mode = 'welcome') {
  if (mode === 'reference') {
    // design 11: naslag vanuit de i-knop of het account
    $('#rules-title').textContent = 'Wet en regelgeving in ' + state.city.name;
    $('#rules-sub').textContent = '';
    $('#rules-ok-text').textContent = 'Sluiten';
  } else {
    $('#rules-title').textContent = 'Welkom in ' + state.city.name;
    $('#rules-ok-text').textContent = 'Ik heb het begrepen';
    // The intro line follows the chosen vehicle (plate color differs).
    $('#rules-sub').innerHTML = state.vehicle === 'bromfiets'
      ? `Je rijdt ${state.city.name} binnen met een bromfiets met <u>geel kenteken</u>. Dit zijn de belangrijkste regels voor jouw voertuig.`
      : `Je rijdt ${state.city.name} binnen met een snorfiets met <u>blauw kenteken</u>. Dit zijn de belangrijkste regels voor jouw voertuig.`;
  }
  $('#rules-screen').classList.remove('hidden');
}
function closeRules() {
  $('#rules-screen').classList.add('hidden');
  if (!localStorage.getItem(ONBOARDED_KEY)) {
    localStorage.setItem(ONBOARDED_KEY, '1');
  }
}

/* ---------- shareable URL ---------- */
function writeHash(destination) {
  history.replaceState(null, '', destination
    ? `#eind=${destination.point[0].toFixed(5)},${destination.point[1].toFixed(5)}&naam=${encodeURIComponent(destination.name)}`
    : location.pathname);
}
function readHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  const end = p.get('eind')?.split(',').map(Number);
  if (!end || end.length !== 2 || end.some(isNaN)) return null;
  return { name: p.get('naam') || 'Gedeelde bestemming', area: 'Via link', point: end };
}

/* ---------- events ---------- */
function bindEvents() {
  $('#search-input').addEventListener('input', e => { setSearchStatus(null); fillSuggestions(e.target.value); });
  $('#overview-back').addEventListener('click', () => { map.clearRoute(); showPanel('#panel-search'); });
  $('#start-route').addEventListener('click', startRide);
  $('#stop-route').addEventListener('click', stopRide);
  $('#new-route').addEventListener('click', newRoute);
  $('#zone-close').addEventListener('click', hideZoneCard);
  $('#zone-cta').addEventListener('click', () => zoneCardAction?.());

  // floating map controls
  $('#btn-layers').addEventListener('click', () => openSheet('#panel-layers'));
  $('#btn-locate').addEventListener('click', () => {
    if (state.simulation && state.lastStep) map.followRider(state.lastStep.point, state.lastStep.heading);
    else map.overviewCamera(state.start);
  });
  let soundOn = true;
  $('#btn-sound').addEventListener('click', () => {
    soundOn = !soundOn;
    $('#btn-sound').classList.toggle('active', !soundOn);
    showToast(soundOn ? 'Gesproken aanwijzingen aan' : 'Gesproken aanwijzingen uit');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeSheet) closeSheet();
  });

  document.querySelectorAll('#demo-speed button').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('#demo-speed button').forEach(b => b.classList.toggle('active', b === btn));
      state.simulation?.setFactor(+btn.dataset.x);
    }));
}

/* ---------- onboarding (design 01/15/16/33/32) ---------- */
function bindOnboarding() {
  const views = ['#auth-login', '#auth-register', '#auth-forgot'];
  const showView = (id) => views.forEach(v => $(v).classList.toggle('hidden', v !== id));

  $('#auth-to-register').addEventListener('click', () => showView('#auth-register'));
  $('#auth-to-forgot').addEventListener('click', () => showView('#auth-forgot'));
  $$('[data-auth-back]').forEach(b => b.addEventListener('click', () => showView('#auth-login')));
  $('#auth-login-go').addEventListener('click', finishAuth);
  $('#auth-register-go').addEventListener('click', finishAuth);
  $('#auth-forgot-go').addEventListener('click', () => {
    showToast('Link verstuurd. Check je mail.');
    setTimeout(() => showView('#auth-login'), 900);
  });

  $$('.plate-card').forEach(card => card.addEventListener('click', () => {
    $$('.plate-card').forEach(c => c.classList.toggle('selected', c === card));
  }));
  $('#plate-go').addEventListener('click', () => {
    state.vehicle = document.querySelector('.plate-card.selected')?.dataset.vehicle ?? 'snorfiets';
    localStorage.setItem(VEHICLE_KEY, state.vehicle);
    $('#plate-screen').classList.add('hidden');
    runRulesDownload().then(() => openRules('welcome'));
  });
}
function finishAuth() {
  $('#auth-screen').classList.add('hidden');
  $('#plate-screen').classList.remove('hidden');
}

/** Design 32: the "rules download" moment. Pure theatre in mock
    mode, real progress feedback once track C's pipeline exists. */
async function runRulesDownload() {
  const screen = $('#rules-loading');
  screen.classList.remove('hidden');
  const tiles = $('#rules-loading-tiles');
  tiles.innerHTML = Array.from({ length: 32 }, (_, i) => {
    const cls = ['', 'c1', '', 'c2', '', 'c3', '', ''][i % 8];
    return `<i class="${cls}" style="animation-delay:${(i * 55)}ms"></i>`;
  }).join('');
  const counter = $('#rules-loading-n');
  const total = 340, duur = 2300, t0 = performance.now();
  await new Promise((done) => {
    (function tick() {
      const p = Math.min(1, (performance.now() - t0) / duur);
      counter.textContent = Math.round(total * (1 - Math.pow(1 - p, 2)));
      if (p < 1) requestAnimationFrame(tick); else done();
    })();
  });
  await pause(350);
  screen.classList.add('hidden');
}

/* ---------- sheets: kaartlagen / zone-detail / venster / straat ---------- */
function bindSheets() {
  // kaartlagen-toggles -> kaartlagen in map.js
  $$('#panel-layers [data-layer]').forEach(input =>
    input.addEventListener('change', () => {
      if (input.dataset.layer === 'venstertijd') map.setWindowZonesVisible(input.checked);
      else map.setRegimeVisible(input.dataset.layer, input.checked);
    }));
  $('#open-window').addEventListener('click', () => openSheet('#panel-window'));
  $('#open-street').addEventListener('click', () => openSheet('#panel-street'));
  $('#zd-decree').addEventListener('click', () => showToast('Opent het Gemeenteblad (demo)'));
  $$('.panel.sheet .grab').forEach(g => g.addEventListener('click', closeSheet));

  // tijdvenster-verkenner (design 28)
  const slider = $('#window-slider');
  slider.addEventListener('input', () => updateWindowExplorer(+slider.value));
  updateWindowExplorer(+slider.value);
}

const WINDOW_FROM = 11, WINDOW_TO = 18; // ma-za 11:00-18:00 (demo-data)
function updateWindowExplorer(hour) {
  const hh = Math.floor(hour), mm = Math.round((hour - hh) * 60);
  $('#window-now').textContent = hh + ':' + String(mm).padStart(2, '0');
  const closed = hour >= WINDOW_FROM && hour < WINDOW_TO;
  const stateBox = $('#window-state');
  stateBox.classList.toggle('open', !closed);
  stateBox.innerHTML = closed
    ? '<b>Nu gesloten: Steenweg en Lijnmarkt</b><span>Venstertijd ma-za 11:00 tot 18:00</span>'
    : '<b>Na 18:00 mag je hier wel rijden</b><span>Dan vervalt het voetgangersgebied</span>';
  // de venstertijd-zones op de kaart bewegen live mee met de slider
  map.setWindowZonesVisible(closed);
}

/* ---------- zone-detail (design 26) ---------- */
const REGIME_DETAIL = {
  verboden: { badge: 'VERBODEN', cls: '', desc: 'Hier mag je met een {voertuig} niet rijden{venster}.' },
  rijbaan:  { badge: 'NAAR DE RIJBAAN', cls: 'rijbaan', desc: 'Vanaf hier rijdt de {voertuig} op de rijbaan. Er geldt een helmplicht op dit weggedeelte.' },
  fietspad: { badge: 'FIETSPAD TOEGESTAAN', cls: 'fietspad', desc: 'Hier mag je met een {voertuig} gewoon op het fietspad rijden.' },
};
function openZoneDetail(props) {
  const regime = props.regime ?? 'verboden';
  const info = REGIME_DETAIL[regime] ?? REGIME_DETAIL.verboden;
  const venster = props.tijdvenster && props.tijdvenster !== 'null' ? props.tijdvenster : null;

  const badge = $('#zd-badge');
  badge.textContent = info.badge;
  badge.className = 'zone-badge ' + info.cls;
  $('#zd-name').textContent = props.naam ?? 'Zone';
  $('#zd-desc').textContent = info.desc
    .replace('{voertuig}', props.voertuig ?? 'scooter')
    .replace('{venster}', venster
      ? ' tijdens de venstertijd. Buiten die tijden is het wel toegestaan'
      : '');

  const windowCard = $('#zd-window');
  windowCard.classList.toggle('hidden', !venster);
  if (venster) {
    $('#zd-window-time').textContent = venster.replace('-', ' tot ').replace(/(\d\d:\d\d) tot /, '$1 tot ');
    $('#zd-window-now').textContent = windowStatusLine(venster);
  }

  $('#zd-vehicle').textContent = cap(props.voertuig ?? '–');
  $('#zd-since').textContent = fmtDateNl(props.geldig_vanaf);
  $('#zd-certainty').textContent = props.zekerheid === 'hard'
    ? 'Hard, letterlijk in het besluit'
    : 'Zacht, afgeleid uit de tekst';
  $('#zd-source').textContent = props.bron === 'mock' ? 'Gemeenteblad (demo)' : (props.bron ?? '–');
  openSheet('#panel-zone');
}
/** "Nu geldt het verbod. Over 2 uur mag je hier rijden." — live. */
function windowStatusLine(venster) {
  const m = venster.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!m) return 'Geldt binnen de venstertijd.';
  const now = new Date();
  const nowH = now.getHours() + now.getMinutes() / 60;
  const from = +m[1] + +m[2] / 60, to = +m[3] + +m[4] / 60;
  if (nowH >= from && nowH < to) {
    const rest = Math.max(1, Math.round(to - nowH));
    return `Nu geldt het verbod. Over ${rest === 1 ? '1 uur' : rest + ' uur'} mag je hier rijden.`;
  }
  return `Nu toegestaan. Vanaf ${m[1]}:${m[2]} geldt het verbod weer.`;
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function fmtDateNl(iso) {
  if (!iso) return '–';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* ---------- toast ---------- */
let toastTimer = null;
function showToast(text) {
  const el = $('#app-toast');
  el.textContent = text;
  el.classList.remove('hidden');
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2600);
}

/* ---------- banner arrow icons ---------- */
const ARROWS = {
  left: '<svg width="26" height="26" viewBox="0 0 24 24" stroke="#fff" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M15 20V11a4 4 0 0 0-4-4H6"/><path d="m10 3-5 4 5 4"/></svg>',
  right: '<svg width="26" height="26" viewBox="0 0 24 24" stroke="#fff" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 20V11a4 4 0 0 1 4-4h5"/><path d="m14 3 5 4-5 4"/></svg>',
  arrival: '<svg width="26" height="26" viewBox="0 0 24 24" stroke="#fff" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 5h11l-2 3.5 2 3.5H5"/></svg>',
};

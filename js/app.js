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
import { fetchRoute, loadRules } from './api.js';
import * as map from './map.js';
import { buildManeuvers, startSimulation, fmtDistance, fmtDuration, fmtArrival } from './navigation.js';

const $ = (s) => document.querySelector(s);
const RULES_SEEN_KEY = 'scoot.rulesSeen';

/* Fixed demo destinations. Once track B ships geocoding this list
   can go; until then it is the search index. */
const DESTINATIONS = [
  { name: 'Domplein',         area: 'Binnenstad',     point: [5.12222, 52.09062] },
  { name: 'Utrecht Centraal', area: 'Stationsgebied', point: [5.10999, 52.08949] },
  { name: 'Neude',            area: 'Binnenstad',     point: [5.11862, 52.09329] },
  { name: 'TivoliVredenburg', area: 'Vredenburgkade', point: [5.11282, 52.09230] },
  { name: 'Jaarbeurs',        area: 'Croeselaan',     point: [5.10530, 52.08560] },
  { name: 'Ledig Erf',        area: 'Zuid',           point: [5.12310, 52.07940] },
  { name: 'Griftpark',        area: 'Noordoost',      point: [5.12660, 52.10050] },
  { name: 'Wilhelminapark',   area: 'Oost',           point: [5.13450, 52.08370] },
];

/* The four rule cards from the design's "Welkom in Utrecht" screen. */
const RULES = [
  { title: 'Rijd op de rijbaan',
    text: 'Op wegen waar je maximaal 50 km/u mag rijden, hoor je met een bromscooter op de rijbaan. Volg altijd de verkeersborden bij uitzonderingen.' },
  { title: 'Let op wisselende rijzones',
    text: 'Op sommige plekken gaat de route over in een verplicht fiets- of bromfietspad. De app waarschuwt je voordat de rijzone verandert.' },
  { title: 'Snorscooters soms ook op de rijbaan',
    text: 'Rijd je met een blauw kenteken? In grote delen van Utrecht moet je dan toch op de rijbaan rijden. Volg de blauwe routeborden langs de weg.' },
  { title: 'Parkeren rond Utrecht Centraal',
    text: 'Rond het stationsgebied mag je alleen parkeren in een aangewezen vak, rek of scooterstalling. Daarbuiten kan je scooter worden verwijderd.' },
];

/* ---------- app state ---------- */
const state = {
  vehicle: 'snorfiets',   // contract value, goes into the API request as-is
  destination: null,      // { name, point }
  route: null,            // normalized API response
  simulation: null,       // handles from startSimulation
  lastStep: null,         // most recent simulation step (for rerouting)
};

/* ---------- boot ---------- */
init();
async function init() {
  renderRules();

  // The concept's welcome moment: show the local rules once,
  // before the map — it doubles as a loading screen. Bind its
  // buttons NOW: the map below can take seconds on slow networks
  // and the close button must never be dead in the meantime.
  $('#rules-ok').addEventListener('click', closeRules);
  $('#btn-rules').addEventListener('click', openRules);
  if (!localStorage.getItem(RULES_SEEN_KEY)) openRules();

  await map.initMap();
  map.setRider(CONFIG.start, 0);

  // Track C's zone rules go on immediately — they are the product.
  try {
    map.drawZones(await loadRules());
  } catch (e) {
    console.warn('Zones niet geladen:', e.message);
  }

  map.onMapClick((point) => {
    // Only pick a new destination when not mid-ride.
    if (!$('#panel-ride').classList.contains('hidden')) return;
    chooseDestination({ name: 'Gekozen punt', area: 'Via de kaart', point });
  });

  fillSuggestions('');
  bindEvents();

  // Shareable URL: #eind=lon,lat&naam=… plans the route directly.
  const shared = readHash();
  if (shared) chooseDestination(shared);
}

/* ---------- panel switching ---------- */
const PANELS = ['#panel-search', '#panel-overview', '#panel-ride', '#panel-done'];
function showPanel(id) {
  PANELS.forEach(p => $(p).classList.toggle('hidden', p !== id));
  $('#demo-speed').classList.toggle('hidden', id !== '#panel-ride');
  $('#nav-banner').classList.toggle('hidden', id !== '#panel-ride');
  if (id !== '#panel-ride') hideZoneCard();
}

/* ---------- search ---------- */
function fillSuggestions(filter) {
  const f = filter.trim().toLowerCase();
  const list = DESTINATIONS.filter(d =>
    d.name.toLowerCase().includes(f) || d.area.toLowerCase().includes(f));

  $('#suggestions').innerHTML = list.length
    ? list.map(d => `
      <button class="suggestion" data-i="${DESTINATIONS.indexOf(d)}">
        <span class="pin"><svg width="17" height="17" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10.5c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10.2" r="2.7"/></svg></span>
        <span><b>${d.name}</b><small>${d.area}</small></span>
      </button>`).join('')
    : '<p class="hint">Geen locatie gevonden. Of tik op de kaart.</p>';

  $('#suggestions').querySelectorAll('.suggestion').forEach(el =>
    el.addEventListener('click', () => chooseDestination(DESTINATIONS[+el.dataset.i])));
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
  setSearchStatus('Route berekenen…');

  try {
    state.route = await fetchRoute(CONFIG.start, destination.point, state.vehicle);
  } catch (e) {
    setSearchStatus('Route ophalen mislukte: ' + e.message, true);
    showPanel('#panel-search');
    return;
  }
  setSearchStatus(null);

  const r = state.route;
  map.drawRoute(r.route);
  map.setDestination(destination.point);
  map.setWarnings(r.waarschuwingen);
  map.markArrival(null);
  map.frameRoute(r.route.coordinates);

  $('#overview-destination').textContent = destination.name;
  $('#overview-distance').textContent = fmtDistance(r.afstand_m);
  $('#overview-time').textContent = fmtDuration(r.duur_s);
  $('#overview-warnings').textContent = r.waarschuwingen.length;
  showPanel('#panel-overview');
}

/* ---------- riding ---------- */
function startRide() {
  const r = state.route;
  const { ruler, maneuvers } = buildManeuvers(r.route.coordinates);
  showPanel('#panel-ride');

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
      $('#nav-arrow').innerHTML = ARROWS[step.maneuver.direction];
      const nextRow = $('#nav-next');
      nextRow.classList.toggle('hidden', !step.nextManeuver);
      if (step.nextManeuver) nextRow.innerHTML = 'Volgende: <b>' + step.nextManeuver.label + '</b>';
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
  $('#done-destination').textContent = state.destination.name + ', Utrecht';
  $('#done-distance').textContent = fmtDistance(r.afstand_m);
  $('#done-time').textContent = fmtDuration(r.duur_s);
  $('#done-warnings').textContent = r.waarschuwingen.length;
  showPanel('#panel-done');
  map.markArrival(state.destination.point);
  map.overviewCamera(state.destination.point);
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
  map.setRider(CONFIG.start, 0);
  map.overviewCamera(CONFIG.start);
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
  const from = state.lastStep?.point ?? CONFIG.start;
  try {
    state.route = await fetchRoute(from, state.destination.point, state.vehicle);
  } catch (e) {
    setSearchStatus('Route ophalen mislukte: ' + e.message, true);
    showPanel('#panel-search');
    return;
  }
  map.drawRoute(state.route.route);
  map.setWarnings(state.route.waarschuwingen);
  startRide();   // fresh simulation from the new route's start = current position
}

/* ---------- zone warning ---------- */
let zoneCardTimer = null;
function showZoneCard(w) {
  const el = $('#zone-card');
  el.classList.remove('hidden');
  el.classList.toggle('rijbaan', w.type === 'rijbaan');
  // Contract texts usually read "Kop: detail" — bold the head
  // instead of prefixing our own.
  const [head, ...rest] = w.tekst.split(':');
  $('#zone-text').innerHTML = rest.length
    ? `<b>${head.trim()}</b> · ${rest.join(':').trim()}`
    : `<b>${w.type === 'rijbaan' ? 'Let op' : 'Verboden zone'}</b> · ${w.tekst}`;
  clearTimeout(zoneCardTimer);
  zoneCardTimer = setTimeout(hideZoneCard, 8000);
}
function hideZoneCard() {
  clearTimeout(zoneCardTimer);
  $('#zone-card').classList.add('hidden');
}

/* ---------- rules screen (Welkom in Utrecht) ---------- */
function renderRules() {
  $('#rules-list').innerHTML = RULES.map(r => `
    <div class="rule-card">
      <span class="icon"><svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.2"/><path d="M12 16v-4.5M12 8h.01"/></svg></span>
      <div><h4>${r.title}</h4><p>${r.text}</p></div>
    </div>`).join('');
}
function openRules() {
  // The intro line follows the chosen vehicle (plate color differs).
  $('#rules-sub').innerHTML = state.vehicle === 'bromfiets'
    ? 'Je rijdt Utrecht binnen met een bromfiets met <u>geel kenteken</u>. Dit zijn de belangrijkste regels voor jouw voertuig.'
    : 'Je rijdt Utrecht binnen met een snorfiets met <u>blauw kenteken</u>. Dit zijn de belangrijkste regels voor jouw voertuig.';
  $('#rules-screen').classList.remove('hidden');
}
function closeRules() {
  localStorage.setItem(RULES_SEEN_KEY, '1');
  $('#rules-screen').classList.add('hidden');
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
  $('#zone-reroute').addEventListener('click', recalcRoute);

  document.querySelectorAll('.vehicle-option').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('.vehicle-option').forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-checked', b === btn);
      });
      state.vehicle = btn.dataset.vehicle;
      // Different vehicle class = possibly different rules: replan.
      if (state.destination && !$('#panel-overview').classList.contains('hidden')) {
        chooseDestination(state.destination);
      }
    }));

  document.querySelectorAll('#demo-speed button').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('#demo-speed button').forEach(b => b.classList.toggle('active', b === btn));
      state.simulation?.setFactor(+btn.dataset.x);
    }));
}

/* ---------- banner arrow icons ---------- */
const ARROWS = {
  left: '<svg width="26" height="26" viewBox="0 0 24 24" stroke="#fff" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M15 20V11a4 4 0 0 0-4-4H6"/><path d="m10 3-5 4 5 4"/></svg>',
  right: '<svg width="26" height="26" viewBox="0 0 24 24" stroke="#fff" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 20V11a4 4 0 0 1 4-4h5"/><path d="m14 3 5 4-5 4"/></svg>',
  arrival: '<svg width="26" height="26" viewBox="0 0 24 24" stroke="#fff" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 5h11l-2 3.5 2 3.5H5"/></svg>',
};

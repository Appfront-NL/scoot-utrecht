// ============================================================
// APP — de lijm: schermen, events en de flow
// zoeken → overzicht → rijden → aangekomen.
//
// Bewust dom gehouden: dit bestand kent geen MapLibre en geen
// fetch. Kaartwerk zit in kaart.js, netwerkzaken in api.js,
// rekenwerk in geo.js/navigatie.js. Wie de flow wil aanpassen
// hoeft alleen hier te zijn.
// ============================================================

import { CONFIG } from './config.js';
import { haalRoute, laadRegels } from './api.js';
import * as kaart from './kaart.js';
import { maakManoeuvres, startSimulatie, fmtAfstand, fmtDuur, fmtAankomst } from './navigatie.js';

const $ = (s) => document.querySelector(s);

/* Vaste bestemmingen voor de demo. Als spoor B ooit geocoding
   levert kan dit lijstje weg; tot die tijd is dit de zoekindex. */
const BESTEMMINGEN = [
  { naam: 'Domplein',         sub: 'Binnenstad',       punt: [5.12222, 52.09062] },
  { naam: 'Utrecht Centraal', sub: 'Stationsgebied',   punt: [5.10999, 52.08949] },
  { naam: 'Neude',            sub: 'Binnenstad',       punt: [5.11862, 52.09329] },
  { naam: 'TivoliVredenburg', sub: 'Vredenburgkade',   punt: [5.11282, 52.09230] },
  { naam: 'Jaarbeurs',        sub: 'Croeselaan',       punt: [5.10530, 52.08560] },
  { naam: 'Ledig Erf',        sub: 'Zuid',             punt: [5.12310, 52.07940] },
  { naam: 'Griftpark',        sub: 'Noordoost',        punt: [5.12660, 52.10050] },
  { naam: 'Wilhelminapark',   sub: 'Oost',             punt: [5.13450, 52.08370] },
];

/* ---------- app-status ---------- */
const status = {
  voertuig: 'snorfiets',
  bestemming: null,     // { naam, punt }
  route: null,          // genormaliseerd API-antwoord
  simulatie: null,      // handvatten van startSimulatie
  gestartOm: 0,
};

/* ---------- opstarten ---------- */
init();
async function init() {
  await kaart.initKaart();
  kaart.zetRijder(CONFIG.start, 0);

  // Zone-regels van spoor C er meteen op — daar draait de app om.
  try {
    kaart.tekenZones(await laadRegels());
  } catch (e) {
    console.warn('Zones niet geladen:', e.message);
  }

  kaart.bijKaartKlik((punt) => {
    // Alleen een nieuwe bestemming kiezen als we niet aan het rijden zijn.
    if (!$('#paneel-rijden').classList.contains('verborgen')) return;
    kiesBestemming({ naam: 'Gekozen punt', sub: 'Via de kaart', punt });
  });

  vulSuggesties('');
  koppelEvents();

  // Deelbare URL: #eind=lon,lat&naam=… plant de route direct.
  const gedeeld = leesHash();
  if (gedeeld) kiesBestemming(gedeeld);
}

/* ---------- schermwissel ---------- */
const PANELEN = ['#paneel-zoek', '#paneel-overzicht', '#paneel-rijden', '#paneel-klaar'];
function toonPaneel(id) {
  PANELEN.forEach(p => $(p).classList.toggle('verborgen', p !== id));
  $('#demo-snelheid').classList.toggle('verborgen', id !== '#paneel-rijden');
  $('#navbanner').classList.toggle('verborgen', id !== '#paneel-rijden');
  if (id !== '#paneel-rijden') verbergZonekaart();
}

/* ---------- zoeken ---------- */
function vulSuggesties(filter) {
  const f = filter.trim().toLowerCase();
  const lijst = BESTEMMINGEN.filter(b =>
    b.naam.toLowerCase().includes(f) || b.sub.toLowerCase().includes(f));

  $('#suggesties').innerHTML = lijst.length
    ? lijst.map((b, i) => `
      <button class="suggestie" data-i="${BESTEMMINGEN.indexOf(b)}">
        <span class="pin"><svg width="17" height="17" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10.5c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10.2" r="2.7"/></svg></span>
        <span><b>${b.naam}</b><small>${b.sub}</small></span>
      </button>`).join('')
    : '<p class="hint">Geen locatie gevonden. Of tik op de kaart.</p>';

  $('#suggesties').querySelectorAll('.suggestie').forEach(el =>
    el.addEventListener('click', () => kiesBestemming(BESTEMMINGEN[+el.dataset.i])));
}

/* ---------- route plannen ---------- */
async function kiesBestemming(bestemming) {
  status.bestemming = bestemming;
  schrijfHash(bestemming);

  try {
    status.route = await haalRoute(CONFIG.start, bestemming.punt, status.voertuig);
  } catch (e) {
    // Contract-fout of netwerk stuk: terug naar zoeken met een nette melding.
    alert('Route ophalen mislukte: ' + e.message);
    return;
  }

  const r = status.route;
  kaart.tekenRoute(r.route);
  kaart.zetBestemming(bestemming.punt);
  kaart.zetWaarschuwingen(r.waarschuwingen);
  kaart.kadreerRoute(r.route.coordinates);

  $('#overzicht-bestemming').textContent = bestemming.naam;
  $('#overzicht-afstand').textContent = fmtAfstand(r.afstand_m);
  $('#overzicht-tijd').textContent = fmtDuur(r.duur_s);
  $('#overzicht-waarschuwingen').textContent = r.waarschuwingen.length;
  toonPaneel('#paneel-overzicht');
}

/* ---------- rijden ---------- */
function startRit() {
  const r = status.route;
  const { liniaal, manoeuvres } = maakManoeuvres(r.route.coordinates);
  status.gestartOm = Date.now();
  toonPaneel('#paneel-rijden');

  status.simulatie = startSimulatie({
    liniaal,
    manoeuvres,
    waarschuwingen: r.waarschuwingen,
    bijStap: (stap) => {
      kaart.zetRijder(stap.punt, stap.richting);
      kaart.volgRijder(stap.punt, stap.richting);
      $('#nav-afstand').textContent = fmtAfstand(stap.totManoeuvreM).toUpperCase();
      $('#nav-actie').textContent = stap.manoeuvre.actie;
      $('#nav-pijl').innerHTML = PIJLEN[stap.manoeuvre.richting];
      $('#rij-tijd').textContent = fmtDuur(stap.resterendS);
      $('#rij-afstand').textContent = fmtAfstand(stap.resterendM);
      $('#rij-aankomst').textContent = fmtAankomst(stap.resterendS);
    },
    bijWaarschuwing: toonZonekaart,
    bijKlaar: eindigRit,
  });
}

function eindigRit() {
  const r = status.route;
  $('#klaar-bestemming').textContent = status.bestemming.naam + ', Utrecht';
  $('#klaar-afstand').textContent = fmtAfstand(r.afstand_m);
  $('#klaar-tijd').textContent = fmtDuur(r.duur_s);
  $('#klaar-waarschuwingen').textContent = r.waarschuwingen.length;
  toonPaneel('#paneel-klaar');
  kaart.overzichtsCamera(status.bestemming.punt);
}

function stopRit() {
  status.simulatie?.stop();
  eindigRit();
}

function nieuweRoute() {
  status.simulatie?.stop();
  status.route = null;
  schrijfHash(null);
  kaart.wisRoute();
  kaart.zetRijder(CONFIG.start, 0);
  kaart.overzichtsCamera(CONFIG.start);
  toonPaneel('#paneel-zoek');
}

/* ---------- zone-waarschuwing ---------- */
let zonekaartTimer = null;
function toonZonekaart(w) {
  const el = $('#zonekaart');
  el.classList.remove('verborgen');
  el.classList.toggle('rijbaan', w.type === 'rijbaan');
  $('#zone-icoon').textContent = '!';
  $('#zone-tekst').innerHTML = `<b>${w.type === 'rijbaan' ? 'Let op' : 'Verboden zone'}</b> · ${w.tekst}`;
  clearTimeout(zonekaartTimer);
  zonekaartTimer = setTimeout(verbergZonekaart, 6000);
}
function verbergZonekaart() {
  clearTimeout(zonekaartTimer);
  $('#zonekaart').classList.add('verborgen');
}

/* ---------- deelbare URL ---------- */
function schrijfHash(bestemming) {
  history.replaceState(null, '', bestemming
    ? `#eind=${bestemming.punt[0].toFixed(5)},${bestemming.punt[1].toFixed(5)}&naam=${encodeURIComponent(bestemming.naam)}`
    : location.pathname);
}
function leesHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  const eind = p.get('eind')?.split(',').map(Number);
  if (!eind || eind.length !== 2 || eind.some(isNaN)) return null;
  return { naam: p.get('naam') || 'Gedeelde bestemming', sub: 'Via link', punt: eind };
}

/* ---------- events ---------- */
function koppelEvents() {
  $('#zoek-invoer').addEventListener('input', e => vulSuggesties(e.target.value));
  $('#overzicht-terug').addEventListener('click', () => { kaart.wisRoute(); toonPaneel('#paneel-zoek'); });
  $('#start-route').addEventListener('click', startRit);
  $('#stop-route').addEventListener('click', stopRit);
  $('#nieuwe-route').addEventListener('click', nieuweRoute);
  $('#zone-sluit').addEventListener('click', verbergZonekaart);

  document.querySelectorAll('.voertuig-optie').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('.voertuig-optie').forEach(b => {
        b.classList.toggle('aan', b === btn);
        b.setAttribute('aria-checked', b === btn);
      });
      status.voertuig = btn.dataset.voertuig;
      // Andere voertuigklasse = mogelijk andere regels: route opnieuw opvragen.
      if (status.bestemming && !$('#paneel-overzicht').classList.contains('verborgen')) {
        kiesBestemming(status.bestemming);
      }
    }));

  document.querySelectorAll('#demo-snelheid button').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('#demo-snelheid button').forEach(b => b.classList.toggle('aan', b === btn));
      status.simulatie?.zetFactor(+btn.dataset.x);
    }));
}

/* ---------- pijl-icoontjes voor de banner ---------- */
const PIJLEN = {
  links: '<svg width="26" height="26" viewBox="0 0 24 24" stroke="#fff" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M15 20V11a4 4 0 0 0-4-4H6"/><path d="m10 3-5 4 5 4"/></svg>',
  rechts: '<svg width="26" height="26" viewBox="0 0 24 24" stroke="#fff" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 20V11a4 4 0 0 1 4-4h5"/><path d="m14 3 5 4-5 4"/></svg>',
  aankomst: '<svg width="26" height="26" viewBox="0 0 24 24" stroke="#fff" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 5h11l-2 3.5 2 3.5H5"/></svg>',
};

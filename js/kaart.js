// ============================================================
// KAART — alles wat MapLibre aanraakt zit in dit bestand.
//
// De rest van de app kent alleen deze functies en geeft er
// [lon, lat]-data aan; niemand anders importeert maplibregl.
// Wil je ooit van kaartbibliotheek wisselen (of een vector-
// stijl met eigen huisstijl), dan is dit het enige bestand
// dat je openmaakt.
// ============================================================

import { CONFIG } from './config.js';

/* Kleuren per regime, gelijk aan CONTRACT.md en css/app.css */
const REGIME_KLEUR = {
  verboden: '#ef4444',
  rijbaan:  '#f59e0b',
  fietspad: '#10b981',
};

let kaart;            // de MapLibre-instantie
let rijderMarker;     // eigen DOM-marker voor de rijder
let bestemmingMarker;
let waarschuwingMarkers = [];

/** Zet de kaart neer en resolve't zodra de stijl geladen is. */
export function initKaart() {
  return new Promise((klaar) => {
    kaart = new maplibregl.Map({
      container: 'kaart',
      style: CONFIG.kaartStijl,
      center: CONFIG.start,
      zoom: 14.4,
      attributionControl: { compact: true },
    });
    kaart.on('load', () => klaar(kaart));
  });
}

/** Laat de app reageren op een tik op de kaart (bestemming kiezen). */
export function bijKaartKlik(handler) {
  kaart.on('click', (e) => handler([e.lngLat.lng, e.lngLat.lat]));
}

/* ---------- zones (regeldata van spoor C) ---------- */

/**
 * Tekent de zone-regels. Polygonen worden vlakken met een
 * gestippelde rand, LineStrings worden gekleurde wegvakken.
 * Kleur volgt het regime; zekerheid 'zacht' wordt transparanter
 * getekend zodat een onzekere regel er ook onzeker uitziet.
 */
export function tekenZones(geojson) {
  kaart.addSource('zones', { type: 'geojson', data: geojson });

  kaart.addLayer({
    id: 'zones-vlak',
    type: 'fill',
    source: 'zones',
    filter: ['==', ['geometry-type'], 'Polygon'],
    paint: {
      'fill-color': ['match', ['get', 'regime'],
        'verboden', REGIME_KLEUR.verboden,
        'rijbaan',  REGIME_KLEUR.rijbaan,
        REGIME_KLEUR.fietspad],
      'fill-opacity': ['case', ['==', ['get', 'zekerheid'], 'zacht'], 0.08, 0.16],
    },
  });

  kaart.addLayer({
    id: 'zones-rand',
    type: 'line',
    source: 'zones',
    filter: ['==', ['geometry-type'], 'Polygon'],
    paint: {
      'line-color': ['match', ['get', 'regime'],
        'verboden', REGIME_KLEUR.verboden,
        'rijbaan',  REGIME_KLEUR.rijbaan,
        REGIME_KLEUR.fietspad],
      'line-width': 1.6,
      'line-dasharray': [2.4, 1.8],
    },
  });

  kaart.addLayer({
    id: 'zones-wegvak',
    type: 'line',
    source: 'zones',
    filter: ['==', ['geometry-type'], 'LineString'],
    paint: {
      'line-color': ['match', ['get', 'regime'],
        'verboden', REGIME_KLEUR.verboden,
        'rijbaan',  REGIME_KLEUR.rijbaan,
        REGIME_KLEUR.fietspad],
      'line-width': 5,
      'line-opacity': ['case', ['==', ['get', 'zekerheid'], 'zacht'], 0.4, 0.75],
    },
    layout: { 'line-cap': 'round', 'line-join': 'round' },
  });

  // Naam van de zone erbij, klein en onopvallend.
  kaart.addLayer({
    id: 'zones-label',
    type: 'symbol',
    source: 'zones',
    layout: {
      'text-field': ['get', 'naam'],
      'text-size': 10.5,
      'text-font': ['Noto Sans Regular'],
    },
    paint: {
      'text-color': '#64748b',
      'text-halo-color': 'rgba(255,255,255,.9)',
      'text-halo-width': 1.4,
    },
  });
}

/* ---------- route ---------- */

/** Tekent (of vervangt) de actieve route: witte rand + blauwe lijn. */
export function tekenRoute(lineString) {
  const data = { type: 'Feature', geometry: lineString, properties: {} };
  if (kaart.getSource('route')) {
    kaart.getSource('route').setData(data);
    return;
  }
  kaart.addSource('route', { type: 'geojson', data });
  kaart.addLayer({
    id: 'route-rand', type: 'line', source: 'route',
    paint: { 'line-color': '#ffffff', 'line-width': 9 },
    layout: { 'line-cap': 'round', 'line-join': 'round' },
  });
  kaart.addLayer({
    id: 'route-lijn', type: 'line', source: 'route',
    paint: { 'line-color': '#2f6fed', 'line-width': 5.5 },
    layout: { 'line-cap': 'round', 'line-join': 'round' },
  });
}

export function wisRoute() {
  ['route-lijn', 'route-rand'].forEach(id => kaart.getLayer(id) && kaart.removeLayer(id));
  kaart.getSource('route') && kaart.removeSource('route');
  zetBestemming(null);
  zetWaarschuwingen([]);
}

/** Zoomt zo dat de hele route in beeld staat, boven het paneel. */
export function kadreerRoute(coords) {
  const grenzen = coords.reduce(
    (b, c) => b.extend(c),
    new maplibregl.LngLatBounds(coords[0], coords[0]),
  );
  kaart.fitBounds(grenzen, {
    padding: { top: 110, bottom: 330, left: 48, right: 48 },
    duration: 700,
  });
}

/* ---------- markers ---------- */

/** Zet of verplaatst de rijder; richting is een kompaskoers in graden. */
export function zetRijder(punt, richtingGraden = 0) {
  if (!rijderMarker) {
    const el = document.createElement('div');
    el.className = 'rijder';
    el.innerHTML = '<span class="rijder-kern"></span>';
    rijderMarker = new maplibregl.Marker({
      element: el,
      rotationAlignment: 'map',   // pijl draait met de kaart mee
    }).setLngLat(punt).addTo(kaart);
  }
  rijderMarker.setLngLat(punt).setRotation(richtingGraden);
}

export function zetBestemming(punt) {
  if (bestemmingMarker) { bestemmingMarker.remove(); bestemmingMarker = null; }
  if (!punt) return;
  const el = document.createElement('div');
  el.className = 'bestemming-marker';
  bestemmingMarker = new maplibregl.Marker({ element: el }).setLngLat(punt).addTo(kaart);
}

/** Eén marker per waarschuwing uit het API-antwoord, met popup. */
export function zetWaarschuwingen(waarschuwingen) {
  waarschuwingMarkers.forEach(m => m.remove());
  waarschuwingMarkers = waarschuwingen.map(w => {
    const el = document.createElement('div');
    el.className = 'waarschuwing-marker' + (w.type === 'rijbaan' ? ' rijbaan' : '');
    el.textContent = '!';
    return new maplibregl.Marker({ element: el })
      .setLngLat(w.bij)
      .setPopup(new maplibregl.Popup({ offset: 18, closeButton: false }).setText(w.tekst))
      .addTo(kaart);
  });
}

/* ---------- camera ---------- */

/** Rijmodus: camera achter de rijder, kaart draait mee met de koers. */
export function volgRijder(punt, richtingGraden) {
  // Korte duur + lineaire easing: dit wordt elk frame opnieuw
  // aangeroepen, dus een lange animatie zou eeuwig achter de
  // rijder aan blijven hobbelen.
  kaart.easeTo({
    center: punt,
    bearing: richtingGraden,
    zoom: 16.3,
    pitch: 40,
    duration: 350,
    easing: t => t,
  });
}

/** Terug naar de rustige overzichtsstand. */
export function overzichtsCamera(punt) {
  kaart.easeTo({ center: punt, bearing: 0, pitch: 0, zoom: 14.4, duration: 800 });
}

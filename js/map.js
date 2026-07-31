// ============================================================
// MAP — everything that touches MapLibre lives in this file.
//
// The rest of the app only knows these functions and hands them
// [lon, lat] data; nobody else imports maplibregl. If we ever
// swap map libraries (or move to a branded vector style), this
// is the only file to open.
// ============================================================

import { CONFIG } from './config.js';

/* Colors per regime. The keys are contract values (CONTRACT.md,
   track C's rule data) — Dutch on purpose, don't translate. */
const REGIME_COLOR = {
  verboden: '#ef4444',
  rijbaan:  '#f59e0b',
  fietspad: '#10b981',
};

let map;               // the MapLibre instance
let riderMarker;       // custom DOM marker for the rider
let destinationMarker;
let arrivalBadge;
let warningMarkers = [];

/** Mounts the map on the given center, resolves once loaded. */
export function initMap(center) {
  return new Promise((done) => {
    map = new maplibregl.Map({
      container: 'map',
      style: CONFIG.mapStyle,
      center,
      zoom: 14.4,
      attributionControl: { compact: true },
    });
    map.on('load', () => done(map));
  });
}

/** Lets the app react to a tap on the map (pick a destination). */
export function onMapClick(handler) {
  map.on('click', (e) => handler([e.lngLat.lng, e.lngLat.lat]));
}

/* ---------- zones (track C's rule data) ---------- */

/**
 * Draws the zone rules. Polygons become fills with a dashed
 * outline, LineStrings become colored road segments. Color
 * follows the regime; zekerheid 'zacht' renders more transparent
 * so an uncertain rule also *looks* uncertain.
 */
export function drawZones(geojson) {
  // Re-drawing = city switch: just swap the data in place.
  if (map.getSource('zones')) {
    map.getSource('zones').setData(geojson);
    return;
  }
  map.addSource('zones', { type: 'geojson', data: geojson });

  map.addLayer({
    id: 'zones-fill',
    type: 'fill',
    source: 'zones',
    filter: ['==', ['geometry-type'], 'Polygon'],
    paint: {
      'fill-color': ['match', ['get', 'regime'],
        'verboden', REGIME_COLOR.verboden,
        'rijbaan',  REGIME_COLOR.rijbaan,
        REGIME_COLOR.fietspad],
      'fill-opacity': ['case', ['==', ['get', 'zekerheid'], 'zacht'], 0.08, 0.16],
    },
  });

  map.addLayer({
    id: 'zones-outline',
    type: 'line',
    source: 'zones',
    filter: ['==', ['geometry-type'], 'Polygon'],
    paint: {
      'line-color': ['match', ['get', 'regime'],
        'verboden', REGIME_COLOR.verboden,
        'rijbaan',  REGIME_COLOR.rijbaan,
        REGIME_COLOR.fietspad],
      'line-width': 1.6,
      'line-dasharray': [2.4, 1.8],
    },
  });

  map.addLayer({
    id: 'zones-segment',
    type: 'line',
    source: 'zones',
    filter: ['==', ['geometry-type'], 'LineString'],
    paint: {
      'line-color': ['match', ['get', 'regime'],
        'verboden', REGIME_COLOR.verboden,
        'rijbaan',  REGIME_COLOR.rijbaan,
        REGIME_COLOR.fietspad],
      'line-width': 5,
      'line-opacity': ['case', ['==', ['get', 'zekerheid'], 'zacht'], 0.4, 0.75],
    },
    layout: { 'line-cap': 'round', 'line-join': 'round' },
  });

  // Zone name alongside, small and quiet.
  map.addLayer({
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

/** Draws (or replaces) the active route: white casing + blue line. */
export function drawRoute(lineString) {
  const data = { type: 'Feature', geometry: lineString, properties: {} };
  if (map.getSource('route')) {
    map.getSource('route').setData(data);
    return;
  }
  map.addSource('route', { type: 'geojson', data });
  map.addLayer({
    id: 'route-casing', type: 'line', source: 'route',
    paint: { 'line-color': '#ffffff', 'line-width': 9 },
    layout: { 'line-cap': 'round', 'line-join': 'round' },
  });
  map.addLayer({
    id: 'route-line', type: 'line', source: 'route',
    paint: { 'line-color': '#2f6fed', 'line-width': 5.5 },
    layout: { 'line-cap': 'round', 'line-join': 'round' },
  });
}

export function clearRoute() {
  ['route-line', 'route-casing'].forEach(id => map.getLayer(id) && map.removeLayer(id));
  map.getSource('route') && map.removeSource('route');
  setDestination(null);
  setWarnings([]);
  markArrival(null);
}

/** Zooms so the whole route fits, above the bottom panel. */
export function frameRoute(coords) {
  const bounds = coords.reduce(
    (b, c) => b.extend(c),
    new maplibregl.LngLatBounds(coords[0], coords[0]),
  );
  map.fitBounds(bounds, {
    padding: { top: 110, bottom: 330, left: 48, right: 48 },
    duration: 700,
  });
}

/* ---------- markers ---------- */

/** Places or moves the rider; heading is a compass bearing in degrees. */
export function setRider(point, headingDeg = 0) {
  if (!riderMarker) {
    const el = document.createElement('div');
    el.className = 'rider';
    el.innerHTML = '<span class="rider-core"></span>';
    riderMarker = new maplibregl.Marker({
      element: el,
      rotationAlignment: 'map',   // arrow rotates with the map
    }).setLngLat(point).addTo(map);
  }
  riderMarker.setLngLat(point).setRotation(headingDeg);
}

export function setDestination(point) {
  if (destinationMarker) { destinationMarker.remove(); destinationMarker = null; }
  if (!point) return;
  const el = document.createElement('div');
  el.className = 'destination-marker';
  destinationMarker = new maplibregl.Marker({ element: el }).setLngLat(point).addTo(map);
}

/** One marker per warning from the API response, with a popup. */
export function setWarnings(warnings) {
  warningMarkers.forEach(m => m.remove());
  warningMarkers = warnings.map(w => {
    const el = document.createElement('div');
    el.className = 'warning-marker' + (w.type === 'rijbaan' ? ' rijbaan' : '');
    el.textContent = '!';
    return new maplibregl.Marker({ element: el })
      .setLngLat(w.bij)
      .setPopup(new maplibregl.Popup({ offset: 18, closeButton: false }).setText(w.tekst))
      .addTo(map);
  });
}

/** Green "Je bent er" badge on the destination (design: You are here). */
export function markArrival(point) {
  if (arrivalBadge) { arrivalBadge.remove(); arrivalBadge = null; }
  if (!point) return;
  const el = document.createElement('div');
  el.className = 'arrival-badge';
  el.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg> Je bent er';
  arrivalBadge = new maplibregl.Marker({ element: el, offset: [0, -30] })
    .setLngLat(point).addTo(map);
}

/* ---------- camera ---------- */

/** Ride mode: camera behind the rider, map rotates with the heading. */
export function followRider(point, headingDeg) {
  // Short duration + linear easing: this runs every tick, so a
  // long animation would forever lag behind the rider.
  map.easeTo({
    center: point,
    bearing: headingDeg,
    zoom: 16.3,
    pitch: 40,
    duration: 350,
    easing: t => t,
  });
}

/** Back to the calm overview framing. */
export function overviewCamera(point) {
  map.easeTo({ center: point, bearing: 0, pitch: 0, zoom: 14.4, duration: 800 });
}

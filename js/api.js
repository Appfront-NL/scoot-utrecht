// ============================================================
// API — the only file that talks over the wire.
//
// fetchRoute() follows CONTRACT.md exactly:
//   request : GET {apiBase}/route?start=lon,lat&eind=lon,lat&voertuig=...
//   response: { route: LineString, afstand_m, waarschuwingen[], ... }
//
// NOTE on naming: the Dutch field names (afstand_m, waarschuwingen,
// bij, tekst, voertuig, regime) are the agreed API contract with
// tracks B and C — do not translate those. Code identifiers are
// English, contract data stays as specified.
//
// With CONFIG.apiBase set to null, mockRoute() fabricates a
// response in exactly the same shape. The rest of the app can't
// tell the difference — that's the point: when Alissa's endpoint
// goes live, nothing outside config.js changes.
// ============================================================

import { CONFIG } from './config.js';
import { distanceM, lerp, distanceToLineM } from './geo.js';

/**
 * Requests a route from start to end.
 * @param {[number,number]} start   [lon, lat]
 * @param {[number,number]} end     [lon, lat]
 * @param {string} vehicle          'snorfiets' | 'bromfiets'
 * @returns {Promise<{route:object, afstand_m:number, duur_s:number, waarschuwingen:Array}>}
 */
export async function fetchRoute(start, end, vehicle) {
  const response = CONFIG.apiBase
    ? await fetchFromApi(start, end, vehicle)
    : await mockRoute(start, end, vehicle);
  return normalize(response);
}

/** Loads the zone rules (track C's GeoJSON) for the map. */
export async function loadRules() {
  const res = await fetch(CONFIG.rulesUrl);
  if (!res.ok) throw new Error(`Regels laden mislukte (${res.status})`);
  return res.json();
}

/* ---------- real backend (track B) ---------- */

async function fetchFromApi(start, end, vehicle) {
  const url = new URL('/route', CONFIG.apiBase);
  url.searchParams.set('start', start.join(','));
  url.searchParams.set('eind', end.join(','));
  url.searchParams.set('voertuig', vehicle);

  const res = await fetch(url);
  if (!res.ok) {
    // Contract: errors carry a { fout: "..." } body.
    const body = await res.json().catch(() => ({}));
    throw new Error(body.fout || `Route-API gaf ${res.status}`);
  }
  return res.json();
}

/* ---------- mock (track A solo) ---------- */

/**
 * Fabricates a route: a dog-legged line from start to end,
 * densified into short segments so navigation and animation have
 * something to run on. Warnings are derived from the *real* zone
 * rules: if the line passes close to a verboden or rijbaan rule,
 * you get the same warning the real backend would produce.
 */
async function mockRoute(start, end, vehicle) {
  // Bend point: roughly east-west first, then north-south. Not real
  // routing — that's track B — but it reads like a street pattern.
  const bend = [end[0], start[1]];
  const coords = [
    ...densify(start, bend, 6),
    ...densify(bend, end, 6).slice(1),
  ];

  let distance = 0;
  for (let i = 1; i < coords.length; i++) distance += distanceM(coords[i - 1], coords[i]);

  // Warnings from the rule data, just like the contract promises.
  const waarschuwingen = [];
  try {
    const rules = await loadRules();
    for (const f of rules.features) {
      if (f.properties.voertuig !== vehicle) continue;
      if (!['verboden', 'rijbaan'].includes(f.properties.regime)) continue;
      const zoneCoords = f.geometry.type === 'Polygon'
        ? f.geometry.coordinates[0]
        : f.geometry.coordinates;
      // "close" = within 130 m of the route
      let nearest = null, best = Infinity;
      for (const p of coords) {
        const d = distanceToLineM(p, zoneCoords);
        if (d < best) { best = d; nearest = p; }
      }
      if (best < 130) {
        waarschuwingen.push({
          bij: nearest,
          tekst: f.properties.regime === 'verboden'
            ? `Verboden zone: ${f.properties.naam}`
            : `Naar de rijbaan (helmplicht): ${f.properties.naam}`,
          type: f.properties.regime,
        });
      }
    }
  } catch {
    // Failing to load rules is no reason to withhold a route.
  }

  return {
    route: { type: 'LineString', coordinates: coords },
    afstand_m: Math.round(distance),
    waarschuwingen,
  };
}

/** Splits the leg a→b into `n` segments with a slight wiggle. */
function densify(a, b, n) {
  const points = [];
  for (let i = 0; i <= n; i++) {
    const p = lerp(a, b, i / n);
    if (i > 0 && i < n) {
      // subtle jitter so the line doesn't look sterile-straight
      p[0] += (Math.sin(i * 2.7) * 0.00018);
      p[1] += (Math.cos(i * 1.9) * 0.00012);
    }
    points.push(p);
  }
  return points;
}

/* ---------- normalization ---------- */

/**
 * Absorbs the contract's optional fields so the rest of the app
 * never has to existence-check anything:
 * - duur_s missing? Estimate from distance.
 * - waarschuwingen missing? Empty list.
 * - warning without a type? Contract says: assume 'verboden'.
 */
function normalize(response) {
  if (!response?.route?.coordinates?.length) {
    throw new Error('Antwoord voldoet niet aan het contract: route.coordinates ontbreekt');
  }
  return {
    route: response.route,
    afstand_m: response.afstand_m ?? 0,
    duur_s: response.duur_s ?? Math.round((response.afstand_m ?? 0) / CONFIG.averageSpeedMs),
    waarschuwingen: (response.waarschuwingen ?? []).map(w => ({
      bij: w.bij,
      tekst: w.tekst,
      type: w.type ?? 'verboden',
    })),
    zones: response.zones ?? null,
  };
}

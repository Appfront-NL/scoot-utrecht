// ============================================================
// CONFIG — the only file you touch to hook up the real
// routing API. Everything lives here, nowhere else.
//
// ALISSA: point `apiBase` at your endpoint and the app talks
// to your backend per CONTRACT.md. That's it.
// Example:  apiBase: "https://scoot-api.yourdomain.dev"
// The app will then call:
//   GET {apiBase}/route?start=lon,lat&eind=lon,lat&voertuig=snorfiets
// Don't forget CORS (Access-Control-Allow-Origin), see CONTRACT.md.
// ============================================================

export const CONFIG = {
  // null = mock mode: the app fabricates a route locally (js/api.js)
  // so track A stays demo-able without a backend.
  apiBase: null,

  // Rider start position [lon, lat] — Oudegracht, Utrecht.
  // TODO (later, not today): replace with real geolocation via
  // navigator.geolocation, falling back to this point.
  start: [5.11815, 52.09340],

  // Map style: OpenFreeMap "positron" — free, no API key, and
  // light so the route and zones stand out.
  // Alternatives: .../styles/bright or .../styles/liberty
  mapStyle: 'https://tiles.openfreemap.org/styles/positron',

  // Zone rules as delivered by track C (see CONTRACT.md, section
  // "Regeldata"). The app always draws these, mock mode included.
  rulesUrl: 'mock/regels-utrecht.geojson',

  // Average speed for time estimates when the API omits duur_s:
  // 4.2 m/s ≈ 15 km/h (city speed for a snorfiets).
  averageSpeedMs: 4.2,
};

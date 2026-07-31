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
//
// City-specific things (center, rules dataset, destinations) do
// NOT live here — see js/cities.js. Utrecht is the hackathon
// example city; adding a city is one entry there.
// ============================================================

export const CONFIG = {
  // null = mock mode: the app fabricates a route locally (js/api.js)
  // so track A stays demo-able without a backend.
  apiBase: null,

  // Which city the demo boots into when geolocation is off,
  // denied, or points outside every known city.
  defaultCity: 'utrecht',

  // Map style: OpenFreeMap "positron" — free, no API key, and
  // light so the route and zones stand out.
  // Alternatives: .../styles/bright or .../styles/liberty
  mapStyle: 'https://tiles.openfreemap.org/styles/positron',

  // Average speed for time estimates when the API omits duur_s:
  // 4.2 m/s ≈ 15 km/h (city speed for a snorfiets).
  averageSpeedMs: 4.2,
};

// ============================================================
// CONFIG — het enige bestand dat je aanpast om de echte
// routing-API te koppelen. Alles hier, nergens anders.
//
// ALISSA: zet `apiBase` naar jouw endpoint en de app praat
// tegen jouw backend volgens CONTRACT.md. That's it.
// Voorbeeld:  apiBase: "https://scoot-api.jouwdomein.dev"
// De app roept dan aan:
//   GET {apiBase}/route?start=lon,lat&eind=lon,lat&voertuig=snorfiets
// Vergeet CORS niet (Access-Control-Allow-Origin), zie CONTRACT.md.
// ============================================================

export const CONFIG = {
  // null = mock-modus: de app verzint zelf een route (js/api.js)
  // zodat spoor A demo-baar is zonder backend.
  apiBase: null,

  // Startpositie van de rijder [lon, lat] — Oudegracht, Utrecht.
  // TODO (later, niet vandaag): vervangen door echte geolocatie
  // via navigator.geolocation, met dit punt als fallback.
  start: [5.11815, 52.09340],

  // Kaartstijl: OpenFreeMap "positron" — gratis, geen API-key,
  // en licht zodat de route en zones goed opvallen.
  // Alternatieven: .../styles/bright of .../styles/liberty
  kaartStijl: 'https://tiles.openfreemap.org/styles/positron',

  // Zone-regels zoals spoor C ze aanlevert (zie CONTRACT.md,
  // sectie "Regeldata"). De app tekent deze altijd op de kaart,
  // ook in mock-modus.
  regelsUrl: 'mock/regels-utrecht.geojson',

  // Gemiddelde snelheid voor tijdschattingen als de API geen
  // duur_s teruggeeft: 4.2 m/s ≈ 15 km/u (stadssnelheid snorfiets).
  gemiddeldeSnelheidMs: 4.2,
};

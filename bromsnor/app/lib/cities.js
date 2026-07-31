// ============================================================
// CITIES — the city registry.
//
// The app itself is city-agnostic: routing is pure coordinates
// and the zone rules arrive as GeoJSON. Everything that IS
// city-specific lives here: center, demo start point, the rules
// dataset, the welcome-screen cards and the demo destinations.
//
// Utrecht is the hackathon example, not a limitation. Adding a
// city = one entry in this file + a rules GeoJSON for it
// (same schema, see CONTRACT.md "Regeldata").
// ============================================================

import { distanceM } from './geo.js';

export const CITIES = {
  utrecht: {
    name: 'Utrecht',
    center: [5.1214, 52.0907],
    // Demo start (Oudegracht) when geolocation is off or denied.
    start: [5.11815, 52.09340],
    // Within this radius of the center you count as "in this city".
    radiusKm: 10,
    rulesUrl: '/mock/regels-utrecht.geojson',
    // street names the mock router uses for its legs (design shows
    // named maneuvers; track B can ship real ones via `straten`)
    streetNames: ['Oudegracht', 'Lange Nieuwstraat', 'Domstraat'],

    /* Welcome-screen cards — copy verbatim from the design (02/11). */
    rules: [
      { title: 'Rijd op de rijbaan',
        text: 'Op wegen waar je maximaal 50 km/u mag rijden, gebruik je met een bromscooter meestal de rijbaan. Volg altijd de verkeersborden bij uitzonderingen.' },
      { title: 'Let op wisselende rijzones',
        text: 'Op sommige locaties gaat de scooterroute over in een verplicht fiets-/bromfietspad. De app waarschuwt je voordat de rijzone verandert.' },
      { title: 'Snorscooters soms ook op de rijbaan',
        text: 'Rijd je met een blauw kenteken? In grote delen van Utrecht moet je op de rijbaan rijden. Volg de blauwe routeborden en pijlen langs de weg.' },
      { title: 'Parkeren rond Utrecht Centraal',
        text: 'Rond het stationsgebied mag je alleen parkeren in een aangewezen vak, rek of scooterstalling. Buiten deze plekken kan je scooter worden verwijderd.' },
    ],

    /* Demo destinations = the search index until track B ships
       geocoding. Per city, so search always stays local. */
    destinations: [
      // "Fontijnboot · Opgeslagen · Westerdok" komt uit het design —
      // het Westerdok is het thuisfront, wie het weet, weet het.
      { name: 'Fontijnboot',      area: 'Opgeslagen · Westerdok', point: [5.11780, 52.09900], saved: true },
      { name: 'Utrecht Centraal', area: 'Stationsgebied', point: [5.10999, 52.08949] },
      { name: 'Domplein',         area: 'Binnenstad',     point: [5.12222, 52.09062] },
      { name: 'Neude',            area: 'Binnenstad',     point: [5.11862, 52.09329] },
      { name: 'Jaarbeurs',        area: 'Croeselaan',     point: [5.10530, 52.08560] },
      { name: 'Rijnsweerd',       area: 'Oost',           point: [5.15680, 52.08650] },
      { name: 'TivoliVredenburg', area: 'Vredenburgkade', point: [5.11282, 52.09230] },
      { name: 'Wilhelminapark',   area: 'Oost',           point: [5.13450, 52.08370] },
      { name: 'Griftpark',        area: 'Noordoost',      point: [5.12660, 52.10050] },
      { name: 'Kinderboerderij',  area: 'Mini-geitjes',   point: [5.13060, 52.09850] },
      { name: 'De Cube',          area: 'Vandaag helaas gereserveerd', point: [5.11350, 52.08420] },
    ],
  },

  // amsterdam: { name: 'Amsterdam', center: [4.8952, 52.3702], ... }
};

/** The city whose radius contains `point`, or null if none does. */
export function cityFor(point) {
  for (const city of Object.values(CITIES)) {
    if (distanceM(point, city.center) / 1000 <= city.radiusKm) return city;
  }
  return null;
}

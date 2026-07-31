// ============================================================
// API — het enige bestand dat over de draad praat.
//
// haalRoute() volgt exact CONTRACT.md:
//   verzoek : GET {apiBase}/route?start=lon,lat&eind=lon,lat&voertuig=...
//   antwoord: { route: LineString, afstand_m, waarschuwingen[], ... }
//
// Staat CONFIG.apiBase op null, dan verzint mockRoute() lokaal
// een antwoord in precies dezelfde vorm. De rest van de app ziet
// geen verschil — dat is het hele idee: als Alissa's endpoint
// live gaat, verandert er buiten config.js helemaal niets.
// ============================================================

import { CONFIG } from './config.js';
import { afstandM, tussen, afstandTotLijnM } from './geo.js';

/**
 * Vraagt een route op van start naar eind.
 * @param {[number,number]} start  [lon, lat]
 * @param {[number,number]} eind   [lon, lat]
 * @param {string} voertuig        'snorfiets' | 'bromfiets'
 * @returns {Promise<{route:object, afstand_m:number, duur_s:number, waarschuwingen:Array}>}
 */
export async function haalRoute(start, eind, voertuig) {
  const antwoord = CONFIG.apiBase
    ? await echteRoute(start, eind, voertuig)
    : await mockRoute(start, eind, voertuig);
  return normaliseer(antwoord);
}

/** Laadt de zone-regels (GeoJSON van spoor C) voor op de kaart. */
export async function laadRegels() {
  const res = await fetch(CONFIG.regelsUrl);
  if (!res.ok) throw new Error(`Regels laden mislukt (${res.status})`);
  return res.json();
}

/* ---------- echte backend (spoor B) ---------- */

async function echteRoute(start, eind, voertuig) {
  const url = new URL('/route', CONFIG.apiBase);
  url.searchParams.set('start', start.join(','));
  url.searchParams.set('eind', eind.join(','));
  url.searchParams.set('voertuig', voertuig);

  const res = await fetch(url);
  if (!res.ok) {
    // Contract: fouten hebben een { fout: "..." } body.
    const body = await res.json().catch(() => ({}));
    throw new Error(body.fout || `Route-API gaf ${res.status}`);
  }
  return res.json();
}

/* ---------- mock (spoor A solo) ---------- */

/**
 * Verzint een route: een lijn met een knik van start naar eind,
 * verdicht tot korte segmenten zodat navigatie en animatie iets
 * hebben om op te lopen. Waarschuwingen worden afgeleid uit de
 * échte zone-regels: komt de lijn dicht bij een verboden of
 * rijbaan-regel, dan krijg je dezelfde waarschuwing die de echte
 * backend straks ook zou geven.
 */
async function mockRoute(start, eind, voertuig) {
  // Knikpunt: eerst grofweg oost-west, dan noord-zuid. Geen echte
  // routering — dat is spoor B — maar het oogt als een straatpatroon.
  const knik = [eind[0], start[1]];
  const coords = [
    ...verdicht(start, knik, 6),
    ...verdicht(knik, eind, 6).slice(1),
  ];

  let afstand = 0;
  for (let i = 1; i < coords.length; i++) afstand += afstandM(coords[i - 1], coords[i]);

  // Waarschuwingen uit de regeldata, net als het contract belooft.
  const waarschuwingen = [];
  try {
    const regels = await laadRegels();
    for (const f of regels.features) {
      if (f.properties.voertuig !== voertuig) continue;
      if (!['verboden', 'rijbaan'].includes(f.properties.regime)) continue;
      const zoneCoords = f.geometry.type === 'Polygon'
        ? f.geometry.coordinates[0]
        : f.geometry.coordinates;
      // "dichtbij" = binnen 130 m van de route
      let dichtstbij = null, kleinste = Infinity;
      for (const p of coords) {
        const d = afstandTotLijnM(p, zoneCoords);
        if (d < kleinste) { kleinste = d; dichtstbij = p; }
      }
      if (kleinste < 130) {
        waarschuwingen.push({
          bij: dichtstbij,
          tekst: f.properties.regime === 'verboden'
            ? `Verboden zone: ${f.properties.naam}`
            : `Naar de rijbaan (helmplicht): ${f.properties.naam}`,
          type: f.properties.regime,
        });
      }
    }
  } catch {
    // Geen regels kunnen laden is geen reden om geen route te tonen.
  }

  return {
    route: { type: 'LineString', coordinates: coords },
    afstand_m: Math.round(afstand),
    waarschuwingen,
  };
}

/** Deelt het stuk a→b op in `n` segmenten met een klein slingertje. */
function verdicht(a, b, n) {
  const punten = [];
  for (let i = 0; i <= n; i++) {
    const p = tussen(a, b, i / n);
    if (i > 0 && i < n) {
      // heel lichte jitter zodat de lijn niet steriel-recht oogt
      p[0] += (Math.sin(i * 2.7) * 0.00018);
      p[1] += (Math.cos(i * 1.9) * 0.00012);
    }
    punten.push(p);
  }
  return punten;
}

/* ---------- normalisatie ---------- */

/**
 * Vangt de optionele velden uit het contract af, zodat de rest
 * van de app nooit hoeft te checken of iets bestaat:
 * - duur_s ontbreekt? Schatten op basis van afstand.
 * - waarschuwingen ontbreekt? Lege lijst.
 * - waarschuwing zonder type? Contract zegt: ga uit van 'verboden'.
 */
function normaliseer(antwoord) {
  if (!antwoord?.route?.coordinates?.length) {
    throw new Error('Antwoord voldoet niet aan het contract: route.coordinates ontbreekt');
  }
  return {
    route: antwoord.route,
    afstand_m: antwoord.afstand_m ?? 0,
    duur_s: antwoord.duur_s ?? Math.round((antwoord.afstand_m ?? 0) / CONFIG.gemiddeldeSnelheidMs),
    waarschuwingen: (antwoord.waarschuwingen ?? []).map(w => ({
      bij: w.bij,
      tekst: w.tekst,
      type: w.type ?? 'verboden',
    })),
    zones: antwoord.zones ?? null,
  };
}

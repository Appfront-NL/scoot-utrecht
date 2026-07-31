// ============================================================
// GEO — kleine, pure rekenhulpjes voor WGS84-coördinaten.
// Overal in de app is een punt een array [lon, lat],
// dezelfde volgorde als GeoJSON en als het API-contract.
// Geen dependencies; dit is alles wat we van turf nodig hadden.
// ============================================================

const R_AARDE = 6371000; // meters

/** Afstand in meters tussen twee punten (haversine). */
export function afstandM(a, b) {
  const dLat = rad(b[1] - a[1]);
  const dLon = rad(b[0] - a[0]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * R_AARDE * Math.asin(Math.sqrt(s));
}

/** Kompaskoers in graden (0 = noord, 90 = oost) van a naar b. */
export function koers(a, b) {
  const y = Math.sin(rad(b[0] - a[0])) * Math.cos(rad(b[1]));
  const x =
    Math.cos(rad(a[1])) * Math.sin(rad(b[1])) -
    Math.sin(rad(a[1])) * Math.cos(rad(b[1])) * Math.cos(rad(b[0] - a[0]));
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

/** Lineaire interpolatie tussen twee punten (t van 0 tot 1). */
export function tussen(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/**
 * Maakt van een lijn een "liniaal": cumulatieve afstand per punt.
 * Daarmee kun je goedkoop vragen: waar ben ik na X meter?
 */
export function maakLiniaal(coords) {
  const cum = [0];
  for (let i = 1; i < coords.length; i++) {
    cum.push(cum[i - 1] + afstandM(coords[i - 1], coords[i]));
  }
  return { coords, cum, totaal: cum[cum.length - 1] };
}

/** Punt + rijrichting op `meters` afstand langs de liniaal. */
export function puntOpLiniaal(liniaal, meters) {
  const { coords, cum, totaal } = liniaal;
  const d = Math.max(0, Math.min(totaal, meters));
  let i = 1;
  while (i < cum.length - 1 && cum[i] < d) i++;
  const segment = cum[i] - cum[i - 1] || 1;
  const t = (d - cum[i - 1]) / segment;
  return {
    punt: tussen(coords[i - 1], coords[i], t),
    richting: koers(coords[i - 1], coords[i]),
    segmentIndex: i,
  };
}

/** Kortste afstand (meters) van een punt tot een lijn, benaderd per vertex. */
export function afstandTotLijnM(punt, coords) {
  let kleinste = Infinity;
  for (const c of coords) kleinste = Math.min(kleinste, afstandM(punt, c));
  return kleinste;
}

function rad(d) { return (d * Math.PI) / 180; }
function deg(r) { return (r * 180) / Math.PI; }

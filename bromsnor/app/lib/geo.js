// ============================================================
// GEO — small, pure helpers for WGS84 coordinates.
// Throughout the app a point is an array [lon, lat], the same
// order as GeoJSON and the API contract.
// No dependencies; this is all we needed from turf.
// ============================================================

const EARTH_R = 6371000; // meters

/** Distance in meters between two points (haversine). */
export function distanceM(a, b) {
  const dLat = rad(b[1] - a[1]);
  const dLon = rad(b[0] - a[0]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(s));
}

/** Compass bearing in degrees (0 = north, 90 = east) from a to b. */
export function bearingDeg(a, b) {
  const y = Math.sin(rad(b[0] - a[0])) * Math.cos(rad(b[1]));
  const x =
    Math.cos(rad(a[1])) * Math.sin(rad(b[1])) -
    Math.sin(rad(a[1])) * Math.cos(rad(b[1])) * Math.cos(rad(b[0] - a[0]));
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

/** Linear interpolation between two points (t from 0 to 1). */
export function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/**
 * Turns a line into a "ruler": cumulative distance per vertex.
 * That makes "where am I after X meters?" a cheap question.
 */
export function makeRuler(coords) {
  const cum = [0];
  for (let i = 1; i < coords.length; i++) {
    cum.push(cum[i - 1] + distanceM(coords[i - 1], coords[i]));
  }
  return { coords, cum, total: cum[cum.length - 1] };
}

/** Point + travel heading at `meters` along the ruler. */
export function pointAlong(ruler, meters) {
  const { coords, cum, total } = ruler;
  const d = Math.max(0, Math.min(total, meters));
  let i = 1;
  while (i < cum.length - 1 && cum[i] < d) i++;
  const segment = cum[i] - cum[i - 1] || 1;
  const t = (d - cum[i - 1]) / segment;
  return {
    point: lerp(coords[i - 1], coords[i], t),
    heading: bearingDeg(coords[i - 1], coords[i]),
    segmentIndex: i,
  };
}

/** Shortest distance (meters) from a point to a line, vertex-approximated. */
export function distanceToLineM(point, coords) {
  let best = Infinity;
  for (const c of coords) best = Math.min(best, distanceM(point, c));
  return best;
}

function rad(d) { return (d * Math.PI) / 180; }
function deg(r) { return (r * 180) / Math.PI; }

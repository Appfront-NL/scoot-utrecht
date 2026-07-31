// ============================================================
// ROUTE ENGINE — bridge between track B's routing (app/routes/
// map.tsx + app/utils/load-bounding-boxes.ts) and the SCOOT
// frontend, in the CONTRACT.md response shape.
//
// This file deliberately does NOT touch track B's code: it
// imports her zone data as-is and mirrors her TomTom calls
// 1:1 (same endpoints, same parameters, same key constant).
// If map.tsx changes how it fetches routes, update the marked
// section below to match — nothing else needs to move.
// ============================================================

import { loadForbiddenZonesBoundingBoxes } from "~/utils/load-bounding-boxes";

// Same key map.tsx uses; kept as a mirror so this file works
// even before track B exports anything itself.
const TOMTOM_KEY = "dwpTmdTaUwbmhSEGpbxbrT0L0E71O9aX";

/** Track B's TomTom base map (same tiles/key as map.tsx), as a
    MapLibre raster style so the SCOOT overlays draw on top of
    the exact same map she uses. */
export function tomtomRasterStyle() {
  return {
    version: 8 as const,
    sources: {
      tomtom: {
        type: "raster" as const,
        tiles: ["a", "b", "c", "d"].map(
          (sub) => `https://${sub}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`,
        ),
        tileSize: 256,
        attribution: "© TomTom",
      },
    },
    layers: [{ id: "tomtom", type: "raster" as const, source: "tomtom" }],
  };
}

/** Contract shapes (CONTRACT.md — field names stay Dutch). */
export interface RouteWarning {
  bij: [number, number];
  tekst: string;
  type: string;
}
export interface RouteResult {
  route: { type: "LineString"; coordinates: [number, number][] };
  afstand_m: number;
  duur_s?: number;
  waarschuwingen: RouteWarning[];
  zones?: GeoJSON.FeatureCollection;
}

/* ------------------------------------------------------------
   Zones: track B's bounding boxes, unchanged, re-expressed as
   the GeoJSON regeldata schema the SCOOT map already renders.
   ------------------------------------------------------------ */

type ZoneEntry = { text: string; bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number }[] };

/** Track B's zones, flattened to one list (her 2026-07-31 shape:
    an array of groups, each with a `warning` list). */
function zoneData(): ZoneEntry[] {
  return loadForbiddenZonesBoundingBoxes().flatMap((group) => group.warning);
}

export function zonesAsGeoJSON(): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  zoneData().forEach((warning, i) => {
    warning.bbox.forEach((b, j) => {
      features.push({
        type: "Feature",
        properties: {
          id: `spoorB-${i}-${j}`,
          naam: warning.text.replace(/^Let op! /, "").replace(/\.$/, ""),
          voertuig: "snorfiets",
          regime: "verboden",
          tijdvenster: null,
          zekerheid: "hard",
          bron: "spoor B — load-bounding-boxes.ts",
        },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [b.minLng, b.minLat],
            [b.maxLng, b.minLat],
            [b.maxLng, b.maxLat],
            [b.minLng, b.maxLat],
            [b.minLng, b.minLat],
          ]],
        },
      });
    });
  });
  return { type: "FeatureCollection", features };
}

/* ------------------------------------------------------------
   Search — MIRROR OF map.tsx: parseLatLng + TomTom geocode,
   same endpoint and parameters as her resolveLocation().
   Accepts "lat, lng" or a free-text address; returns [lon, lat]
   or null when nothing is found.
   ------------------------------------------------------------ */

export function parseLatLng(value: string): [number, number] | null {
  const [latStr, lngStr] = value.split(",").map((s) => s.trim());
  const lat = Number(latStr);
  const lng = Number(lngStr);
  if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }
  return [lng, lat];
}

export async function geocodeAddress(query: string): Promise<[number, number] | null> {
  const encodedQuery = encodeURIComponent(query.trim());
  if (!encodedQuery) return null;
  const url = `https://api.tomtom.com/search/2/geocode/${encodedQuery}.json?key=${TOMTOM_KEY}&limit=1`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  const position = data?.results?.[0]?.position;
  if (!position) return null;
  return [position.lon, position.lat];
}

/** Live search suggestions while typing — TomTom fuzzy search
    (typeahead), same API family and key as her geocodeAddress. */
export async function searchSuggestions(
  query: string,
): Promise<{ name: string; area: string; point: [number, number] }[]> {
  const q = encodeURIComponent(query.trim());
  if (!q) return [];
  const url = `https://api.tomtom.com/search/2/search/${q}.json?key=${TOMTOM_KEY}&limit=5&typeahead=true&countrySet=NL`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  const seen = new Set<string>();
  const out: { name: string; area: string; point: [number, number] }[] = [];
  for (const res of data?.results ?? []) {
    if (!res?.position) continue;
    const name = res.poi?.name ?? res.address?.freeformAddress ?? "Onbekende locatie";
    if (seen.has(name)) continue;
    seen.add(name);
    out.push({
      name,
      area: res.address?.municipality ?? res.address?.country ?? "",
      point: [res.position.lon, res.position.lat],
    });
  }
  return out;
}

export async function resolveLocation(value: string): Promise<[number, number] | null> {
  return parseLatLng(value) ?? (await geocodeAddress(value));
}

/* ------------------------------------------------------------
   Routing — MIRROR OF map.tsx. Keep in sync with drawRoute():
   same calculateRoute URL, same travelMode, same points path.
   ------------------------------------------------------------ */

export async function getRoute(
  start: [number, number],
  eind: [number, number],
  _voertuig: string = "snorfiets",
): Promise<RouteResult> {
  const url =
    `https://api.tomtom.com/routing/1/calculateRoute/` +
    `${start[1]},${start[0]}:${eind[1]},${eind[0]}/json` +
    `?key=${TOMTOM_KEY}&travelMode=car`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch route");

  const data = await response.json();
  const points: { latitude: number; longitude: number }[] =
    data?.routes?.[0]?.legs?.flatMap((leg: any) => leg.points) ?? [];
  if (!points.length) throw new Error("No route found.");

  const coordinates: [number, number][] = points.map((p) => [p.longitude, p.latitude]);
  const summary = data?.routes?.[0]?.summary ?? {};

  return {
    route: { type: "LineString", coordinates },
    afstand_m: summary.lengthInMeters ?? lineLengthM(coordinates),
    duur_s: summary.travelTimeInSeconds,
    waarschuwingen: findWarnings(coordinates),
    zones: zonesAsGeoJSON(),
  };
}

/* ------------------------------------------------------------
   Warnings: first route point inside each of track B's boxes.
   (map.tsx draws the boxes; the crossing check lives here.)
   ------------------------------------------------------------ */

function findWarnings(coordinates: [number, number][]): RouteWarning[] {
  const warnings: RouteWarning[] = [];
  for (const zone of zoneData()) {
    for (const b of zone.bbox) {
      const hit = coordinates.find(
        ([lon, lat]) =>
          lat >= b.minLat && lat <= b.maxLat && lon >= b.minLng && lon <= b.maxLng,
      );
      if (hit) {
        warnings.push({ bij: hit, tekst: zone.text, type: "verboden" });
        break; // one warning per zone entry
      }
    }
  }
  return warnings;
}

/** Fallback length when TomTom's summary is missing: haversine sum. */
function lineLengthM(coordinates: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    total += haversineM(coordinates[i - 1], coordinates[i]);
  }
  return Math.round(total);
}
function haversineM([lon1, lat1]: [number, number], [lon2, lat2]: [number, number]): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

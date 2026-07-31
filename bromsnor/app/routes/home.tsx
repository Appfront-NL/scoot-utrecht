import "leaflet/dist/leaflet.css";
import { MapPin, Scooter } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import MapControls from "~/components/map-controls";
import {
  type IWarningBoundingBox,
  loadForbiddenZonesBoundingBoxes,
} from "~/utils/load-bounding-boxes";

const TOMTOM_KEY = "dwpTmdTaUwbmhSEGpbxbrT0L0E71O9aX";

export default function Map() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);

  const [routeDrawn, setRouteDrawn] = useState(false);
  const [directDistanceInKm, setDirectDistanceInKm] = useState<number | null>(
    null,
  );

  const forbiddenZonesBoundingBoxes: IWarningBoundingBox =
    loadForbiddenZonesBoundingBoxes();

  const [from, setFrom] = useState("Westerdoksdijk 599, 1013 BX Amsterdam");
  const [to, setTo] = useState("");
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || !TOMTOM_KEY) return;

      const L = (await import("leaflet")).default;
      leafletRef.current = L;

      mapInstanceRef.current = L.map(mapRef.current).setView(
        [52.0907, 5.1214],
        13,
      );

      L.tileLayer(
        `https://{s}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`,
        {
          subdomains: ["a", "b", "c", "d"],
          maxZoom: 20,
          tileSize: 256,
        },
      ).addTo(mapInstanceRef.current);

      forbiddenZonesBoundingBoxes.warnings.forEach((warning) => {
        warning.bbox.forEach((zone) => {
          L.rectangle(
            [
              [zone.minLat, zone.minLng],
              [zone.maxLat, zone.maxLng],
            ],
            {
              color: "#DC2626",
              weight: 2,
              fillColor: "#DC2626",
              fillOpacity: 0.2,
            },
          ).addTo(mapInstanceRef.current);
        });
      });
    };

    void initMap();

    return () => {
      if (mapInstanceRef.current) mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      startMarkerRef.current = null;
      endMarkerRef.current = null;
    };
  }, []);

  const parseLatLng = (value: string) => {
    const [latStr, lngStr] = value.split(",").map((s) => s.trim());
    const lat = Number(latStr);
    const lng = Number(lngStr);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return null;
    }

    return { lat, lng };
  };

  const geocodeAddress = async (query: string) => {
    const encodedQuery = encodeURIComponent(query.trim());
    if (!encodedQuery) return null;

    const url = `https://api.tomtom.com/search/2/geocode/${encodedQuery}.json?key=${TOMTOM_KEY}&limit=1`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const position = data?.results?.[0]?.position;

    if (!position) return null;

    return { lat: position.lat, lng: position.lon };
  };

  const resolveLocation = async (value: string) => {
    const parsed = parseLatLng(value);
    if (parsed) return parsed;
    return geocodeAddress(value);
  };

  const getDistanceInKm = (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
  ) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const earthRadius = 6371;
    const dLat = toRad(end.lat - start.lat);
    const dLng = toRad(end.lng - start.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(start.lat)) *
      Math.cos(toRad(end.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  };

  const drawRoute = async () => {
    setRouteError(null);
    const mapInstance = mapInstanceRef.current;
    const L = leafletRef.current;

    if (!mapInstance || !L) {
      setRouteError("Map is still loading.");
      return;
    }

    const [start, end] = await Promise.all([
      resolveLocation(from),
      resolveLocation(to),
    ]);

    if (!start || !end) {
      setRouteError(
        "Enter valid coordinates (lat,lng) or searchable addresses.",
      );
      return;
    }

    const directDistanceInKm = getDistanceInKm(start, end);
    if (directDistanceInKm < 0.025) {
      setRouteError("Start and end are too close together.");
      return;
    }
    setDirectDistanceInKm(directDistanceInKm);

    if (startMarkerRef.current) {
      mapInstance.removeLayer(startMarkerRef.current);
    }

    if (endMarkerRef.current) {
      mapInstance.removeLayer(endMarkerRef.current);
    }

    const createLucideMarkerIcon = (icon: React.ReactNode) =>
      L.divIcon({
        className: "",
        html: renderToStaticMarkup(<div>{icon}</div>),
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      });

    startMarkerRef.current = L.marker([start.lat, start.lng])
      .setIcon(
        createLucideMarkerIcon(
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-[#3B82F6]">
            <MapPin color="#3B82F6" size={20} strokeWidth={1.75} />,
          </div>,
        ),
      )
      .addTo(mapInstance)
      .bindPopup("Start");

    endMarkerRef.current = L.marker([end.lat, end.lng])
      .setIcon(
        createLucideMarkerIcon(
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#3B82F6] border border-white">
            <Scooter color="white" size={20} strokeWidth={1.75} />,{" "}
          </div>,
        ),
      )
      .addTo(mapInstance)
      .bindPopup("End");

    const url = `https://api.tomtom.com/routing/1/calculateRoute/${start.lat},${start.lng}:${end.lat},${end.lng}/json?key=${TOMTOM_KEY}&travelMode=${"car"}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch route");

      const data = await response.json();
      const points =
        data?.routes?.[0]?.legs?.flatMap((leg: any) => leg.points) ?? [];

      if (!points.length) {
        setRouteError("No route found.");
        return;
      }

      const latLngs = points.map((p: any) => [p.latitude, p.longitude]);

      if (routeLayerRef.current) {
        mapInstance.removeLayer(routeLayerRef.current);
      }

      routeLayerRef.current = L.polyline(latLngs, {
        color: "#1E40AF",
        weight: 5,
      }).addTo(mapInstance);

      mapInstance.fitBounds(routeLayerRef.current.getBounds(), {
        padding: [24, 24],
      });
      setRouteDrawn(true);
    } catch {
      setRouteError("Could not draw route.");
      setRouteDrawn(false);
    }
  };

  if (!TOMTOM_KEY) {
    return (
      <div className="flex h-100 w-full items-center justify-center rounded-lg border border-dashed text-sm text-gray-500">
        Set NEXT_PUBLIC_TOMTOM_API_KEY to load the TomTom map.
      </div>
    );
  }

  const now = new Date();
  const timeLabel = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

  /* ---------- render ---------- */
  return (
    <div className="h-screen w-screen">
      <div className="h-full w-full relative">
        <div ref={mapRef} className="h-full w-full rounded-lg" />
        <MapControls
          from={from}
          to={to}
          setTo={setTo}
          setFrom={setFrom}
          drawRoute={drawRoute}
          routeError={routeError}
          routeDrawn={routeDrawn}
          setRouteDrawn={setRouteDrawn}
          distance={directDistanceInKm}
        />
      </div>
    </div>
  );
}

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
const DIRECTIONS_API_URL = "/api/directions";

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
  const [directions, setDirections] = useState<string[]>([]);
  const [arrivalTime, setArrivalTime] = useState<string | null>(null);
  const [travelTimeInMinutes, setTravelTimeInMinutes] = useState<number | null>(
    null,
  );

  const forbiddenZonesBoundingBoxes: IWarningBoundingBox =
    loadForbiddenZonesBoundingBoxes();

  const [from, setFrom] = useState("Westerdoksdijk 599, 1013 BX Amsterdam");
  const [to, setTo] = useState("");
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || !TOMTOM_KEY || mapInstanceRef.current) return;

      try {
        const L = (await import("leaflet")).default;
        leafletRef.current = L;

        const mapContainer = mapRef.current as HTMLDivElement & {
          _leaflet_id?: number;
        };

        if (mapContainer._leaflet_id) {
          delete mapContainer._leaflet_id;
        }

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

        setTimeout(() => {
          mapInstanceRef.current?.invalidateSize();
        }, 0);
      } catch {
        setRouteError("Could not initialize map.");
      }
    };

    const setStartToCurrentLocation = () => {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const currentLocation = `${coords.latitude}, ${coords.longitude}`;

          try {
            const url = `https://api.tomtom.com/search/2/reverseGeocode/${coords.latitude},${coords.longitude}.json?key=${TOMTOM_KEY}`;
            const response = await fetch(url);
            const data = response.ok ? await response.json() : null;
            const address = data?.addresses?.[0]?.address?.freeformAddress;
            setFrom(address || currentLocation);
          } catch {
            setFrom(currentLocation);
          }

          mapInstanceRef.current?.setView(
            [coords.latitude, coords.longitude],
            15,
          );
        },
        () => {
          // Ignore geolocation errors and keep default start value.
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
        },
      );
    };

    void initMap();
    setStartToCurrentLocation();

    const onResize = () => mapInstanceRef.current?.invalidateSize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (mapInstanceRef.current) mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      startMarkerRef.current = null;
      endMarkerRef.current = null;
      routeLayerRef.current = null;
      leafletRef.current = null;
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

  const fetchDirectionsFromNewApi = async (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
  ) => {
    try {
      const params = new URLSearchParams({
        startLat: String(start.lat),
        startLng: String(start.lng),
        endLat: String(end.lat),
        endLng: String(end.lng),
      });

      const response = await fetch(
        `${DIRECTIONS_API_URL}?${params.toString()}`,
      );
      if (!response.ok) return [];

      const data = await response.json();

      if (Array.isArray(data?.directions)) {
        return data.directions.filter((message: unknown) =>
          Boolean(typeof message === "string" && message),
        ) as string[];
      }

      if (Array.isArray(data?.instructions)) {
        return data.instructions
          .map((instruction: any) => instruction?.message)
          .filter((message: string | undefined) => Boolean(message));
      }

      return [];
    } catch {
      return [];
    }
  };

  const drawRoute = async () => {
    setRouteError(null);
    setDirections([]);
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
      setRouteDrawn(false);
      return;
    }

    const directDistanceInKm = getDistanceInKm(start, end);
    if (directDistanceInKm < 0.025) {
      setRouteError("Start and end are too close together.");
      setRouteDrawn(false);
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

      console.log("Route points:", points);
      console.log("Route data:", data);

      setArrivalTime(data?.routes?.[0]?.summary?.arrivalTime ?? null);
      setTravelTimeInMinutes(
        data?.routes?.[0]?.summary?.travelTimeInSeconds
          ? Math.round(data.routes[0].summary.travelTimeInSeconds / 60)
          : null,
      );

      if (!points.length) {
        setRouteError("No route found.");
        setRouteDrawn(false);
        return;
      }

      const fallbackInstructions =
        data?.routes?.[0]?.guidance?.instructions ?? [];
      const fallbackDirections = fallbackInstructions
        .map((instruction: any) => instruction?.message)
        .filter((message: string | undefined) => Boolean(message));

      const parsedDirections = await fetchDirectionsFromNewApi(start, end);

      setDirections(
        parsedDirections.length ? parsedDirections : fallbackDirections,
      );
      console.log(
        "Directions:",
        parsedDirections.length ? parsedDirections : fallbackDirections,
      );

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
      setDirections([]);
    }
  };

  if (!TOMTOM_KEY) {
    return (
      <div className="flex h-100 w-full items-center justify-center rounded-lg border border-dashed text-sm text-gray-500">
        Set NEXT_PUBLIC_TOMTOM_API_KEY to load the TomTom map.
      </div>
    );
  }

  return (
    <div className="h-screen w-screen">
      <div className="h-full w-full relative">
        <div ref={mapRef} className="h-full w-full rounded-lg" />
        {routeDrawn && directions.length > 0 && (
          <div className="absolute right-4 top-4 z-1000 max-h-[40vh] w-[min(90vw,360px)] overflow-y-auto rounded-lg bg-white/95 p-3 shadow-lg">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">
              Directions
            </h3>
            <ol className="list-decimal space-y-1 pl-4 text-xs text-gray-700">
              {directions.map((direction, index) => (
                <li key={`${index}-${direction}`}>{direction}</li>
              ))}
            </ol>
          </div>
        )}
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
          arrivalTime={arrivalTime}
          travelTimeInMinutes={travelTimeInMinutes}
        />
      </div>
    </div>
  );
}

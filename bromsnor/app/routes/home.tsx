import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { MapControls } from "~/components/map-controls";

const TOMTOM_KEY = "dwpTmdTaUwbmhSEGpbxbrT0L0E71O9aX";

export default function Map() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mapInstance: any;

    const initMap = async () => {
      if (!mapRef.current || !TOMTOM_KEY) return;

      const L = (await import("leaflet")).default;

      mapInstance = L.map(mapRef.current).setView([52.0907, 5.1214], 13);

      L.tileLayer(
        `https://{s}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`,
        {
          subdomains: ["a", "b", "c", "d"],
          maxZoom: 20,
          attribution:
            '© <a href="https://www.tomtom.com">TomTom</a> | © OpenStreetMap contributors',
        },
      ).addTo(mapInstance);
    };

    void initMap();

    return () => {
      if (mapInstance) mapInstance.remove();
    };
  }, []);

  if (!TOMTOM_KEY) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-dashed text-sm text-gray-500">
        Set NEXT_PUBLIC_TOMTOM_API_KEY to load the TomTom map.
      </div>
    );
  }

  return (
    <div className="h-screen w-screen p-2">
      <div className="h-120 w-full relative rounded-lg border-2 border-violet-400">
        <div ref={mapRef} className="h-full w-full rounded-lg" />
        <MapControls />
      </div>
    </div>
  );
}

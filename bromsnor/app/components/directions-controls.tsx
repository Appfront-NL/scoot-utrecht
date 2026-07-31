import { MessageSquareWarning, Signpost } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { JSX } from "react/jsx-runtime";
import type { IWarningBoundingBox } from "~/utils/load-bounding-boxes";

type DirectionsControlsProps = {
    from: string;
    to: string;
    routeDrawn: boolean;
    routeCoordinates: [number, number][];
    forbiddenZonesBoundingBoxes?: IWarningBoundingBox[];
};

export function DirectionsControls({
    from,
    to,
    routeDrawn,
    routeCoordinates,
    forbiddenZonesBoundingBoxes,
}: DirectionsControlsProps): JSX.Element | null {
    void from;
    void to;

    const [currentLocation, setCurrentLocation] = useState<
        [number, number] | null
    >(null);

    // Dismissable: hidden until the next route is drawn.
    const [dismissed, setDismissed] = useState(false);
    useEffect(() => {
        setDismissed(false);
    }, [routeDrawn, routeCoordinates]);

    useEffect(() => {
        if (!navigator.geolocation) {
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setCurrentLocation([
                    position.coords.latitude,
                    position.coords.longitude,
                ]);
            },
            () => {
                // Ignore location errors and keep last known location.
            },
            {
                enableHighAccuracy: true,
                maximumAge: 1000,
                timeout: 10000,
            },
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    const instructions = useMemo(() => {
        if (!routeDrawn || routeCoordinates.length === 0) {
            return [] as string[];
        }

        const toRad = (deg: number): number => (deg * Math.PI) / 180;
        const toDeg = (rad: number): number => (rad * 180) / Math.PI;
        const normalizeAngle = (angle: number): number => {
            let value = angle;
            while (value <= -180) value += 360;
            while (value > 180) value -= 360;
            return value;
        };

        const haversineDistanceInMeters = (
            a: [number, number],
            b: [number, number],
        ): number => {
            const [lat1, lng1] = a;
            const [lat2, lng2] = b;
            const dLat = toRad(lat2 - lat1);
            const dLng = toRad(lng2 - lng1);
            const rLat1 = toRad(lat1);
            const rLat2 = toRad(lat2);

            const h =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(rLat1) *
                Math.cos(rLat2) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);

            return 6371000 * (2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
        };

        const isPointNearOrInsideBox = (
            point: [number, number],
            box: {
                minLat: number;
                minLng: number;
                maxLat: number;
                maxLng: number;
            },
            nearThresholdMeters = 150,
        ): boolean => {
            const [lat, lng] = point;
            const minLat = Math.min(box.minLat, box.maxLat);
            const maxLat = Math.max(box.minLat, box.maxLat);
            const minLng = Math.min(box.minLng, box.maxLng);
            const maxLng = Math.max(box.minLng, box.maxLng);

            const inside =
                lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
            if (inside) return true;

            const clampedLat = Math.max(minLat, Math.min(lat, maxLat));
            const clampedLng = Math.max(minLng, Math.min(lng, maxLng));
            const distance = haversineDistanceInMeters(point, [
                clampedLat,
                clampedLng,
            ]);

            return distance <= nearThresholdMeters;
        };

        const points = currentLocation
            ? [currentLocation, ...routeCoordinates]
            : [...routeCoordinates];

        if (points.length < 2) {
            return [] as string[];
        }

        const bearing = (a: [number, number], b: [number, number]): number => {
            const [lat1, lng1] = a;
            const [lat2, lng2] = b;
            const phi1 = toRad(lat1);
            const phi2 = toRad(lat2);
            const dLambda = toRad(lng2 - lng1);

            const y = Math.sin(dLambda) * Math.cos(phi2);
            const x =
                Math.cos(phi1) * Math.sin(phi2) -
                Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);

            return (toDeg(Math.atan2(y, x)) + 360) % 360;
        };

        const steps: string[] = [];
        if (currentLocation) {
            steps.push("Start from your current location");
        }

        const forbiddenBoxes =
            forbiddenZonesBoundingBoxes?.flatMap((item) =>
                item.warning.flatMap((w) => w.bbox),
            ) ?? [];

        if (forbiddenBoxes.length > 0) {
            const isNearNow = currentLocation
                ? forbiddenBoxes.some((box) =>
                    isPointNearOrInsideBox(currentLocation, {
                        minLat: box.minLat,
                        minLng: box.minLng,
                        maxLat: box.maxLat,
                        maxLng: box.maxLng,
                    }),
                )
                : false;

            const routeNearForbidden = routeCoordinates.some((point) =>
                forbiddenBoxes.some((box) =>
                    isPointNearOrInsideBox(point, {
                        minLat: box.minLat,
                        minLng: box.minLng,
                        maxLat: box.maxLat,
                        maxLng: box.maxLng,
                    }),
                ),
            );

            if (isNearNow || routeNearForbidden) {
                steps.push("Warning: You are near or entering a forbidden zone.");
            }
        }

        if (points.length === 2) {
            steps.push("Go straight to destination");
            return steps;
        }

        let previousBearing = bearing(points[0], points[1]);
        steps.push("Go straight");

        for (let i = 1; i < points.length - 1; i += 1) {
            const nextBearing = bearing(points[i], points[i + 1]);
            const turn = normalizeAngle(nextBearing - previousBearing);

            if (turn > 150 || turn < -150) {
                steps.push("Make a U-turn");
            } else if (turn > 20) {
                steps.push("Turn right");
            } else if (turn < -20) {
                steps.push("Turn left");
            } else {
                steps.push("Continue straight");
            }

            previousBearing = nextBearing;
        }

        steps.push("Arrive at destination");
        return steps;
    }, [
        currentLocation,
        forbiddenZonesBoundingBoxes,
        routeCoordinates,
        routeDrawn,
    ]);

    const closestInstruction = instructions[0] ?? null;

    if (!routeDrawn || routeCoordinates.length === 0 || dismissed) {
        return null;
    }

    const isWarning = instructions[0]?.includes("Warning") ?? false;

    return (
        <div
            className="fixed left-1/2 z-30 w-[min(430px,calc(100vw-24px))] -translate-x-1/2 overflow-hidden rounded-[24px] bg-white shadow-[0_10px_34px_rgba(15,23,42,0.16)]"
            style={{ top: 72, fontFamily: "'DM Sans', sans-serif" }}
            role="status"
            aria-live="polite"
        >
            <button
                type="button"
                aria-label="Sluiten"
                onClick={() => setDismissed(true)}
                className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-[#64748b] hover:bg-[#f1f5f9]"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
            <div className="grid grid-cols-[auto_1fr] items-start gap-3 p-4 pr-11">
                {isWarning ? (
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fef2f2] text-[#ef4444]">
                        <MessageSquareWarning size={22} />
                    </span>
                ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f5f3ff] text-[#6d3ae6]">
                        <Signpost size={22} />
                    </span>
                )}
                <div className="min-w-0">
                    <h3 className="text-[15.5px] font-semibold leading-snug text-[#0f172a]">
                        {closestInstruction}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#64748b]">
                        {instructions.length > 1 &&
                            instructions[1] &&
                            instructions[1].includes("Warning")
                            ? instructions[1]
                            : "Volgende: " + (instructions[1] ?? "geen verdere stappen")}
                    </p>
                </div>
            </div>
        </div>
    );
}

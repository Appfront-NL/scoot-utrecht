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
                steps.push(
                    "Warning: Forbidden zone nearby on your route. Reroute to avoid restricted area.",
                );
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

    if (!routeDrawn || routeCoordinates.length === 0) {
        return null;
    }

    const isWarning = instructions[0]?.includes("Warning") ?? false;

    return (
        <div className="absolute right-4 top-[10%] z-1000 max-h-[50vh] w-[min(90vw,360px)] overflow-y-auto rounded-lg bg-white border border-[#E2E8F0] p-4">
            <div className="grid grid-cols-[auto_1fr] items-start gap-3">
                {isWarning ? (
                    <MessageSquareWarning
                        className="mb-2 text-[#F43F5E] bg-[#FEF2F2] p-2 rounded-xl"
                        size={40}
                    />
                ) : (
                    <Signpost
                        className="mb-2  text-[#7C3AED] bg-[#F5F3FF] p-2 rounded-xl"
                        size={40}
                    />
                )}
                <div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-800">
                        {closestInstruction ? <span>{closestInstruction}</span> : null}
                    </h3>
                    <span>
                        {instructions.length > 1 &&
                            instructions[1] &&
                            instructions[1].length > 0 &&
                            instructions[1].includes("Warning")
                            ? `${instructions[1]}`
                            : "Next step: " + (instructions[1] ?? "No further instructions")}
                    </span>
                </div>
            </div>
        </div>
    );
}

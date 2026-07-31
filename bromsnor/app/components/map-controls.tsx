import { ArrowRight, MapPinHouse, MapPinSearch, X } from "lucide-react";

interface MapControlsProps {
    from: string;
    to: string;
    setFrom: (value: string) => void;
    setTo: (value: string) => void;
    drawRoute: () => Promise<void>;
    routeDrawn: React.ReactNode;
    setRouteDrawn: (value: boolean) => void;
    routeError: string | null;
    distance: number | null;
    arrivalTime: string | null;
    travelTimeInMinutes: number | null;
    setShowDirectionsControls: (value: boolean) => void;
    showDirectionsControls: boolean;
}

function MapControls({
    from,
    to,
    setFrom,
    setTo,
    drawRoute,
    routeDrawn,
    setRouteDrawn,
    routeError,
    distance,
    arrivalTime,
    travelTimeInMinutes,
    setShowDirectionsControls,
    showDirectionsControls,
}: MapControlsProps) {
    const formatTimeHHmm = (value: string) => {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleTimeString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
        }

        const match = value.match(/^(\d{1,2}):(\d{2})/);
        if (match) {
            return `${match[1].padStart(2, "0")}:${match[2]}`;
        }

        return value;
    };

    return (
        <div
            className={`absolute left-0 bottom-0 z-1000 ${routeDrawn ? (showDirectionsControls ? "h-30" : "h-50") : "h-70"} w-screen rounded-lg bg-white/95 shadow-md rounded-t-2xl border-t border-t-gray-300 px-6 py-4`}
        >
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                {routeDrawn && showDirectionsControls && (
                    <div className="absolute bottom-[50%] right-1 flex h-full flex-col items-center justify-center gap-1 p-2 text-center">
                        <button
                            type="button"
                            onClick={() => setShowDirectionsControls(!showDirectionsControls)}

                            className="mx-auto rounded-full bg-[#FEE2E2] px-2 py-1 text-[14px] text-[#B91C1C] focus:outline-none focus:ring-2 focus:ring-[#FEE2E2] focus:ring-offset-2"
                        >
                            <X className="inline-block" size={14} />
                        </button>
                    </div>
                )}
                <div className="flex flex-col justify-between h-full">
                    {routeDrawn && distance !== null ? (
                        <div className="grid w-full grid-cols-12 gap-2 items-stretch">
                            <div className="col-span-4 flex h-full flex-col items-center justify-center gap-1 border-r border-gray-300 p-2 text-center">
                                <span className=" font-bold text-xl text-[#3B82F6]">
                                    {travelTimeInMinutes
                                        ? travelTimeInMinutes + " min"
                                        : "12 min"}
                                </span>
                                <span className="text-[#94A3B8]">Reistijd</span>
                            </div>
                            <div className="col-span-4 flex h-full flex-col items-center justify-center gap-1 border-r border-gray-300 p-2 text-center">
                                <span className="text-black font-bold text-xl">
                                    {distance.toFixed(2)} km
                                </span>
                                <span className="text-[#94A3B8]">Afstand</span>
                            </div>
                            <div className="col-span-4 flex h-full flex-col items-center justify-center gap-1 p-2 text-center">
                                <span className="text-black font-bold text-xl">
                                    {arrivalTime ? formatTimeHHmm(arrivalTime) : "12:00"}
                                </span>
                                <span className="text-[#94A3B8]">Aankomst</span>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <span className="text-black px-2 font-bold text-lg mb-3">
                                Waar wil je heen?
                            </span>
                            <span className="flex flex-col gap-2 mt-2">
                                <div className="">
                                    <div className="flex items-center gap-2 px-1 py-1 text-slate-500">
                                        <MapPinHouse className="inline-block text-slate-500" />
                                        {from}
                                    </div>
                                </div>
                                <div className=" flex flex-row items-center gap-2 px-1 py-1 text-slate-500">
                                    <MapPinSearch className="inline-block text-slate-500" />
                                    <input
                                        type="text"
                                        className="w-full text-[#64748B] placeholder-[#64748B] search-field focus:outline-none px-2 py-2 rounded-lg"
                                        value={to}
                                        onChange={(e) => setTo(e.target.value)}
                                        placeholder="Zoek een adres of locatie..."
                                        autoComplete="street-address"
                                    />
                                </div>
                            </span>
                        </div>
                    )}

                    {routeDrawn ? (
                        !showDirectionsControls && (
                            <button
                                type="button"
                                onClick={() => void drawRoute()}

                                className="fixed bottom-6 left-6 right-6 bg-[#8B5CF6] p-3 text-[14px] text-white rounded-lg hover:bg-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2"
                            >
                                Start route{" "}
                                <ArrowRight
                                    className="inline-block ml-2"
                                    size={14}
                                    onClick={() => setShowDirectionsControls(true)}
                                />
                            </button>
                        )
                    ) : (
                        <button
                            type="button"
                            onClick={() => void drawRoute()}

                            className="fixed bottom-6 left-6 right-6 bg-[#8B5CF6] p-3 text-[14px] text-white rounded-lg hover:bg-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2"
                        >
                            Bereken route
                            <ArrowRight className="inline-block ml-2" size={14} />
                        </button>
                    )}
                </div>
            </div>
            {routeError ? <p className="text-xs text-red-600">{routeError}</p> : null}
        </div>
    );
}

export default MapControls;

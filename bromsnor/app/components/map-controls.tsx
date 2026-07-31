import { ArrowRight, MapPinHouse, MapPinSearch } from "lucide-react";

interface MapControlsProps {
    from: string;
    to: string;
    setFrom: (value: string) => void;
    setTo: (value: string) => void;
    drawRoute: () => Promise<void>;
    routeError: string | null;
}

function MapControls({
    from,
    to,
    setFrom,
    setTo,
    drawRoute,
    routeError,
}: MapControlsProps) {
    return (
        <div className="absolute left-0 bottom-0 z-1000 h-70 w-screen rounded-lg bg-white/95 p-3 shadow-md rounded-t-2xl border-t border-t-gray-300 px-6 py-6">
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex flex-col justify-between h-full">
                    <div>
                        <span className="text-black px-2 font-bold text-lg mb-3">
                            Waar wil je heen?
                        </span>
                        <span className="flex flex-col gap-2 mt-2">
                            <div className="search-field">
                                <div className="flex items-center gap-2 px-1 py-1 text-slate-500">
                                    <MapPinHouse className="inline-block text-slate-500" />
                                    {from}
                                </div>
                            </div>
                            <div className="search-field flex flex-row items-center gap-2 px-1 py-1 text-slate-500">
                                <MapPinSearch className="inline-block text-slate-500" />
                                <input
                                    type="text"
                                    className="w-full text-[#64748B] placeholder-[#64748B] focus:outline-none px-2 py-2 rounded-lg"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    placeholder="Zoek een adres of locatie..."
                                    autoComplete="street-address"
                                />
                            </div>
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => void drawRoute()}

                        className="fixed bottom-6 left-6 right-6 bg-[#8B5CF6] p-3 text-[14px] text-white rounded-lg hover:bg-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2"
                    >
                        Start route <ArrowRight className="inline-block ml-2" size={14} />
                    </button>
                </div>
            </div>
            {routeError ? <p className="text-xs text-red-600">{routeError}</p> : null}
        </div>
    );
}

export default MapControls;

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
        <section className="panel" style={{ fontFamily: "'DM Sans', sans-serif", zIndex: 1000 }}>
            <div className="grab" aria-hidden="true" />

            {routeDrawn && distance !== null ? (
                <>
                    <div className="stats" style={{ marginTop: 12 }}>
                        <div>
                            <span className="stat-value accent">
                                {travelTimeInMinutes ? travelTimeInMinutes + " min" : "12 min"}
                            </span>
                            <span className="stat-label">Reistijd</span>
                        </div>
                        <div>
                            <span className="stat-value">{distance.toFixed(2)} km</span>
                            <span className="stat-label">Afstand</span>
                        </div>
                        <div>
                            <span className="stat-value">
                                {arrivalTime ? formatTimeHHmm(arrivalTime) : "12:00"}
                            </span>
                            <span className="stat-label">Aankomst</span>
                        </div>
                        <button
                            type="button"
                            aria-label="Route sluiten"
                            onClick={() => {
                                if (showDirectionsControls) {
                                    setShowDirectionsControls(false);
                                } else {
                                    setRouteDrawn(false);
                                    setTo("");
                                }
                            }}
                            style={{
                                marginLeft: "auto", alignSelf: "center",
                                width: 34, height: 34, borderRadius: "50%",
                                border: "none", cursor: "pointer",
                                background: "#fef2f2", color: "#b91c1c",
                                display: "grid", placeItems: "center",
                            }}
                        >
                            <X size={15} />
                        </button>
                    </div>
                    {!showDirectionsControls && (
                        <button type="button" className="button" onClick={() => void drawRoute()}>
                            Start route{" "}
                            <ArrowRight
                                className="inline-block ml-1"
                                size={15}
                                onClick={() => setShowDirectionsControls(true)}
                            />
                        </button>
                    )}
                </>
            ) : (
                <>
                    <h1 className="panel-title">Waar wil je heen?</h1>
                    <div
                        style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "4px 2px 12px", color: "#64748b", fontSize: 14.5,
                        }}
                    >
                        <MapPinHouse size={18} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{from}</span>
                    </div>
                    <div className="search-field">
                        <input
                            type="text"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            placeholder="Zoek een adres of locatie…"
                            autoComplete="street-address"
                        />
                        <MapPinSearch size={19} />
                    </div>
                    <button
                        type="button"
                        className="button"
                        style={{ marginTop: 14 }}
                        onClick={() => void drawRoute()}
                    >
                        Bereken route <ArrowRight className="inline-block ml-1" size={15} />
                    </button>
                </>
            )}

            {routeError ? (
                <p style={{ margin: "10px 2px 0", fontSize: 13, color: "#ef4444" }}>{routeError}</p>
            ) : null}
        </section>
    );
}

export default MapControls;

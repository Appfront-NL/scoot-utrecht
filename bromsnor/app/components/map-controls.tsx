export function MapControls() {
    return (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 z-10">
            <button
                className="rounded bg-white p-2 shadow"
                onClick={() => {
                    const map = (window as any).mapInstance;
                    if (map) {
                        map.setView([52.0907, 5.1214], 13);
                    }
                }}
            >
                Reset View
            </button>
        </div>
    );
}

import { useMemo } from "react";
import type { Destination } from "./types";

/**
 * "Waar wil je heen?" — search bottom sheet with filterable
 * destination list (saved items get a star).
 *
 * @example
 * <SearchPanel destinations={city.destinations} filter={q}
 *   onFilter={setQ} onPick={plan} status={null} />
 */
export function SearchPanel({ destinations, filter, onFilter, onPick, onSearch, prefiltered, status }: {
  destinations: Destination[];
  filter: string;
  onFilter: (v: string) => void;
  onPick: (d: Destination) => void;
  /** Free-text search (address or "lat, lng"), fired on Enter or
      via the search row. Wire it to a geocoder; without it the
      panel only filters the suggestion list. */
  onSearch?: (query: string) => void;
  /** Skip the built-in text filter — pass this when `destinations`
      already come from a live search on the current input. */
  prefiltered?: boolean;
  status?: { text: string; error: boolean } | null;
}) {
  const list = useMemo(() => {
    if (prefiltered) return destinations;
    const f = filter.trim().toLowerCase();
    return destinations.filter((d) =>
      d.name.toLowerCase().includes(f) || d.area.toLowerCase().includes(f));
  }, [destinations, filter, prefiltered]);

  return (
    <section className="panel">
      <div className="grab" aria-hidden="true" />
      <h1 className="panel-title">
        Waar wil je heen?{" "}
        <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "-3px" }}><circle cx="5.5" cy="17" r="3" /><circle cx="18.5" cy="17" r="3" /><path d="M8.5 17h7" /><path d="M18.5 17V9a2 2 0 0 0-2-2h-2" /><path d="M5.5 14l3.2-6.5h4.1" /><path d="M12.8 7.5 15 12" /></svg>
      </h1>
      <div className="search-field">
        <input value={filter} onChange={(e) => onFilter(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && onSearch && filter.trim()) onSearch(filter.trim()); }}
          type="text" placeholder="Zoek op locatie…" autoComplete="off" enterKeyHint="search" />
        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></svg>
      </div>
      <div className="suggestions">
        {list.length ? list.map((d) => (
          <button className="suggestion" key={d.name} onClick={() => onPick(d)}>
            <span className="pin">
              {d.saved
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3-4.7-4.4 6.4-.8Z" /></svg>
                : <svg width="17" height="17" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10.5c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10.2" r="2.7" /></svg>}
            </span>
            <span><b>{d.name}</b><small>{d.area}</small></span>
          </button>
        )) : null}
        {onSearch && filter.trim() && (
          <button className="suggestion" onClick={() => onSearch(filter.trim())}>
            <span className="pin">
              <svg width="17" height="17" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></svg>
            </span>
            <span><b>Zoek “{filter.trim()}”</b><small>Adres of coördinaten (lat, lng)</small></span>
          </button>
        )}
        {!list.length && filter.trim() && !onSearch ? <p className="hint">Geen locatie gevonden. Of tik op de kaart.</p> : null}
      </div>
      {status && <p className={"hint" + (status.error ? " error" : "")} aria-live="polite">{status.text}</p>}
      <p className="hint">Of tik op de kaart om een bestemming te kiezen.</p>
    </section>
  );
}

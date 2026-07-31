import { useEffect, useRef, useState } from "react";

/**
 * "We halen de regels op" loading theatre (design 32). Counts to
 * 340 and calls onDone. Pure theatre in mock mode; with a real
 * rules pipeline, drive the count via props instead.
 *
 * @example
 * <RulesDownload cityName="Utrecht" onDone={next} />
 */
export function RulesDownload({ cityName, onDone }: { cityName: string; onDone: () => void }) {
  const [count, setCount] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const total = 340, duration = 2300, t0 = performance.now();
    const iv = setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / duration);
      setCount(Math.round(total * (1 - Math.pow(1 - p, 2))));
      if (p >= 1 && !done.current) {
        done.current = true;
        clearInterval(iv);
        setTimeout(onDone, 400);
      }
    }, 40);
    return () => clearInterval(iv);
  }, [onDone]);

  const tiles = Array.from({ length: 32 }, (_, i) =>
    ["", "c1", "", "c2", "", "c3", "", ""][i % 8]);

  return (
    <section className="rules-loading">
      <div className="rules-loading-inner">
        <div className="rules-loading-tiles" aria-hidden="true">
          {tiles.map((cls, i) => <i key={i} className={cls} style={{ animationDelay: `${i * 55}ms` }} />)}
        </div>
        <h2>We halen de regels van {cityName} op</h2>
        <p>Elk verkeersbesluit van de gemeente wordt omgezet naar een zone op je kaart.</p>
        <div className="rules-loading-count"><b>{count}</b> van 340 besluiten</div>
        <span className="rules-loading-once">Eenmalig</span>
      </div>
    </section>
  );
}

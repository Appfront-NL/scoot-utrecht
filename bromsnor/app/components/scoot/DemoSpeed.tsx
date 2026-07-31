/**
 * Demo speed control for the ride simulation (pitch tool).
 *
 * @example
 * <DemoSpeed factor={factor} onFactor={setFactor} />
 */
export function DemoSpeed({ factor, onFactor, options = [1, 8, 25] }: {
  factor: number; onFactor: (x: number) => void; options?: number[];
}) {
  return (
    <div className="demo-speed" aria-label="Demosnelheid">
      {options.map((x) => (
        <button key={x} className={factor === x ? "active" : ""} onClick={() => onFactor(x)}>{x}&times;</button>
      ))}
    </div>
  );
}

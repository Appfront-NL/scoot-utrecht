/**
 * The three-value stat row (route overview, arrived screen).
 * `accent` colors that value route-blue.
 *
 * @example
 * <Stats items={[
 *   { value: "620 m", label: "Afstand" },
 *   { value: "2 min", label: "Reistijd", accent: true },
 *   { value: "1", label: "Waarschuwingen" },
 * ]} />
 */
export function Stats({ items }: {
  items: { value: React.ReactNode; label: string; accent?: boolean }[];
}) {
  return (
    <div className="stats">
      {items.map((s) => (
        <div className="stat" key={s.label}>
          <span className={"stat-value" + (s.accent ? " accent" : "")}>{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

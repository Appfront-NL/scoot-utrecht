/**
 * The rules page, two modes (design 02/11): "welcome" shows the
 * per-vehicle intro and "Ik heb het begrepen"; "reference" is the
 * plain list behind the info button.
 *
 * @example
 * <RulesScreen mode="welcome" city={city} vehicle="snorfiets" onClose={next} />
 */
const ARROW = (
  <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
);

export function RulesScreen({ mode, city, vehicle, onClose }: {
  mode: "welcome" | "reference";
  city: { name: string; rules: { title: string; text: string }[] };
  vehicle: string;
  onClose: () => void;
}) {
  const welcome = mode === "welcome";
  return (
    <section className="rules-screen">
      <div className="rules-screen-inner">
        <p className="eyebrow">SCOOT</p>
        <h2 className="rules-title">
          {welcome ? `Welkom in ${city.name}` : `Wet en regelgeving in ${city.name}`}
        </h2>
        {welcome && (
          <p className="rules-sub">
            {vehicle === "bromfiets"
              ? <>Je rijdt {city.name} binnen met een bromfiets met <u>geel kenteken</u>. Dit zijn de belangrijkste regels voor jouw voertuig.</>
              : <>Je rijdt {city.name} binnen met een snorfiets met <u>blauw kenteken</u>. Dit zijn de belangrijkste regels voor jouw voertuig.</>}
          </p>
        )}
        <div className="rules-list">
          {city.rules.map((r) => (
            <div className="rule-card" key={r.title}>
              <span className="icon">
                <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.2" /><path d="M12 16v-4.5M12 8h.01" /></svg>
              </span>
              <div><h4>{r.title}</h4><p>{r.text}</p></div>
            </div>
          ))}
        </div>
        <button className="button" onClick={onClose}>
          {welcome ? <>Ik heb het begrepen {ARROW}</> : "Sluiten"}
        </button>
      </div>
    </section>
  );
}

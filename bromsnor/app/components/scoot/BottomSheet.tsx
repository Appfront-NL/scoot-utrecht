/**
 * Base bottom sheet (design-system `.panel`). All SCOOT panels and
 * sheets are built on this: grab handle, optional title/subtitle,
 * children. `onClose` makes the grab handle tappable.
 *
 * @example
 * <BottomSheet title="Wat zie je op de kaart" sub="Zet lagen aan of uit." onClose={close}>
 *   …inhoud…
 * </BottomSheet>
 */
export function BottomSheet({ title, sub, onClose, className, children }: {
  title?: React.ReactNode;
  sub?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={["panel", className].filter(Boolean).join(" ")}>
      {onClose
        ? <button className="grab" aria-label="Sluiten" onClick={onClose} />
        : <div className="grab" aria-hidden="true" />}
      {title && <h2 className="panel-title">{title}</h2>}
      {sub && <p className="sheet-sub">{sub}</p>}
      {children}
    </section>
  );
}

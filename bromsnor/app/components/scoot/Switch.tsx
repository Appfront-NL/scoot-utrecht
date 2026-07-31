/**
 * The violet toggle from the kaartlagen/instellingen designs.
 * Controlled component.
 *
 * @example
 * <Switch checked={on} onChange={setOn} label="Zonewaarschuwing" />
 */
export function Switch({ checked, onChange, label }: {
  checked: boolean;
  onChange: (on: boolean) => void;
  label?: string;
}) {
  return (
    <span className="switch">
      <input type="checkbox" checked={checked} aria-label={label}
        onChange={(e) => onChange(e.target.checked)} />
      <i />
    </span>
  );
}

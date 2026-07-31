/**
 * SCOOT primary button (design-system `.button`).
 *
 * @example
 * <Button onClick={plan}>Route starten</Button>
 * <Button variant="danger" size="small">Route herbereken</Button>
 * <Button variant="ghost">Rit exporteren</Button>
 */
export function Button({ variant, size, children, ...rest }: {
  variant?: "danger" | "ghost";
  size?: "small";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = ["button", variant, size].filter(Boolean).join(" ");
  return <button className={cls} {...rest}>{children}</button>;
}

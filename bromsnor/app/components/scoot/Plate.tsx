/**
 * Dutch scooter license plate (design 33). Blue = snorfiets,
 * yellow = bromfiets.
 *
 * @example
 * <Plate color="blue" number="52-ND-3" />
 * <Plate color="yellow" number="8-TFP-42" />
 */
export function Plate({ color, number }: {
  color: "blue" | "yellow";
  number: string;
}) {
  return (
    <span className={"plate plate--" + color}>
      <i>NL</i><b>{number}</b>
    </span>
  );
}

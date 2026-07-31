/** Shared types for the SCOOT component kit. */

/** A destination in the search list. */
export type Destination = { name: string; area: string; point: [number, number]; saved?: boolean };

/** Zone-rule properties, exactly the regeldata schema (CONTRACT.md). */
export type ZoneProps = {
  regime?: string; naam?: string; tijdvenster?: string | null;
  voertuig?: string; geldig_vanaf?: string; zekerheid?: string; bron?: string;
};

/** What the nav banner shows for the current maneuver. */
export type BannerState = {
  distance: string; action: string; street: string | null;
  next: string | null; direction: string;
};

/** Kaartlagen visibility state. */
export type LayerState = { verboden: boolean; rijbaan: boolean; fietspad: boolean; venstertijd: boolean };

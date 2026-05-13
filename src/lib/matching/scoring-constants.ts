/** Point weights (0–100 total budget before bonuses/penalties). */
export const MATCH_WEIGHTS = {
  budget: 20,
  location: 20,
  bedrooms: 10,
  bathrooms: 10,
  property_type: 20,
  must_haves: 15,
  /** Added on top of weighted sum; capped separately. */
  nice_to_haves_cap: 5
} as const;

/** Stretch above buyer stated max before budget is treated as failed. */
export const BUDGET_STRETCH_RATIO = 1.1;

/** Bedrooms/baths: acceptable through min + this many without overfit penalty. */
export const ROOM_UPPER_TOLERANCE = 2;

/** Small reduction when beds/baths exceed min + tolerance. */
export const ROOM_OVERFIT_FIT = 0.82;

/** Location tier multipliers (applied as location_fit 0–1). */
export const LOCATION_SAME_TOWN = 1;
export const LOCATION_TIER1 = 0.85;
export const LOCATION_TIER2 = 0.6;
export const LOCATION_NONE = 0;

/** When disqualified, squash final score toward this cap. */
export const DISQUALIFIED_SCORE_CAP = 4;

export interface BuyerProfileRow {
  lead_id: string;
  budget_max: number | null;
  bedrooms_min: number | null;
  bathrooms_min: number | null;
  property_type: string | null;
  location_primary: string | null;
  must_haves: string[];
  nice_to_haves: string[];
  dealbreakers: string[];
}

export interface HouseProfileRow {
  id: string;
  seller_lead_id: string | null;
  address: string | null;
  town: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  property_type: string | null;
  features: string[];
  list_price: number | null;
  status: string | null;
  created_at: string;
}

export interface TownAdjacencyRow {
  primary_town: string;
  adjacent_town: string;
  tier: 1 | 2;
}

export interface ScoreBreakdown {
  budget_fit: number;
  location_fit: number;
  bedrooms_fit: number;
  bathrooms_fit: number;
  property_type_fit: number;
  must_have_fit: number;
  nice_to_have_bonus: number;
  penalties: string[];
  reasons: string[];
}

export interface ScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
}

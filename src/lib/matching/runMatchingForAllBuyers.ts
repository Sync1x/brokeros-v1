import { MINIMUM_PERSISTED_MATCH_SCORE } from './scoring-constants';
import { scoreBuyerToHouse } from './scoreBuyerToHouse';
import type { BuyerProfileRow, HouseProfileRow, TownAdjacencyRow } from './types';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface RunMatchingResult {
  buyersConsidered: number;
  housesConsidered: number;
  pairsScored: number;
  matchesWritten: number;
  rejectedPairs: number;
  upsertRows: number;
}

interface BuyerProfileSelectRow {
  lead_id: string;
  budget_max: number | null;
  bedrooms_min: number | string | null;
  bathrooms_min: number | string | null;
  property_type: string | null;
  property_type_key: string | null;
  location_primary: string | null;
  must_haves: string[] | null;
  nice_to_haves: string[] | null;
  dealbreakers: string[] | null;
  must_have_keys: string[] | null;
  nice_to_have_keys: string[] | null;
  dealbreaker_keys: string[] | null;
}

interface HouseProfileSelectRow {
  id: string;
  seller_lead_id: string;
  address: string | null;
  town: string | null;
  beds: number | string | null;
  baths: number | string | null;
  sqft: number | null;
  property_type: string | null;
  property_type_key: string | null;
  features: string[] | null;
  feature_keys: string[] | null;
  list_price: number | null;
  status: string | null;
  created_at: string;
}

function arrayFallback(primary?: string[] | null, fallback?: string[] | null): string[] {
  return primary?.length ? primary : (fallback ?? []);
}

function stringFallback(primary?: string | null, fallback?: string | null): string | null {
  return primary?.trim() ? primary : (fallback ?? null);
}

function numberOrNull(value: number | string | null): number | null {
  if (value == null) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Loads buyer leads + profiles, all house profiles, and town adjacency; scores every pair;
 * upserts qualifying rows into public.matches on (buyer_lead_id, house_profile_id).
 */
export async function runMatchingForAllBuyers(client?: SupabaseClient): Promise<RunMatchingResult> {
  const supabase =
    client ?? (await import('@/lib/supabase/script-client')).createScriptSupabaseAdmin();

  const { error: deleteWeakErr } = await supabase
    .from('matches')
    .delete()
    .lt('score', MINIMUM_PERSISTED_MATCH_SCORE);

  if (deleteWeakErr) throw new Error(`Failed to delete weak matches: ${deleteWeakErr.message}`);

  const { data: buyerLeads, error: buyerLeadErr } = await supabase
    .from('leads')
    .select('id')
    .eq('lead_type', 'buyer');

  if (buyerLeadErr) throw new Error(`Failed to load buyer leads: ${buyerLeadErr.message}`);

  const buyerIds = (buyerLeads ?? []).map((r) => r.id as string);
  if (!buyerIds.length) {
    return {
      buyersConsidered: 0,
      housesConsidered: 0,
      pairsScored: 0,
      matchesWritten: 0,
      rejectedPairs: 0,
      upsertRows: 0
    };
  }

  const { data: profiles, error: profErr } = await supabase
    .from('buyer_profiles')
    .select(
      'lead_id, budget_max, bedrooms_min, bathrooms_min, property_type, property_type_key, location_primary, must_haves, nice_to_haves, dealbreakers, must_have_keys, nice_to_have_keys, dealbreaker_keys'
    )
    .in('lead_id', buyerIds);

  if (profErr) throw new Error(`Failed to load buyer_profiles: ${profErr.message}`);

  const { data: houses, error: houseErr } = await supabase
    .from('house_profiles')
    .select(
      'id, seller_lead_id, address, town, beds, baths, sqft, property_type, property_type_key, features, feature_keys, list_price, status, created_at'
    );

  if (houseErr) throw new Error(`Failed to load house_profiles: ${houseErr.message}`);

  const { data: adjRows, error: adjErr } = await supabase
    .from('town_adjacency')
    .select('primary_town, adjacent_town, tier');

  if (adjErr) throw new Error(`Failed to load town_adjacency: ${adjErr.message}`);

  const townAdjacency = (adjRows ?? []) as TownAdjacencyRow[];
  const houseList: HouseProfileRow[] = ((houses ?? []) as HouseProfileSelectRow[]).map((row) => ({
    id: row.id,
    seller_lead_id: row.seller_lead_id,
    address: row.address,
    town: row.town,
    beds: numberOrNull(row.beds),
    baths: numberOrNull(row.baths),
    sqft: row.sqft,
    property_type: stringFallback(row.property_type_key, row.property_type),
    features: arrayFallback(row.feature_keys, row.features),
    list_price: row.list_price,
    status: row.status,
    created_at: row.created_at
  }));
  const profileByLead = new Map<string, BuyerProfileRow>();

  for (const row of (profiles ?? []) as BuyerProfileSelectRow[]) {
    profileByLead.set(row.lead_id, {
      lead_id: row.lead_id,
      budget_max: row.budget_max,
      bedrooms_min: numberOrNull(row.bedrooms_min),
      bathrooms_min: numberOrNull(row.bathrooms_min),
      property_type: stringFallback(row.property_type_key, row.property_type),
      location_primary: row.location_primary,
      must_haves: arrayFallback(row.must_have_keys, row.must_haves),
      nice_to_haves: arrayFallback(row.nice_to_have_keys, row.nice_to_haves),
      dealbreakers: arrayFallback(row.dealbreaker_keys, row.dealbreakers)
    });
  }

  const payload: {
    buyer_lead_id: string;
    house_profile_id: string;
    score: number;
    score_breakdown_json: Record<string, unknown>;
  }[] = [];
  let pairsScored = 0;
  let rejectedPairs = 0;

  for (const leadId of buyerIds) {
    const buyerProfile = profileByLead.get(leadId);
    if (!buyerProfile) continue;

    for (const house of houseList) {
      const { score, breakdown } = scoreBuyerToHouse(buyerProfile, house, townAdjacency);
      pairsScored += 1;

      if (score < MINIMUM_PERSISTED_MATCH_SCORE) {
        rejectedPairs += 1;
        continue;
      }

      payload.push({
        buyer_lead_id: leadId,
        house_profile_id: house.id,
        score,
        score_breakdown_json: breakdown as unknown as Record<string, unknown>
      });
    }
  }

  const chunkSize = 80;
  for (let i = 0; i < payload.length; i += chunkSize) {
    const chunk = payload.slice(i, i + chunkSize);
    const { error: upErr } = await supabase.from('matches').upsert(chunk, {
      onConflict: 'buyer_lead_id,house_profile_id'
    });
    if (upErr) throw new Error(`matches upsert failed: ${upErr.message}`);
  }

  return {
    buyersConsidered: buyerIds.filter((id) => profileByLead.has(id)).length,
    housesConsidered: houseList.length,
    pairsScored,
    matchesWritten: payload.length,
    rejectedPairs,
    upsertRows: payload.length
  };
}

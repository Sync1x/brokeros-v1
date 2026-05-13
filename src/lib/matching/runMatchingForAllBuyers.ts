import { createScriptSupabaseAdmin } from '@/lib/supabase/script-client';
import { scoreBuyerToHouse } from './scoreBuyerToHouse';
import type { BuyerProfileRow, HouseProfileRow, TownAdjacencyRow } from './types';

export interface RunMatchingResult {
  buyersConsidered: number;
  housesConsidered: number;
  upsertRows: number;
}

/**
 * Loads buyer leads + profiles, all house profiles, and town adjacency; scores every pair;
 * upserts into public.matches on (buyer_lead_id, house_profile_id).
 */
export async function runMatchingForAllBuyers(
  client = createScriptSupabaseAdmin()
): Promise<RunMatchingResult> {
  const { data: buyerLeads, error: buyerLeadErr } = await client
    .from('leads')
    .select('id')
    .eq('lead_type', 'buyer');

  if (buyerLeadErr) throw new Error(`Failed to load buyer leads: ${buyerLeadErr.message}`);

  const buyerIds = (buyerLeads ?? []).map((r) => r.id as string);
  if (!buyerIds.length) {
    return { buyersConsidered: 0, housesConsidered: 0, upsertRows: 0 };
  }

  const { data: profiles, error: profErr } = await client
    .from('buyer_profiles')
    .select(
      'lead_id, budget_max, bedrooms_min, bathrooms_min, property_type, location_primary, must_haves, nice_to_haves, dealbreakers'
    )
    .in('lead_id', buyerIds);

  if (profErr) throw new Error(`Failed to load buyer_profiles: ${profErr.message}`);

  const { data: houses, error: houseErr } = await client
    .from('house_profiles')
    .select(
      'id, seller_lead_id, address, town, beds, baths, sqft, property_type, features, list_price, status, created_at'
    );

  if (houseErr) throw new Error(`Failed to load house_profiles: ${houseErr.message}`);

  const { data: adjRows, error: adjErr } = await client.from('town_adjacency').select('primary_town, adjacent_town, tier');

  if (adjErr) throw new Error(`Failed to load town_adjacency: ${adjErr.message}`);

  const townAdjacency = (adjRows ?? []) as TownAdjacencyRow[];
  const houseList = (houses ?? []) as HouseProfileRow[];
  const profileByLead = new Map<string, BuyerProfileRow>();

  for (const row of profiles ?? []) {
    profileByLead.set(row.lead_id as string, {
      lead_id: row.lead_id as string,
      budget_max: row.budget_max as number | null,
      bedrooms_min: row.bedrooms_min != null ? Number(row.bedrooms_min) : null,
      bathrooms_min: row.bathrooms_min != null ? Number(row.bathrooms_min) : null,
      property_type: row.property_type as string | null,
      location_primary: row.location_primary as string | null,
      must_haves: (row.must_haves as string[]) ?? [],
      nice_to_haves: (row.nice_to_haves as string[]) ?? [],
      dealbreakers: (row.dealbreakers as string[]) ?? []
    });
  }

  const payload: {
    buyer_lead_id: string;
    house_profile_id: string;
    score: number;
    score_breakdown_json: Record<string, unknown>;
  }[] = [];

  for (const leadId of buyerIds) {
    const buyerProfile = profileByLead.get(leadId);
    if (!buyerProfile) continue;

    for (const house of houseList) {
      const { score, breakdown } = scoreBuyerToHouse(buyerProfile, house, townAdjacency);
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
    const { error: upErr } = await client.from('matches').upsert(chunk, {
      onConflict: 'buyer_lead_id,house_profile_id'
    });
    if (upErr) throw new Error(`matches upsert failed: ${upErr.message}`);
  }

  return {
    buyersConsidered: buyerIds.filter((id) => profileByLead.has(id)).length,
    housesConsidered: houseList.length,
    upsertRows: payload.length
  };
}

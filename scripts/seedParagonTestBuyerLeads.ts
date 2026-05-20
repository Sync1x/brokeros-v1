import { runMatchingForAllBuyers } from '@/lib/matching/runMatchingForAllBuyers';
import type { ScoreBreakdown } from '@/lib/matching/types';
import { createScriptSupabaseAdmin } from '@/lib/supabase/script-client';
import type { SupabaseClient } from '@supabase/supabase-js';

const SEED_NOTE = 'brokeros.paragon-test-buyers.v1';
const TEST_EMAIL_DOMAIN = 'paragon-test.brokeros.local';
const MAX_HOUSES = 15;

interface HouseProfileSeedRow {
  id: string;
  address: string | null;
  town: string | null;
  beds: number | string | null;
  baths: number | string | null;
  list_price: number | null;
  property_type: string | null;
  property_type_key: string | null;
  features: string[] | null;
  feature_keys: string[] | null;
}

interface SeedBuyerSpec {
  name: string;
  email: string;
  status: string;
  temperature: 'hot' | 'warm' | 'cold';
  budget_max: number | null;
  bedrooms_min: number | null;
  bathrooms_min: number | null;
  property_type: string | null;
  property_type_key: string | null;
  location_primary: string | null;
  must_haves: string[];
  nice_to_haves: string[];
  dealbreakers: string[];
  must_have_keys: string[];
  nice_to_have_keys: string[];
  dealbreaker_keys: string[];
}

interface LeadInsertRow {
  name: string;
  email: string;
  phone: string | null;
  lead_type: 'buyer';
  status: string;
  temperature: 'hot' | 'warm' | 'cold';
  notes_md: string;
  org_id: string;
  owner_user_id: string;
}

interface LeadInsertResult {
  id: string;
  name: string;
  email: string | null;
}

interface TopMatchRow {
  buyer_lead_id: string;
  house_profile_id: string;
  score: number | string;
  score_breakdown_json: ScoreBreakdown | null;
}

interface HouseMatchRow {
  id: string;
  address: string | null;
  town: string | null;
}

function numberOrNull(value: number | string | null | undefined) {
  if (value == null) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function positiveNumber(value: number | string | null | undefined, fallback: number) {
  const parsed = numberOrNull(value);
  return parsed && parsed > 0 ? parsed : fallback;
}

function arrayValue(value: string[] | null | undefined) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function featureKeysFor(house: HouseProfileSeedRow) {
  return unique(arrayValue(house.feature_keys).length ? arrayValue(house.feature_keys) : arrayValue(house.features));
}

function propertyTypeFor(house: HouseProfileSeedRow) {
  return house.property_type_key?.trim() || house.property_type?.trim() || 'single_family';
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for script tenancy scope`);
  return value;
}

function priceFor(house: HouseProfileSeedRow) {
  return positiveNumber(house.list_price, 450_000);
}

function bedsFor(house: HouseProfileSeedRow) {
  return Math.max(1, Math.floor(positiveNumber(house.beds, 2)));
}

function bathsFor(house: HouseProfileSeedRow) {
  return Math.max(1, Math.floor(positiveNumber(house.baths, 1)));
}

function townFor(house: HouseProfileSeedRow) {
  return house.town?.trim() || 'Unknown Paragon Town';
}

function absentDealbreakers(houseFeatures: string[]) {
  const candidates = [
    'airport_noise',
    'busy_road',
    'shared_driveway',
    'flood_zone',
    'no_garage',
    'steep_driveway',
    'hoa'
  ];
  return candidates.filter((candidate) => !houseFeatures.includes(candidate));
}

function makeLeadName(kind: 'Strong' | 'Possible' | 'Bad Fit', index: number) {
  return `Paragon ${kind} Buyer ${index}`;
}

function makeEmail(kind: 'strong' | 'possible' | 'bad-fit', index: number) {
  return `paragon-${kind}-${index}@${TEST_EMAIL_DOMAIN}`;
}

function strongBuyer(house: HouseProfileSeedRow, index: number): SeedBuyerSpec {
  const keys = featureKeysFor(house);
  const must = keys.slice(0, 2);
  const nice = keys.slice(2, 5);
  const dealbreakers = absentDealbreakers(keys).slice(0, 2);
  const propertyType = propertyTypeFor(house);

  return {
    name: makeLeadName('Strong', index),
    email: makeEmail('strong', index),
    status: 'active',
    temperature: 'hot',
    budget_max: Math.ceil(priceFor(house) * 1.08),
    bedrooms_min: Math.max(1, bedsFor(house) - 1),
    bathrooms_min: Math.max(1, bathsFor(house) - 1),
    property_type: propertyType,
    property_type_key: propertyType,
    location_primary: townFor(house),
    must_haves: must,
    nice_to_haves: nice,
    dealbreakers,
    must_have_keys: must,
    nice_to_have_keys: nice,
    dealbreaker_keys: dealbreakers
  };
}

function possibleBuyer(house: HouseProfileSeedRow, index: number): SeedBuyerSpec {
  const keys = featureKeysFor(house);
  const nice = keys.slice(0, 2);
  const propertyType = propertyTypeFor(house);

  return {
    name: makeLeadName('Possible', index),
    email: makeEmail('possible', index),
    status: 'nurture',
    temperature: 'warm',
    budget_max: Math.ceil(priceFor(house) * (index % 2 === 0 ? 0.96 : 1.02)),
    bedrooms_min: bedsFor(house),
    bathrooms_min: Math.max(1, bathsFor(house) - 1),
    property_type: propertyType,
    property_type_key: propertyType,
    location_primary: townFor(house),
    must_haves: [],
    nice_to_haves: nice,
    dealbreakers: absentDealbreakers(keys).slice(0, 1),
    must_have_keys: [],
    nice_to_have_keys: nice,
    dealbreaker_keys: absentDealbreakers(keys).slice(0, 1)
  };
}

function badFitBuyer(house: HouseProfileSeedRow, index: number): SeedBuyerSpec {
  const keys = featureKeysFor(house);
  const presentDealbreaker = keys[0] ? [keys[0]] : [];
  const incompatibleType = propertyTypeFor(house) === 'land' ? 'condo' : 'land';

  return {
    name: makeLeadName('Bad Fit', index),
    email: makeEmail('bad-fit', index),
    status: 'nurture',
    temperature: 'cold',
    budget_max: Math.max(50_000, Math.floor(priceFor(house) * 0.55)),
    bedrooms_min: bedsFor(house) + 2,
    bathrooms_min: bathsFor(house) + 1,
    property_type: incompatibleType,
    property_type_key: incompatibleType,
    location_primary: `Not ${townFor(house)}`,
    must_haves: incompatibleType === 'land' ? ['acreage'] : ['condo'],
    nice_to_haves: [],
    dealbreakers: presentDealbreaker,
    must_have_keys: incompatibleType === 'land' ? ['acreage'] : ['condo'],
    nice_to_have_keys: [],
    dealbreaker_keys: presentDealbreaker
  };
}

function buildBuyerSpecs(houses: HouseProfileSeedRow[]) {
  const specs: SeedBuyerSpec[] = [];
  const strongHouses = houses.slice(0, 5);
  const possibleHouses = houses.slice(5, 9);
  const badFitHouses = houses.slice(9, 13);

  strongHouses.forEach((house, index) => specs.push(strongBuyer(house, index + 1)));
  possibleHouses.forEach((house, index) => specs.push(possibleBuyer(house, index + 1)));
  badFitHouses.forEach((house, index) => specs.push(badFitBuyer(house, index + 1)));

  if (!badFitHouses.length && houses.length) {
    specs.push(badFitBuyer(houses[0], 1));
  }

  return specs;
}

async function loadParagonHouses(supabase: SupabaseClient, orgId: string) {
  const { data, error } = await supabase
    .from('house_profiles')
    .select(
      'id, address, town, beds, baths, list_price, property_type, property_type_key, features, feature_keys'
    )
    .eq('org_id', orgId)
    .eq('source', 'paragon_test')
    .order('created_at', { ascending: false })
    .limit(MAX_HOUSES);

  if (error) throw new Error(`Load Paragon house_profiles: ${error.message}`);
  return (data ?? []) as HouseProfileSeedRow[];
}

async function clearOldParagonBuyerSeeds(
  supabase: SupabaseClient,
  orgId: string,
  ownerUserId: string
) {
  const { data: oldLeads, error: oldLeadError } = await supabase
    .from('leads')
    .select('id')
    .eq('org_id', orgId)
    .eq('owner_user_id', ownerUserId)
    .eq('lead_type', 'buyer')
    .like('name', 'Paragon %');

  if (oldLeadError) throw new Error(`Load old Paragon buyer leads: ${oldLeadError.message}`);

  const oldLeadIds = (oldLeads ?? []).map((lead) => lead.id as string);
  if (!oldLeadIds.length) return;

  const { error: matchError } = await supabase.from('matches').delete().in('buyer_lead_id', oldLeadIds);
  if (matchError) throw new Error(`Delete old Paragon buyer matches: ${matchError.message}`);

  const { error: profileError } = await supabase.from('buyer_profiles').delete().in('lead_id', oldLeadIds);
  if (profileError) throw new Error(`Delete old Paragon buyer profiles: ${profileError.message}`);

  const { error: leadError } = await supabase.from('leads').delete().in('id', oldLeadIds);
  if (leadError) throw new Error(`Delete old Paragon buyer leads: ${leadError.message}`);
}

async function insertBuyerSeeds(
  supabase: SupabaseClient,
  specs: SeedBuyerSpec[],
  orgId: string,
  ownerUserId: string
) {
  const leadRows: LeadInsertRow[] = specs.map((spec) => ({
    name: spec.name,
    email: spec.email,
    phone: null,
    lead_type: 'buyer',
    status: spec.status,
    temperature: spec.temperature,
    notes_md: SEED_NOTE,
    org_id: orgId,
    owner_user_id: ownerUserId
  }));

  const { data: leads, error: leadError } = await supabase
    .from('leads')
    .insert(leadRows)
    .select('id, name, email');

  if (leadError) throw new Error(`Insert Paragon buyer leads: ${leadError.message}`);

  const leadRowsByEmail = new Map((leads ?? []).map((lead) => [(lead.email as string | null) ?? '', lead as LeadInsertResult]));
  const buyerProfiles = specs.map((spec) => {
    const lead = leadRowsByEmail.get(spec.email);
    if (!lead) throw new Error(`Inserted lead not returned for ${spec.email}`);

    return {
      lead_id: lead.id,
      budget_max: spec.budget_max,
      bedrooms_min: spec.bedrooms_min,
      bathrooms_min: spec.bathrooms_min,
      property_type: spec.property_type,
      location_primary: spec.location_primary,
      must_haves: spec.must_haves,
      nice_to_haves: spec.nice_to_haves,
      dealbreakers: spec.dealbreakers,
      must_have_keys: spec.must_have_keys,
      nice_to_have_keys: spec.nice_to_have_keys,
      dealbreaker_keys: spec.dealbreaker_keys,
      property_type_key: spec.property_type_key
    };
  });

  const { error: profileError } = await supabase.from('buyer_profiles').insert(buyerProfiles);
  if (profileError) throw new Error(`Insert Paragon buyer profiles: ${profileError.message}`);

  return {
    leads: (leads ?? []) as LeadInsertResult[],
    buyerProfilesCreated: buyerProfiles.length
  };
}

async function printTopMatches(
  supabase: SupabaseClient,
  buyerIds: string[],
  orgId: string,
  ownerUserId: string
) {
  const { data: matches, error: matchError } = await supabase
    .from('matches')
    .select('buyer_lead_id, house_profile_id, score, score_breakdown_json')
    .eq('org_id', orgId)
    .eq('owner_user_id', ownerUserId)
    .in('buyer_lead_id', buyerIds)
    .order('score', { ascending: false })
    .limit(10);

  if (matchError) throw new Error(`Load top Paragon buyer matches: ${matchError.message}`);

  const rows = (matches ?? []) as TopMatchRow[];
  if (!rows.length) {
    console.log('\nTop matches: none persisted above threshold.');
    return;
  }

  const houseIds = [...new Set(rows.map((row) => row.house_profile_id))];
  const { data: houses, error: houseError } = await supabase
    .from('house_profiles')
    .select('id, address, town')
    .eq('org_id', orgId)
    .in('id', houseIds);

  if (houseError) throw new Error(`Load top match houses: ${houseError.message}`);

  const { data: leads, error: leadError } = await supabase
    .from('leads')
    .select('id, name')
    .eq('org_id', orgId)
    .eq('owner_user_id', ownerUserId)
    .in('id', buyerIds);

  if (leadError) throw new Error(`Load top match buyer leads: ${leadError.message}`);

  const houseById = new Map((houses ?? []).map((house) => [(house as HouseMatchRow).id, house as HouseMatchRow]));
  const buyerNameById = new Map((leads ?? []).map((lead) => [lead.id as string, lead.name as string]));

  console.log('\nTop 10 persisted Paragon test buyer matches');
  console.log('='.repeat(72));
  for (const row of rows) {
    const house = houseById.get(row.house_profile_id);
    const breakdown = row.score_breakdown_json;
    const reasons = breakdown?.reasons?.slice(0, 3) ?? [];
    console.log(
      `${buyerNameById.get(row.buyer_lead_id) ?? row.buyer_lead_id} | ${house?.address ?? 'Unknown listing'}, ${house?.town ?? 'Unknown town'} | Score ${Math.round(Number(row.score))}`
    );
    console.log(`  Reasons: ${reasons.length ? reasons.join(' · ') : '(none)'}`);
  }
}

async function main() {
  const supabase = createScriptSupabaseAdmin();
  const ownerUserId = requiredEnv('BROKEROS_USER_ID');
  const orgId = process.env.BROKEROS_ORG_ID?.trim() || `solo:${ownerUserId}`;
  const houses = await loadParagonHouses(supabase, orgId);

  if (houses.length < 3) {
    throw new Error(
      `Need at least 3 Paragon test listings in house_profiles; found ${houses.length}. Run bun run mls:sync:paragon-test first.`
    );
  }

  await clearOldParagonBuyerSeeds(supabase, orgId, ownerUserId);

  const specs = buildBuyerSpecs(houses);
  const inserted = await insertBuyerSeeds(supabase, specs, orgId, ownerUserId);
  const matching = await runMatchingForAllBuyers({ orgId, ownerUserId, client: supabase });

  console.log('\nParagon test buyer seed complete.');
  console.log(`Buyer leads created: ${inserted.leads.length}`);
  console.log(`Buyer profiles created: ${inserted.buyerProfilesCreated}`);
  console.log(`Houses considered: ${matching.housesConsidered}`);
  console.log(`Pairs scored: ${matching.pairsScored}`);
  console.log(`Matches written: ${matching.matchesWritten}`);

  await printTopMatches(
    supabase,
    inserted.leads.map((lead) => lead.id),
    orgId,
    ownerUserId
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

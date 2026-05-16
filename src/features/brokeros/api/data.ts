import 'server-only';

import { createServerSupabaseAdmin } from '@/lib/supabase/server-client';
import type {
  Lead,
  LeadStage,
  LeadTemperature,
  Listing,
  ListingStatus,
  Match
} from '@/types/brokeros';
import type { SupabaseClient } from '@supabase/supabase-js';

export const BROKER_LEAD_FIELDS =
  'id, name, email, phone, lead_type, status, temperature, notes_md, created_at' as const;

export const BROKER_BUYER_PROFILE_FIELDS =
  'lead_id, budget_max, bedrooms_min, bathrooms_min, property_type, location_primary, must_haves, nice_to_haves, dealbreakers, must_have_keys, nice_to_have_keys, dealbreaker_keys, property_type_key' as const;

export const BROKER_HOUSE_PROFILE_FIELDS =
  'id, seller_lead_id, address, town, beds, baths, sqft, property_type, features, feature_keys, property_type_key, list_price, status, created_at' as const;

export const BROKER_MATCH_FIELDS =
  'id, buyer_lead_id, house_profile_id, score, score_breakdown_json, created_at' as const;

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface BrokerLeadRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  lead_type: 'buyer' | 'seller';
  status: string | null;
  temperature: 'hot' | 'warm' | 'cold' | null;
  notes_md: string | null;
  created_at: string | null;
}

export interface BrokerBuyerProfileRow {
  lead_id: string;
  budget_max: number | null;
  bedrooms_min: number | string | null;
  bathrooms_min: number | string | null;
  property_type: string | null;
  location_primary: string | null;
  must_haves: string[] | null;
  nice_to_haves: string[] | null;
  dealbreakers: string[] | null;
  must_have_keys: string[] | null;
  nice_to_have_keys: string[] | null;
  dealbreaker_keys: string[] | null;
  property_type_key: string | null;
}

export interface BrokerHouseProfileRow {
  id: string;
  seller_lead_id: string;
  address: string | null;
  town: string | null;
  beds: number | string | null;
  baths: number | string | null;
  sqft: number | null;
  property_type: string | null;
  features: string[] | null;
  feature_keys: string[] | null;
  property_type_key: string | null;
  list_price: number | null;
  status: string | null;
  created_at: string | null;
}

export interface BrokerMatchRow {
  id: string;
  buyer_lead_id: string;
  house_profile_id: string;
  score: number | string;
  score_breakdown_json: JsonValue | null;
  created_at: string | null;
}

export interface BrokerLeadData extends Lead {
  leadType: BrokerLeadRow['lead_type'];
  createdAt: string | null;
  buyerProfile: BrokerBuyerProfileRow | null;
  raw: BrokerLeadRow;
}

export interface BrokerListingData extends Listing {
  sellerLeadId: string;
  sellerLead: BrokerLeadData | null;
  createdAt: string | null;
  features: string[];
  featureKeys: string[];
  propertyTypeKey: string | null;
  raw: BrokerHouseProfileRow;
}

export interface BrokerMatchData extends Match {
  buyerLeadId: string;
  houseProfileId: string;
  buyerLead: BrokerLeadData | null;
  houseProfile: BrokerListingData | null;
  scoreBreakdown: Record<string, unknown>;
  createdAt: string | null;
  raw: BrokerMatchRow;
}

export interface BrokerLeadMutationPayload {
  name: string;
  email?: string | null;
  phone?: string | null;
  lead_type: BrokerLeadRow['lead_type'];
  status?: string | null;
  temperature?: BrokerLeadRow['temperature'];
  notes_md?: string | null;
}

export interface BrokerBuyerProfileMutationPayload {
  lead_id: string;
  budget_max?: number | null;
  bedrooms_min?: number | null;
  bathrooms_min?: number | null;
  property_type?: string | null;
  location_primary?: string | null;
  must_haves?: string[] | null;
  nice_to_haves?: string[] | null;
  dealbreakers?: string[] | null;
  must_have_keys?: string[] | null;
  nice_to_have_keys?: string[] | null;
  dealbreaker_keys?: string[] | null;
  property_type_key?: string | null;
}

export interface BrokerHouseProfileMutationPayload {
  seller_lead_id: string;
  address?: string | null;
  town?: string | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  property_type?: string | null;
  features?: string[] | null;
  feature_keys?: string[] | null;
  property_type_key?: string | null;
  list_price?: number | null;
  status?: string | null;
}

function assertNoSupabaseError(error: { message: string } | null, context: string) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

function asArray(value: string[] | null | undefined) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function numberValue(value: number | string | null | undefined) {
  if (value == null) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function titleCase(value: string | null | undefined) {
  if (!value?.trim()) return '';
  return value
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function formatCurrency(value: number | null | undefined) {
  if (value == null) return 'Not set';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

function formatInteger(value: number | null | undefined) {
  if (value == null) return 'Not set';
  return new Intl.NumberFormat('en-US').format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Not contacted';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function splitNotes(notes: string | null | undefined) {
  if (!notes?.trim()) return [];
  try {
    const parsed = JSON.parse(notes) as { kind?: string; notes?: string };
    if (parsed.kind === 'brokeros.lead.workspace.v1') {
      return splitNotes(parsed.notes);
    }
  } catch {
    // Plain markdown notes from seed data or manual records.
  }
  return notes
    .split(/\r?\n+/)
    .map((note) => note.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);
}

function mapLeadStage(status: string | null | undefined): LeadStage {
  const normalized = status?.trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (normalized === 'nurture') return 'Nurture';
  if (normalized === 'touring' || normalized === 'active') return 'Touring';
  if (normalized === 'offer') return 'Offer';
  if (normalized === 'under contract') return 'Under Contract';
  if (normalized === 'closed') return 'Closed';
  return 'New';
}

function mapLeadTemperature(temperature: BrokerLeadRow['temperature']): LeadTemperature {
  if (temperature === 'hot') return 'Hot';
  if (temperature === 'warm') return 'Warm';
  return 'Cool';
}

function mapListingStatus(status: string | null | undefined): ListingStatus {
  const normalized = status?.trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (normalized === 'private') return 'Private';
  if (normalized === 'coming soon') return 'Coming Soon';
  if (normalized === 'under review') return 'Under Review';
  if (normalized === 'closed') return 'Closed';
  return 'Active';
}

function mapMatchStatus(score: number): Match['status'] {
  if (score >= 90) return 'Ready';
  if (score >= 80) return 'Review';
  return 'Sent';
}

function scoreBreakdownObject(value: JsonValue | null): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function scoreBreakdownList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function rationaleFromBreakdown(
  breakdown: Record<string, unknown>,
  house?: BrokerListingData | null
) {
  const explicit = breakdown.rationale;
  if (typeof explicit === 'string' && explicit.trim()) return explicit.trim();

  const reasons = scoreBreakdownList(breakdown.reasons);
  if (reasons.length) return reasons.slice(0, 3).join(' ');

  const penalties = scoreBreakdownList(breakdown.penalties);
  if (penalties.length) return `Review match details: ${penalties.slice(0, 2).join(' ')}`;

  return `Score generated from buyer criteria and ${house?.address ?? 'house profile'} attributes.`;
}

function nextStepFromScore(score: number) {
  if (score >= 90) return 'Send private preview with showing windows';
  if (score >= 80) return 'Review fit details before sending';
  return 'Keep in nurture and monitor new signals';
}

export function mapBrokerLead(
  row: BrokerLeadRow,
  buyerProfile: BrokerBuyerProfileRow | null = null
): BrokerLeadData {
  const notes = splitNotes(row.notes_md);
  const buyerPreferences = buyerProfile
    ? [
        ...asArray(buyerProfile.must_haves),
        ...asArray(buyerProfile.nice_to_haves),
        ...asArray(buyerProfile.dealbreakers).map((item) => `Avoid: ${item}`)
      ]
    : [];

  return {
    id: row.id,
    name: row.name,
    email: row.email ?? '',
    phone: row.phone ?? '',
    stage: mapLeadStage(row.status),
    temperature: mapLeadTemperature(row.temperature),
    budget: buyerProfile?.budget_max
      ? `Up to ${formatCurrency(buyerProfile.budget_max)}`
      : 'Not set',
    desiredArea: buyerProfile?.location_primary ?? 'Not set',
    intent: row.lead_type === 'buyer' ? 'Buyer search' : 'Seller lead',
    lastContact: formatDate(row.created_at),
    assignedAgent: 'Unassigned',
    notes,
    preferences: buyerPreferences,
    leadType: row.lead_type,
    createdAt: row.created_at,
    buyerProfile,
    raw: row
  };
}

export function mapBrokerListing(
  row: BrokerHouseProfileRow,
  sellerLead: BrokerLeadData | null = null
): BrokerListingData {
  const features = asArray(row.features);

  return {
    id: row.id,
    address: row.address ?? 'Untitled property',
    neighborhood: row.town ?? 'Not set',
    price: formatCurrency(row.list_price),
    beds: numberValue(row.beds) ?? 0,
    baths: numberValue(row.baths) ?? 0,
    sqft: formatInteger(row.sqft),
    status: mapListingStatus(row.status),
    owner: sellerLead?.name ?? row.seller_lead_id,
    agent: 'Unassigned',
    signal: features.length
      ? features.slice(0, 3).join(', ')
      : titleCase(row.property_type) || 'House profile ready',
    sellerLeadId: row.seller_lead_id,
    sellerLead,
    createdAt: row.created_at,
    features,
    featureKeys: asArray(row.feature_keys),
    propertyTypeKey: row.property_type_key,
    raw: row
  };
}

export function mapBrokerMatch(
  row: BrokerMatchRow,
  buyerLead: BrokerLeadData | null = null,
  houseProfile: BrokerListingData | null = null
): BrokerMatchData {
  const score = Math.round(numberValue(row.score) ?? 0);
  const scoreBreakdown = scoreBreakdownObject(row.score_breakdown_json);

  return {
    id: row.id,
    leadId: row.buyer_lead_id,
    listingId: row.house_profile_id,
    score,
    rationale: rationaleFromBreakdown(scoreBreakdown, houseProfile),
    status: mapMatchStatus(score),
    nextStep: nextStepFromScore(score),
    buyerLeadId: row.buyer_lead_id,
    houseProfileId: row.house_profile_id,
    buyerLead,
    houseProfile,
    scoreBreakdown,
    createdAt: row.created_at,
    raw: row
  };
}

async function fetchBuyerProfiles(client: SupabaseClient, leadIds: string[]) {
  if (!leadIds.length) return new Map<string, BrokerBuyerProfileRow>();

  const { data, error } = await client
    .from('buyer_profiles')
    .select(BROKER_BUYER_PROFILE_FIELDS)
    .in('lead_id', leadIds);

  assertNoSupabaseError(error, 'Failed to load buyer_profiles');
  return new Map((data ?? []).map((row) => [row.lead_id as string, row as BrokerBuyerProfileRow]));
}

async function fetchLeadsByIds(client: SupabaseClient, leadIds: string[]) {
  if (!leadIds.length) return new Map<string, BrokerLeadData>();

  const { data, error } = await client.from('leads').select(BROKER_LEAD_FIELDS).in('id', leadIds);
  assertNoSupabaseError(error, 'Failed to load leads');

  const rows = (data ?? []) as BrokerLeadRow[];
  const buyerIds = rows.filter((row) => row.lead_type === 'buyer').map((row) => row.id);
  const buyerProfiles = await fetchBuyerProfiles(client, buyerIds);

  return new Map(
    rows.map((row) => [row.id, mapBrokerLead(row, buyerProfiles.get(row.id) ?? null)])
  );
}

async function fetchHouseProfilesByIds(client: SupabaseClient, houseIds: string[]) {
  if (!houseIds.length) return new Map<string, BrokerListingData>();

  const { data, error } = await client
    .from('house_profiles')
    .select(BROKER_HOUSE_PROFILE_FIELDS)
    .in('id', houseIds);

  assertNoSupabaseError(error, 'Failed to load house_profiles');

  const rows = (data ?? []) as BrokerHouseProfileRow[];
  const sellerLeadIds = [...new Set(rows.map((row) => row.seller_lead_id))];
  const sellerLeads = await fetchLeadsByIds(client, sellerLeadIds);

  return new Map(
    rows.map((row) => [row.id, mapBrokerListing(row, sellerLeads.get(row.seller_lead_id) ?? null)])
  );
}

export async function listBrokerLeads(
  client = createServerSupabaseAdmin()
): Promise<BrokerLeadData[]> {
  const { data, error } = await client
    .from('leads')
    .select(BROKER_LEAD_FIELDS)
    .order('created_at', { ascending: false });

  assertNoSupabaseError(error, 'Failed to load leads');

  const rows = (data ?? []) as BrokerLeadRow[];
  const buyerIds = rows.filter((row) => row.lead_type === 'buyer').map((row) => row.id);
  const buyerProfiles = await fetchBuyerProfiles(client, buyerIds);
  return rows.map((row) => mapBrokerLead(row, buyerProfiles.get(row.id) ?? null));
}

export async function getBrokerLeadById(
  id: string,
  client = createServerSupabaseAdmin()
): Promise<BrokerLeadData | null> {
  const { data, error } = await client
    .from('leads')
    .select(BROKER_LEAD_FIELDS)
    .eq('id', id)
    .maybeSingle();

  assertNoSupabaseError(error, `Failed to load lead ${id}`);
  if (!data) return null;

  const row = data as BrokerLeadRow;
  const buyerProfiles =
    row.lead_type === 'buyer' ? await fetchBuyerProfiles(client, [row.id]) : new Map();
  return mapBrokerLead(row, buyerProfiles.get(row.id) ?? null);
}

export async function listBrokerHouseProfiles(
  client = createServerSupabaseAdmin()
): Promise<BrokerListingData[]> {
  const { data, error } = await client
    .from('house_profiles')
    .select(BROKER_HOUSE_PROFILE_FIELDS)
    .order('created_at', { ascending: false });

  assertNoSupabaseError(error, 'Failed to load house_profiles');

  const rows = (data ?? []) as BrokerHouseProfileRow[];
  const sellerLeadIds = [...new Set(rows.map((row) => row.seller_lead_id))];
  const sellerLeads = await fetchLeadsByIds(client, sellerLeadIds);
  return rows.map((row) => mapBrokerListing(row, sellerLeads.get(row.seller_lead_id) ?? null));
}

export async function getBrokerHouseProfileById(
  id: string,
  client = createServerSupabaseAdmin()
): Promise<BrokerListingData | null> {
  const { data, error } = await client
    .from('house_profiles')
    .select(BROKER_HOUSE_PROFILE_FIELDS)
    .eq('id', id)
    .maybeSingle();

  assertNoSupabaseError(error, `Failed to load house_profile ${id}`);
  if (!data) return null;

  const row = data as BrokerHouseProfileRow;
  const sellerLeads = await fetchLeadsByIds(client, [row.seller_lead_id]);
  return mapBrokerListing(row, sellerLeads.get(row.seller_lead_id) ?? null);
}

export async function createBrokerHouseProfile(
  payload: BrokerHouseProfileMutationPayload,
  client = createServerSupabaseAdmin()
): Promise<BrokerListingData> {
  const { data, error } = await client
    .from('house_profiles')
    .insert(payload)
    .select(BROKER_HOUSE_PROFILE_FIELDS)
    .single();

  assertNoSupabaseError(error, 'Failed to create house_profile');

  const row = data as BrokerHouseProfileRow;
  const sellerLeads = await fetchLeadsByIds(client, [row.seller_lead_id]);
  return mapBrokerListing(row, sellerLeads.get(row.seller_lead_id) ?? null);
}

export async function updateBrokerHouseProfile(
  id: string,
  payload: Partial<BrokerHouseProfileMutationPayload>,
  client = createServerSupabaseAdmin()
): Promise<BrokerListingData | null> {
  const { data, error } = await client
    .from('house_profiles')
    .update(payload)
    .eq('id', id)
    .select(BROKER_HOUSE_PROFILE_FIELDS)
    .maybeSingle();

  assertNoSupabaseError(error, `Failed to update house_profile ${id}`);
  if (!data) return null;

  const row = data as BrokerHouseProfileRow;
  const sellerLeads = await fetchLeadsByIds(client, [row.seller_lead_id]);
  return mapBrokerListing(row, sellerLeads.get(row.seller_lead_id) ?? null);
}

export async function listBrokerMatches(
  client = createServerSupabaseAdmin()
): Promise<BrokerMatchData[]> {
  const { data, error } = await client
    .from('matches')
    .select(BROKER_MATCH_FIELDS)
    .order('score', { ascending: false })
    .order('created_at', { ascending: false });

  assertNoSupabaseError(error, 'Failed to load matches');

  const rows = (data ?? []) as BrokerMatchRow[];
  const buyerLeadIds = [...new Set(rows.map((row) => row.buyer_lead_id))];
  const houseProfileIds = [...new Set(rows.map((row) => row.house_profile_id))];
  const [buyerLeads, houseProfiles] = await Promise.all([
    fetchLeadsByIds(client, buyerLeadIds),
    fetchHouseProfilesByIds(client, houseProfileIds)
  ]);

  return rows.map((row) =>
    mapBrokerMatch(
      row,
      buyerLeads.get(row.buyer_lead_id) ?? null,
      houseProfiles.get(row.house_profile_id) ?? null
    )
  );
}

export async function getBrokerMatchById(
  id: string,
  client = createServerSupabaseAdmin()
): Promise<BrokerMatchData | null> {
  const { data, error } = await client
    .from('matches')
    .select(BROKER_MATCH_FIELDS)
    .eq('id', id)
    .maybeSingle();

  assertNoSupabaseError(error, `Failed to load match ${id}`);
  if (!data) return null;

  const row = data as BrokerMatchRow;
  const [buyerLeads, houseProfiles] = await Promise.all([
    fetchLeadsByIds(client, [row.buyer_lead_id]),
    fetchHouseProfilesByIds(client, [row.house_profile_id])
  ]);

  return mapBrokerMatch(
    row,
    buyerLeads.get(row.buyer_lead_id) ?? null,
    houseProfiles.get(row.house_profile_id) ?? null
  );
}

export async function createBrokerLead(
  payload: BrokerLeadMutationPayload,
  client = createServerSupabaseAdmin()
): Promise<BrokerLeadData> {
  const { data, error } = await client
    .from('leads')
    .insert(payload)
    .select(BROKER_LEAD_FIELDS)
    .single();

  assertNoSupabaseError(error, 'Failed to create lead');
  const row = data as BrokerLeadRow;
  return mapBrokerLead(row);
}

export async function updateBrokerLead(
  id: string,
  payload: Partial<BrokerLeadMutationPayload>,
  client = createServerSupabaseAdmin()
): Promise<BrokerLeadData | null> {
  const { data, error } = await client
    .from('leads')
    .update(payload)
    .eq('id', id)
    .select(BROKER_LEAD_FIELDS)
    .maybeSingle();

  assertNoSupabaseError(error, `Failed to update lead ${id}`);
  if (!data) return null;
  const row = data as BrokerLeadRow;
  const buyerProfiles =
    row.lead_type === 'buyer' ? await fetchBuyerProfiles(client, [row.id]) : new Map();
  return mapBrokerLead(row, buyerProfiles.get(row.id) ?? null);
}

export async function upsertBrokerBuyerProfile(
  payload: BrokerBuyerProfileMutationPayload,
  client = createServerSupabaseAdmin()
): Promise<BrokerBuyerProfileRow> {
  const { data, error } = await client
    .from('buyer_profiles')
    .upsert(payload, { onConflict: 'lead_id' })
    .select(BROKER_BUYER_PROFILE_FIELDS)
    .single();

  assertNoSupabaseError(error, `Failed to upsert buyer_profile ${payload.lead_id}`);
  return data as BrokerBuyerProfileRow;
}

export async function upsertBrokerHouseProfileForSeller(
  payload: BrokerHouseProfileMutationPayload,
  client = createServerSupabaseAdmin()
): Promise<BrokerListingData> {
  const { data: existing, error: existingError } = await client
    .from('house_profiles')
    .select('id')
    .eq('seller_lead_id', payload.seller_lead_id)
    .limit(1)
    .maybeSingle();

  assertNoSupabaseError(
    existingError,
    `Failed to load house_profile for seller ${payload.seller_lead_id}`
  );

  const query = existing?.id
    ? client
        .from('house_profiles')
        .update(payload)
        .eq('id', existing.id)
        .select(BROKER_HOUSE_PROFILE_FIELDS)
        .single()
    : client.from('house_profiles').insert(payload).select(BROKER_HOUSE_PROFILE_FIELDS).single();

  const { data, error } = await query;
  assertNoSupabaseError(
    error,
    `Failed to upsert house_profile for seller ${payload.seller_lead_id}`
  );

  const row = data as BrokerHouseProfileRow;
  const sellerLeads = await fetchLeadsByIds(client, [row.seller_lead_id]);
  return mapBrokerListing(row, sellerLeads.get(row.seller_lead_id) ?? null);
}

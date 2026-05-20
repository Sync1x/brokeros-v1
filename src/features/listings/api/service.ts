import type { BrokerLeadApiData, BrokerListingApiData, HouseProfilesResponse } from './types';

export const HOUSE_PROFILES_ENDPOINT = '/api/brokeros/house-profiles';

export interface FetchHouseProfilesOptions {
  origin?: string;
  headers?: HeadersInit;
}

function makeHouseProfilesUrl(origin?: string) {
  return origin ? new URL(HOUSE_PROFILES_ENDPOINT, origin).toString() : HOUSE_PROFILES_ENDPOINT;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function nullableStringValue(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function numberValue(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function booleanValue(value: unknown) {
  return typeof value === 'boolean' ? value : null;
}

function stringArrayValue(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

async function parseJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();

  if (!contentType.includes('application/json')) {
    const preview = text.replace(/\s+/g, ' ').slice(0, 160);
    throw new Error(
      `House profiles API returned ${response.status} ${response.statusText || 'non-JSON response'}: ${preview}`
    );
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(`House profiles API returned invalid JSON (${response.status}).`);
  }
}

function normalizeLead(value: unknown): BrokerLeadApiData {
  const lead = recordValue(value);

  return {
    id: stringValue(lead.id),
    name: stringValue(lead.name),
    desiredArea: stringValue(lead.desiredArea),
    assignedAgent: stringValue(lead.assignedAgent)
  };
}

function normalizeListing(value: unknown): BrokerListingApiData {
  const listing = recordValue(value);
  const raw = recordValue(listing.raw);

  return {
    id: stringValue(listing.id),
    address: stringValue(listing.address),
    neighborhood: stringValue(listing.neighborhood),
    price: stringValue(listing.price),
    beds: numberValue(listing.beds) ?? 0,
    baths: numberValue(listing.baths) ?? 0,
    sqft: stringValue(listing.sqft),
    status: stringValue(listing.status) || 'Active',
    owner: stringValue(listing.owner),
    sellerLeadId: stringValue(listing.sellerLeadId),
    sellerLead: listing.sellerLead == null ? null : normalizeLead(listing.sellerLead),
    createdAt: nullableStringValue(listing.createdAt),
    features: stringArrayValue(listing.features),
    source: nullableStringValue(listing.source),
    primaryPhotoUrl: nullableStringValue(listing.primaryPhotoUrl),
    mlsListingKey: nullableStringValue(listing.mlsListingKey),
    mlsListingId: nullableStringValue(listing.mlsListingId),
    mlsStatus: nullableStringValue(listing.mlsStatus),
    raw: {
      address: nullableStringValue(raw.address),
      town: nullableStringValue(raw.town),
      state: nullableStringValue(raw.state),
      zip: nullableStringValue(raw.zip),
      beds: numberValue(raw.beds),
      baths: numberValue(raw.baths),
      sqft: numberValue(raw.sqft),
      property_type: nullableStringValue(raw.property_type),
      property_sub_type: nullableStringValue(raw.property_sub_type),
      features: stringArrayValue(raw.features),
      list_price: numberValue(raw.list_price),
      status: nullableStringValue(raw.status),
      created_at: nullableStringValue(raw.created_at),
      source: nullableStringValue(raw.source),
      mls_listing_key: nullableStringValue(raw.mls_listing_key),
      mls_listing_id: nullableStringValue(raw.mls_listing_id),
      mls_status: nullableStringValue(raw.mls_status),
      primary_photo_url: nullableStringValue(raw.primary_photo_url),
      lot_size_acres: numberValue(raw.lot_size_acres),
      garage_spaces: numberValue(raw.garage_spaces),
      garage_yn: booleanValue(raw.garage_yn),
      waterfront_yn: booleanValue(raw.waterfront_yn),
      remarks: nullableStringValue(raw.remarks)
    }
  };
}

function normalizeHouseProfilesResponse(data: Record<string, unknown>): HouseProfilesResponse {
  const houseProfiles = Array.isArray(data.houseProfiles)
    ? data.houseProfiles.map(normalizeListing).filter((listing) => listing.id)
    : [];
  const sellerLeads = Array.isArray(data.sellerLeads)
    ? data.sellerLeads.map(normalizeLead).filter((lead) => lead.id)
    : [];

  return { houseProfiles, sellerLeads };
}

export async function getHouseProfiles({
  origin,
  headers
}: FetchHouseProfilesOptions = {}): Promise<HouseProfilesResponse> {
  const response = await fetch(makeHouseProfilesUrl(origin), {
    cache: 'no-store',
    headers
  });
  const data = parseJsonResponse(response);

  if (!response.ok) {
    const error = await data.then((payload) => nullableStringValue(payload.error));
    throw new Error(error ?? 'Unable to load house profiles.');
  }

  return normalizeHouseProfilesResponse(await data);
}

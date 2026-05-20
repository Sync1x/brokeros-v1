import { runMatchingForAllBuyers } from '@/lib/matching/runMatchingForAllBuyers';
import type { FeatureTerm, PropertyTypeTerm } from '@/lib/vocabulary/canonicalize';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchParagonProperties, getParagonDatasetId } from './client';
import {
  mapParagonPropertyToHouseProfile,
  type MappedParagonHouseProfile
} from './map-paragon-property';

export interface SyncParagonTestListingsResult {
  datasetId: string;
  fetched: number;
  upserted: number;
  skipped: number;
  failed: number;
  firstListingKeys: string[];
  matching: Awaited<ReturnType<typeof runMatchingForAllBuyers>> | null;
}

async function loadVocabulary(client: SupabaseClient) {
  const [featureTermsResult, propertyTypeTermsResult] = await Promise.all([
    client.from('feature_terms').select('key, label, category, aliases, active').order('key'),
    client.from('property_type_terms').select('key, label, aliases, active').order('key')
  ]);

  if (featureTermsResult.error) {
    throw new Error(`Failed to load feature_terms: ${featureTermsResult.error.message}`);
  }
  if (propertyTypeTermsResult.error) {
    throw new Error(`Failed to load property_type_terms: ${propertyTypeTermsResult.error.message}`);
  }

  return {
    featureTerms: (featureTermsResult.data ?? []) as FeatureTerm[],
    propertyTypeTerms: (propertyTypeTermsResult.data ?? []) as PropertyTypeTerm[]
  };
}

function upsertPayload(row: MappedParagonHouseProfile, orgId: string) {
  return {
    org_id: orgId,
    source: row.source,
    mls_provider: row.mls_provider,
    mls_dataset_id: row.mls_dataset_id,
    mls_listing_key: row.mls_listing_key,
    mls_listing_id: row.mls_listing_id,
    list_price: row.list_price,
    status: row.status,
    mls_status: row.mls_status,
    property_type: row.property_type,
    property_type_key: row.property_type_key,
    property_sub_type: row.property_sub_type,
    address: row.address,
    town: row.town,
    state: row.state,
    zip: row.zip,
    beds: row.beds,
    baths: row.baths_decimal ?? row.baths,
    sqft: row.sqft,
    lot_size_acres: row.lot_size_acres,
    garage_spaces: row.garage_spaces,
    garage_yn: row.garage_yn,
    waterfront_yn: row.waterfront_yn,
    features: row.features,
    feature_keys: row.feature_keys,
    remarks: row.remarks,
    mls_modified_at: row.mls_modified_at,
    primary_photo_url: row.primary_photo_url,
    media_json: row.media_json,
    latitude: row.latitude,
    longitude: row.longitude,
    raw_mls_json: row.raw_mls_json
  };
}

export async function syncParagonTestListings(
  orgId: string,
  ownerUserId?: string,
  client?: SupabaseClient
): Promise<SyncParagonTestListingsResult> {
  const supabase =
    client ?? (await import('@/lib/supabase/server-client')).createServerSupabaseAdmin();
  const datasetId = getParagonDatasetId();
  const [{ value }, vocabulary] = await Promise.all([
    fetchParagonProperties({ $top: 50 }),
    loadVocabulary(supabase)
  ]);

  const mapped = value
    .map((row) => mapParagonPropertyToHouseProfile(row, datasetId, vocabulary))
    .filter((row): row is MappedParagonHouseProfile => Boolean(row));

  let upserted = 0;
  let failed = 0;

  if (mapped.length) {
    const { error, count } = await supabase
      .from('house_profiles')
      .upsert(mapped.map((row) => upsertPayload(row, orgId)), {
        onConflict: 'org_id,mls_provider,mls_dataset_id,mls_listing_key',
        count: 'exact'
      })
      .select('id');

    if (error) {
      failed = mapped.length;
      throw new Error(`Failed to upsert Paragon test listings: ${error.message}`);
    }

    upserted = count ?? mapped.length;
  }

  const matching = ownerUserId
    ? await runMatchingForAllBuyers({ orgId, ownerUserId, client: supabase })
    : null;

  return {
    datasetId,
    fetched: value.length,
    upserted,
    skipped: value.length - mapped.length,
    failed,
    firstListingKeys: mapped.map((row) => row.mls_listing_key).slice(0, 5),
    matching
  };
}

import {
  canonicalizeFeatureArray,
  canonicalizePropertyType,
  type FeatureTerm,
  type PropertyTypeTerm
} from '@/lib/vocabulary/canonicalize';
import type { ParagonPropertyRow } from './client';

interface MediaItem {
  MediaURL?: string | null;
  MediaUrl?: string | null;
  mediaUrl?: string | null;
  [key: string]: unknown;
}

export interface ParagonMapperVocabulary {
  featureTerms?: FeatureTerm[];
  propertyTypeTerms?: PropertyTypeTerm[];
}

export interface MappedParagonHouseProfile {
  source: 'paragon_test';
  mls_provider: 'paragon_pic';
  mls_dataset_id: string;
  mls_listing_key: string;
  mls_listing_id: string | null;
  list_price: number | null;
  status: string | null;
  mls_status: string | null;
  property_type: string | null;
  property_type_key: string | null;
  property_sub_type: string | null;
  address: string | null;
  town: string | null;
  state: string | null;
  zip: string | null;
  beds: number | null;
  baths: number | null;
  baths_decimal: number | null;
  sqft: number | null;
  lot_size_acres: number | null;
  garage_spaces: number | null;
  garage_yn: boolean | null;
  waterfront_yn: boolean | null;
  features: string[];
  feature_keys: string[];
  remarks: string | null;
  mls_modified_at: string | null;
  primary_photo_url: string | null;
  media_json: unknown;
  latitude: number | null;
  longitude: number | null;
  raw_mls_json: ParagonPropertyRow;
}

function stringValue(value: unknown) {
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}

function numberValue(value: unknown) {
  if (value == null || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function booleanValue(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (['true', 'yes', 'y', '1'].includes(normalized)) return true;
  if (['false', 'no', 'n', '0'].includes(normalized)) return false;
  return null;
}

function arrayValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => arrayValues(item));
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const likelyValue =
      record.Name ??
      record.Value ??
      record.Label ??
      record.Description ??
      record.LongValue ??
      record.ShortValue;
    return likelyValue == null ? [] : arrayValues(likelyValue);
  }

  const text = stringValue(value);
  if (!text) return [];
  return text
    .split(/[;,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function mediaItems(value: unknown): MediaItem[] {
  return Array.isArray(value) ? (value.filter(Boolean) as MediaItem[]) : [];
}

function primaryPhotoUrl(value: unknown) {
  const [first] = mediaItems(value);
  return stringValue(first?.MediaURL ?? first?.MediaUrl ?? first?.mediaUrl);
}

function deriveFeatures(row: ParagonPropertyRow) {
  const featureValues = [
    ...arrayValues(row.WaterfrontFeatures),
    ...arrayValues(row.Basement),
    ...arrayValues(row.Heating),
    ...arrayValues(row.Cooling),
    ...arrayValues(row.FireplaceFeatures),
    ...arrayValues(row.View),
    ...arrayValues(row.ExteriorFeatures),
    ...arrayValues(row.InteriorFeatures),
    ...arrayValues(row.LotFeatures)
  ];

  if (booleanValue(row.GarageYN)) featureValues.push('garage');
  if ((numberValue(row.GarageSpaces) ?? 0) > 0) featureValues.push('garage');
  if (booleanValue(row.WaterfrontYN)) featureValues.push('waterfront');

  return unique(featureValues);
}

export function mapParagonPropertyToHouseProfile(
  row: ParagonPropertyRow,
  datasetId: string,
  vocabulary: ParagonMapperVocabulary = {}
): MappedParagonHouseProfile | null {
  const listingKey = stringValue(row.ListingKey);
  if (!listingKey) return null;

  const features = deriveFeatures(row);
  const propertyType = stringValue(row.PropertyType);
  const featureKeys = vocabulary.featureTerms?.length
    ? canonicalizeFeatureArray(features, vocabulary.featureTerms).keys
    : [];
  const propertyTypeKey =
    propertyType && vocabulary.propertyTypeTerms?.length
      ? canonicalizePropertyType(propertyType, vocabulary.propertyTypeTerms)
      : null;

  return {
    source: 'paragon_test',
    mls_provider: 'paragon_pic',
    mls_dataset_id: datasetId,
    mls_listing_key: listingKey,
    mls_listing_id: stringValue(row.ListingId),
    list_price: numberValue(row.ListPrice),
    status: stringValue(row.StandardStatus),
    mls_status: stringValue(row.MlsStatus),
    property_type: propertyType,
    property_type_key: propertyTypeKey,
    property_sub_type: stringValue(row.PropertySubType),
    address: stringValue(row.UnparsedAddress),
    town: stringValue(row.City),
    state: stringValue(row.StateOrProvince),
    zip: stringValue(row.PostalCode),
    beds: numberValue(row.BedroomsTotal),
    baths: numberValue(row.BathroomsTotalInteger) ?? numberValue(row.BathroomsTotalDecimal),
    baths_decimal: numberValue(row.BathroomsTotalDecimal),
    sqft: numberValue(row.LivingArea),
    lot_size_acres: numberValue(row.LotSizeAcres),
    garage_spaces: numberValue(row.GarageSpaces),
    garage_yn: booleanValue(row.GarageYN),
    waterfront_yn: booleanValue(row.WaterfrontYN),
    features,
    feature_keys: featureKeys,
    remarks: stringValue(row.PublicRemarks),
    mls_modified_at: stringValue(row.ModificationTimestamp),
    primary_photo_url: primaryPhotoUrl(row.Media),
    media_json: row.Media ?? null,
    latitude: numberValue(row.Latitude),
    longitude: numberValue(row.Longitude),
    raw_mls_json: row
  };
}

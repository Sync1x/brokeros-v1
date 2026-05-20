import { loadEnvConfig } from '@next/env';

export const PARAGON_DEFAULT_SELECT = [
  'ListingKey',
  'ListingId',
  'ListPrice',
  'StandardStatus',
  'MlsStatus',
  'PropertyType',
  'PropertySubType',
  'UnparsedAddress',
  'City',
  'StateOrProvince',
  'PostalCode',
  'BedroomsTotal',
  'BathroomsTotalInteger',
  'BathroomsTotalDecimal',
  'LivingArea',
  'LotSizeAcres',
  'GarageSpaces',
  'GarageYN',
  'WaterfrontYN',
  'WaterfrontFeatures',
  'Basement',
  'Heating',
  'Cooling',
  'FireplaceFeatures',
  'View',
  'ExteriorFeatures',
  'InteriorFeatures',
  'LotFeatures',
  'PublicRemarks',
  'ModificationTimestamp',
  'Media',
  'Latitude',
  'Longitude'
] as const;

export interface ParagonODataParams {
  $top?: number;
  $skip?: number;
  $select?: string | string[];
  $filter?: string;
  $orderby?: string;
  $expand?: string;
}

export interface ParagonPropertyRow {
  ListingKey?: string | number | null;
  ListingId?: string | number | null;
  ListPrice?: number | string | null;
  StandardStatus?: string | null;
  MlsStatus?: string | null;
  PropertyType?: string | null;
  PropertySubType?: string | null;
  UnparsedAddress?: string | null;
  City?: string | null;
  StateOrProvince?: string | null;
  PostalCode?: string | number | null;
  BedroomsTotal?: number | string | null;
  BathroomsTotalInteger?: number | string | null;
  BathroomsTotalDecimal?: number | string | null;
  LivingArea?: number | string | null;
  LotSizeAcres?: number | string | null;
  GarageSpaces?: number | string | null;
  GarageYN?: boolean | string | null;
  WaterfrontYN?: boolean | string | null;
  WaterfrontFeatures?: unknown;
  Basement?: unknown;
  Heating?: unknown;
  Cooling?: unknown;
  FireplaceFeatures?: unknown;
  View?: unknown;
  ExteriorFeatures?: unknown;
  InteriorFeatures?: unknown;
  LotFeatures?: unknown;
  PublicRemarks?: string | null;
  ModificationTimestamp?: string | null;
  Media?: unknown;
  Latitude?: number | string | null;
  Longitude?: number | string | null;
  [key: string]: unknown;
}

export interface ParagonPropertyResponse {
  value: ParagonPropertyRow[];
  nextLink: string | null;
}

let envLoaded = false;

function ensureEnvLoaded() {
  if (envLoaded) return;
  loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production', {
    info: () => {},
    error: () => {}
  });
  envLoaded = true;
}

function envValue(name: string) {
  const direct = process.env[name];
  if (direct?.trim()) return direct.trim();
  ensureEnvLoaded();
  return process.env[name]?.trim();
}

function requiredEnv(name: string) {
  const value = envValue(name);
  if (!value) throw new Error(`Missing required Paragon env var: ${name}`);
  return value;
}

function getParagonConfig() {
  const authMode = envValue('PARAGON_AUTH_MODE') ?? 'query';
  if (authMode !== 'query') {
    throw new Error(`Unsupported PARAGON_AUTH_MODE "${authMode}". Expected "query".`);
  }

  return {
    baseUrl: requiredEnv('PARAGON_API_BASE').replace(/\/$/, ''),
    datasetId: requiredEnv('PARAGON_DATASET_ID'),
    resource: envValue('PARAGON_RESOURCE') ?? 'Property',
    serverToken: requiredEnv('PARAGON_SERVER_TOKEN')
  };
}

function appendODataParams(url: URL, params: ParagonODataParams) {
  const select = params.$select ?? PARAGON_DEFAULT_SELECT;
  const entries: [
    keyof ParagonODataParams,
    string | number | readonly string[] | string[] | undefined
  ][] = [
    ['$top', params.$top],
    ['$skip', params.$skip],
    ['$select', select],
    ['$filter', params.$filter],
    ['$orderby', params.$orderby],
    ['$expand', params.$expand]
  ];

  for (const [key, value] of entries) {
    if (value == null || value === '') continue;
    url.searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
  }
}

function makeParagonPropertyUrl(params: ParagonODataParams = {}) {
  const config = getParagonConfig();
  const url = new URL(`${config.baseUrl}/${config.datasetId}/${config.resource}`);
  url.searchParams.set('access_token', config.serverToken);
  appendODataParams(url, params);
  return url;
}

function asParagonRows(value: unknown): ParagonPropertyRow[] {
  return Array.isArray(value) ? (value as ParagonPropertyRow[]) : [];
}

export function getParagonDatasetId() {
  return envValue('PARAGON_DATASET_ID') ?? 'test_bk';
}

export async function fetchParagonProperties(
  params: ParagonODataParams = {}
): Promise<ParagonPropertyResponse> {
  const url = makeParagonPropertyUrl(params);
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store'
  });
  const text = await response.text();

  if (!response.ok) {
    const message = text.slice(0, 500) || response.statusText;
    throw new Error(`Paragon Property fetch failed (${response.status}): ${message}`);
  }

  const json = JSON.parse(text) as { value?: unknown; '@odata.nextLink'?: string };
  return {
    value: asParagonRows(json.value),
    nextLink: json['@odata.nextLink'] ?? null
  };
}

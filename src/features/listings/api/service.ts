import type { HouseProfilesResponse } from './types';

export const HOUSE_PROFILES_ENDPOINT = '/api/brokeros/house-profiles';

export interface FetchHouseProfilesOptions {
  origin?: string;
  headers?: HeadersInit;
}

function makeHouseProfilesUrl(origin?: string) {
  return origin ? new URL(HOUSE_PROFILES_ENDPOINT, origin).toString() : HOUSE_PROFILES_ENDPOINT;
}

export async function getHouseProfiles({
  origin,
  headers
}: FetchHouseProfilesOptions = {}): Promise<HouseProfilesResponse> {
  const response = await fetch(makeHouseProfilesUrl(origin), {
    cache: 'no-store',
    headers
  });
  const data = (await response.json()) as Partial<HouseProfilesResponse> & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? 'Unable to load house profiles.');
  }

  return {
    houseProfiles: data.houseProfiles ?? [],
    sellerLeads: data.sellerLeads ?? []
  };
}


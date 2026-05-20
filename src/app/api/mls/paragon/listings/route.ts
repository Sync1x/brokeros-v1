import { fetchParagonProperties, getParagonDatasetId } from '@/features/mls/paragon/client';
import { mapParagonPropertyToHouseProfile } from '@/features/mls/paragon/map-paragon-property';
import { requireBrokerosAuth } from '@/lib/auth/require-brokeros-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const authResult = await requireBrokerosAuth();
  if (authResult.unauthorizedResponse) return authResult.unauthorizedResponse;

  const datasetId = getParagonDatasetId();
  const result = await fetchParagonProperties({ $top: 5 });
  return NextResponse.json({
    fetched: result.value.length,
    nextLink: result.nextLink,
    listings: result.value
      .map((row) => mapParagonPropertyToHouseProfile(row, datasetId))
      .filter(Boolean)
  });
}

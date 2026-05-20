import { syncParagonTestListings } from '@/features/mls/paragon/sync';
import { requireBrokerosAuth } from '@/lib/auth/require-brokeros-auth';
import { NextResponse } from 'next/server';

export async function POST() {
  const authResult = await requireBrokerosAuth();
  if (authResult.unauthorizedResponse) return authResult.unauthorizedResponse;

  try {
    const result = await syncParagonTestListings();
    return NextResponse.json({
      fetched: result.fetched,
      mapped: result.fetched - result.skipped,
      upserted: result.upserted,
      skipped: result.skipped,
      failed: result.failed,
      firstListingKeys: result.firstListingKeys
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to sync Paragon test listings.' },
      { status: 500 }
    );
  }
}

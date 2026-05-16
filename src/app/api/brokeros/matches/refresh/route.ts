import { NextResponse } from 'next/server';

import { requireBrokerosAuth } from '@/lib/auth/require-brokeros-auth';
import { runMatchingForAllBuyers } from '@/lib/matching/runMatchingForAllBuyers';
import { createServerSupabaseAdmin } from '@/lib/supabase/server-client';

export async function POST() {
  const authResult = await requireBrokerosAuth();
  if (authResult.unauthorizedResponse) return authResult.unauthorizedResponse;

  try {
    const result = await runMatchingForAllBuyers(createServerSupabaseAdmin());

    return NextResponse.json({
      buyersConsidered: result.buyersConsidered,
      housesConsidered: result.housesConsidered,
      upsertRows: result.upsertRows
    });
  } catch (error) {
    console.error('Unable to refresh BrokerOS matches', error);
    return NextResponse.json({ error: 'Unable to refresh matches' }, { status: 500 });
  }
}

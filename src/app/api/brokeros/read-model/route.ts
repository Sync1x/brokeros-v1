import {
  listBrokerHouseProfiles,
  listBrokerLeads,
  listBrokerMatches
} from '@/features/brokeros/api/data';
import { requireBrokerosAuth } from '@/lib/auth/require-brokeros-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const authResult = await requireBrokerosAuth();
  if (authResult.unauthorizedResponse) return authResult.unauthorizedResponse;

  const [leads, listings, matches] = await Promise.all([
    listBrokerLeads(),
    listBrokerHouseProfiles(),
    listBrokerMatches()
  ]);

  return NextResponse.json({ leads, listings, matches });
}

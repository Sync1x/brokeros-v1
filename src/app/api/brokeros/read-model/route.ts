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

  const scope = { orgId: authResult.orgId, userId: authResult.userId };
  const [leads, listings, matches] = await Promise.all([
    listBrokerLeads(scope),
    listBrokerHouseProfiles(scope),
    listBrokerMatches(scope)
  ]);

  return NextResponse.json({ leads, listings, matches });
}

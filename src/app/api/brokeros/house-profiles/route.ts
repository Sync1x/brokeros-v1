import { listBrokerHouseProfiles, listBrokerSellerLeads } from '@/features/brokeros/api/data';
import { requireBrokerosAuth } from '@/lib/auth/require-brokeros-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const authResult = await requireBrokerosAuth();
  if (authResult.unauthorizedResponse) return authResult.unauthorizedResponse;

  const [houseProfiles, sellerLeads] = await Promise.all([
    listBrokerHouseProfiles(),
    listBrokerSellerLeads()
  ]);

  return NextResponse.json({ houseProfiles, sellerLeads });
}

export async function POST() {
  const authResult = await requireBrokerosAuth();
  if (authResult.unauthorizedResponse) return authResult.unauthorizedResponse;

  return NextResponse.json(
    { error: 'Manual listing creation is disabled. Sync Paragon test listings instead.' },
    { status: 403 }
  );
}

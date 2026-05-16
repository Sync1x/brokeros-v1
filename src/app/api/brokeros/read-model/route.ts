import {
  listBrokerHouseProfiles,
  listBrokerLeads,
  listBrokerMatches
} from '@/features/brokeros/api/data';
import { NextResponse } from 'next/server';

export async function GET() {
  const [leads, listings, matches] = await Promise.all([
    listBrokerLeads(),
    listBrokerHouseProfiles(),
    listBrokerMatches()
  ]);

  return NextResponse.json({ leads, listings, matches });
}

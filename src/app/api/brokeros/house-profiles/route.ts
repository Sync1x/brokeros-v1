import {
  createBrokerHouseProfile,
  listBrokerHouseProfiles,
  listBrokerLeads,
  type BrokerHouseProfileMutationPayload
} from '@/features/brokeros/api/data';
import { requireBrokerosAuth } from '@/lib/auth/require-brokeros-auth';
import { NextResponse } from 'next/server';

type HouseProfileRequestBody = BrokerHouseProfileMutationPayload;

function isSellerLead(lead: Awaited<ReturnType<typeof listBrokerLeads>>[number]) {
  return lead.leadType === 'seller' || lead.raw.lead_type === 'seller';
}

export async function GET() {
  const authResult = await requireBrokerosAuth();
  if (authResult.unauthorizedResponse) return authResult.unauthorizedResponse;

  const [houseProfiles, leads] = await Promise.all([listBrokerHouseProfiles(), listBrokerLeads()]);
  const sellerLeads = leads.filter(isSellerLead);

  return NextResponse.json({ houseProfiles, sellerLeads });
}

export async function POST(request: Request) {
  const authResult = await requireBrokerosAuth();
  if (authResult.unauthorizedResponse) return authResult.unauthorizedResponse;

  const body = (await request.json()) as HouseProfileRequestBody;

  if (!body.seller_lead_id) {
    return NextResponse.json({ error: 'seller_lead_id is required' }, { status: 400 });
  }

  const houseProfile = await createBrokerHouseProfile({
    seller_lead_id: body.seller_lead_id,
    address: body.address ?? null,
    town: body.town ?? null,
    beds: body.beds ?? null,
    baths: body.baths ?? null,
    sqft: body.sqft ?? null,
    property_type: body.property_type ?? null,
    features: body.features ?? null,
    feature_keys: body.feature_keys ?? null,
    property_type_key: body.property_type_key ?? null,
    list_price: body.list_price ?? null,
    status: body.status ?? null
  });

  return NextResponse.json({ houseProfile }, { status: 201 });
}

import {
  createBrokerLead,
  listBrokerHouseProfiles,
  listBrokerLeads,
  upsertBrokerHouseProfileForSeller,
  upsertBrokerBuyerProfile,
  type BrokerBuyerProfileMutationPayload,
  type BrokerHouseProfileMutationPayload,
  type BrokerLeadMutationPayload
} from '@/features/brokeros/api/data';
import { requireBrokerosAuth } from '@/lib/auth/require-brokeros-auth';
import { NextResponse } from 'next/server';

interface BrokerLeadRequestBody {
  lead: BrokerLeadMutationPayload;
  buyerProfile?: Omit<BrokerBuyerProfileMutationPayload, 'lead_id'> | null;
  houseProfile?: Omit<BrokerHouseProfileMutationPayload, 'seller_lead_id'> | null;
}

export async function GET() {
  const authResult = await requireBrokerosAuth();
  if (authResult.unauthorizedResponse) return authResult.unauthorizedResponse;

  const [leads, houseProfiles] = await Promise.all([
    listBrokerLeads(),
    listBrokerHouseProfiles()
  ]);
  return NextResponse.json({ leads, houseProfiles });
}

export async function POST(request: Request) {
  const authResult = await requireBrokerosAuth();
  if (authResult.unauthorizedResponse) return authResult.unauthorizedResponse;

  const body = (await request.json()) as BrokerLeadRequestBody;
  const lead = await createBrokerLead(body.lead);

  if (body.lead.lead_type === 'buyer' && body.buyerProfile) {
    await upsertBrokerBuyerProfile({
      ...body.buyerProfile,
      lead_id: lead.id
    });
  }

  if (body.lead.lead_type === 'seller' && body.houseProfile) {
    await upsertBrokerHouseProfileForSeller({
      ...body.houseProfile,
      seller_lead_id: lead.id
    });
  }

  const leads = await listBrokerLeads();
  return NextResponse.json({ lead: leads.find((item) => item.id === lead.id) ?? lead }, { status: 201 });
}

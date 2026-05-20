import {
  getBrokerLeadById,
  updateBrokerLead,
  upsertBrokerBuyerProfile,
  upsertBrokerHouseProfileForSeller,
  type BrokerBuyerProfileMutationPayload,
  type BrokerHouseProfileMutationPayload,
  type BrokerLeadMutationPayload
} from '@/features/brokeros/api/data';
import { requireBrokerosAuth } from '@/lib/auth/require-brokeros-auth';
import { NextResponse } from 'next/server';

interface BrokerLeadRequestBody {
  lead?: Partial<BrokerLeadMutationPayload>;
  buyerProfile?: Omit<BrokerBuyerProfileMutationPayload, 'lead_id'> | null;
  houseProfile?: Omit<BrokerHouseProfileMutationPayload, 'seller_lead_id'> | null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireBrokerosAuth();
  if (authResult.unauthorizedResponse) return authResult.unauthorizedResponse;
  const scope = { orgId: authResult.orgId, userId: authResult.userId };

  const { id } = await params;
  const body = (await request.json()) as BrokerLeadRequestBody;
  const existingLead = await getBrokerLeadById(id, scope);

  if (!existingLead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  if (body.lead) {
    await updateBrokerLead(id, body.lead, scope);
  }

  if (body.buyerProfile) {
    await upsertBrokerBuyerProfile({
      ...body.buyerProfile,
      lead_id: id
    });
  }

  if (body.houseProfile) {
    await upsertBrokerHouseProfileForSeller({
      ...body.houseProfile,
      seller_lead_id: id
    }, scope);
  }

  const lead = await getBrokerLeadById(id, scope);
  return NextResponse.json({ lead });
}

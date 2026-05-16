import {
  updateBrokerHouseProfile,
  type BrokerHouseProfileMutationPayload
} from '@/features/brokeros/api/data';
import { NextResponse } from 'next/server';

type HouseProfileRequestBody = Partial<BrokerHouseProfileMutationPayload>;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as HouseProfileRequestBody;
  const houseProfile = await updateBrokerHouseProfile(id, body);

  if (!houseProfile) {
    return NextResponse.json({ error: 'House profile not found' }, { status: 404 });
  }

  return NextResponse.json({ houseProfile });
}

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

type BrokerosAuthResult =
  | {
      userId: string;
      unauthorizedResponse?: never;
    }
  | {
      userId?: never;
      unauthorizedResponse: NextResponse<{ error: string }>;
    };

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function requireBrokerosAuth(): Promise<BrokerosAuthResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { unauthorizedResponse: unauthorizedResponse() };
    }

    return { userId };
  } catch {
    return { unauthorizedResponse: unauthorizedResponse() };
  }
}

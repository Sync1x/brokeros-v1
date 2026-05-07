import { hasGoogleCalendarConnection } from '@/lib/google-calendar';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  try {
    const connected = await hasGoogleCalendarConnection(userId);
    return NextResponse.json({ connected });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to check calendar status';
    return NextResponse.json({ connected: false, error: message }, { status: 500 });
  }
}

import { listGoogleCalendarEvents } from '@/lib/google-calendar';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const events = await listGoogleCalendarEvents(userId);

    if (!events) {
      return NextResponse.json({ connected: false, events: [] });
    }

    return NextResponse.json({ connected: true, events });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load calendar events';
    return NextResponse.json({ connected: true, events: [], error: message }, { status: 500 });
  }
}

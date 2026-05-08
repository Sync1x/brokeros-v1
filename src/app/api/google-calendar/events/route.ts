import { listGoogleCalendarEvents } from '@/lib/google-calendar';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // TEMP DEBUG: verify runtime env availability without exposing secret values.
    console.log('[google-calendar/events] env presence', {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL?.trim()),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
      SUPABASE_SERVICE_KEY: Boolean(process.env.SUPABASE_SERVICE_KEY?.trim()),
      GOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID?.trim()),
      GOOGLE_CLIENT_SECRET: Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim()),
      GOOGLE_REDIRECT_URI: Boolean(process.env.GOOGLE_REDIRECT_URI?.trim())
    });

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

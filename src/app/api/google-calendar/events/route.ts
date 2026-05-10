import {
  deleteGoogleCalendarEvent,
  listGoogleCalendarEvents,
  updateGoogleCalendarEvent,
  type GoogleCalendarEventUpdate
} from '@/lib/google-calendar';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

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
    const message =
      error instanceof Error ? error.message : 'Unable to load calendar events';
    return NextResponse.json(
      { connected: true, events: [], error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      eventId?: string;
      calendarId?: string;
      event?: GoogleCalendarEventUpdate;
    };

    if (!body.eventId || !body.event) {
      return NextResponse.json(
        { error: 'Missing event update payload' },
        { status: 400 }
      );
    }

    const event = await updateGoogleCalendarEvent(
      userId,
      body.eventId,
      body.event,
      body.calendarId
    );

    if (!event) {
      return NextResponse.json({ connected: false, event: null });
    }

    return NextResponse.json({ connected: true, event });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to update calendar event';
    return NextResponse.json(
      { connected: true, event: null, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const calendarId = searchParams.get('calendarId') ?? undefined;

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    const deleted = await deleteGoogleCalendarEvent(
      userId,
      eventId,
      calendarId
    );

    if (!deleted) {
      return NextResponse.json({ connected: false, deleted: false });
    }

    return NextResponse.json({ connected: true, deleted: true, eventId });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to delete calendar event';
    return NextResponse.json(
      { connected: true, deleted: false, error: message },
      { status: 500 }
    );
  }
}

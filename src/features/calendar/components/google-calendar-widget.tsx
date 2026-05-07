'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  location?: string;
  htmlLink?: string;
  start?: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  end?: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
}

interface EventsResponse {
  connected: boolean;
  events: GoogleCalendarEvent[];
  error?: string;
}

function eventStart(event: GoogleCalendarEvent) {
  return event.start?.dateTime ?? event.start?.date ?? '';
}

function isToday(value: string) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function formatEventTime(event: GoogleCalendarEvent) {
  if (event.start?.date && !event.start.dateTime) return 'All day';

  const start = event.start?.dateTime ? new Date(event.start.dateTime) : null;
  if (!start) return 'Time TBD';

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  }).format(start);
}

function formatEventDay(event: GoogleCalendarEvent) {
  const value = eventStart(event);
  if (!value) return 'Upcoming';
  if (isToday(value)) return 'Today';

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));
}

function CalendarEventRow({
  event,
  tone = 'default'
}: {
  event: GoogleCalendarEvent;
  tone?: 'today' | 'default';
}) {
  return (
    <div className='grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-3 border-b px-3 py-2 last:border-b-0'>
      <div className='font-mono text-[0.68rem] text-muted-foreground uppercase'>
        {formatEventTime(event)}
      </div>
      <div className='min-w-0'>
        <p className='truncate text-sm font-medium'>{event.summary ?? 'Untitled event'}</p>
        <p className='text-muted-foreground mt-0.5 truncate text-xs'>
          {event.location || formatEventDay(event)}
        </p>
      </div>
      <Badge
        variant='outline'
        className={cn(
          'font-mono text-[0.62rem] uppercase',
          tone === 'today' && 'border-blue-500 bg-blue-500 text-white'
        )}
      >
        {formatEventDay(event)}
      </Badge>
    </div>
  );
}

export function GoogleCalendarWidget() {
  const [data, setData] = useState<EventsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      const response = await fetch('/api/google-calendar/events');
      const nextData = (await response.json()) as EventsResponse;
      if (!cancelled) setData(nextData);
    }

    void loadEvents()
      .catch((error) => {
        if (!cancelled) {
          setData({
            connected: true,
            events: [],
            error: error instanceof Error ? error.message : 'Unable to load calendar events'
          });
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const todayEvents = useMemo(
    () => (data?.events ?? []).filter((event) => isToday(eventStart(event))),
    [data?.events]
  );
  const upcomingEvents = useMemo(
    () => (data?.events ?? []).filter((event) => !isToday(eventStart(event))).slice(0, 6),
    [data?.events]
  );

  return (
    <section className='bg-background overflow-hidden border-y'>
      <div className='flex items-center justify-between border-b px-3 py-2'>
        <div>
          <h2 className='text-sm font-semibold'>Calendar</h2>
          <p className='text-muted-foreground mt-0.5 text-xs'>Today and upcoming events</p>
        </div>
        <Icons.calendar className='text-muted-foreground size-4' />
      </div>

      {isLoading && (
        <div className='grid gap-2 p-3'>
          <Skeleton className='h-10 rounded-none' />
          <Skeleton className='h-10 rounded-none' />
          <Skeleton className='h-10 rounded-none' />
        </div>
      )}

      {!isLoading && data && !data.connected && (
        <div className='p-3'>
          <p className='text-sm font-medium'>Connect Google Calendar</p>
          <p className='text-muted-foreground mt-1 text-xs'>
            Add your calendar in Settings to show meetings beside the action feed.
          </p>
          <Button asChild size='sm' className='mt-3'>
            <Link href='/settings'>Open Settings</Link>
          </Button>
        </div>
      )}

      {!isLoading && data?.error && (
        <div className='border-b p-3'>
          <p className='text-sm font-medium text-destructive'>Calendar unavailable</p>
          <p className='text-muted-foreground mt-1 text-xs'>{data.error}</p>
        </div>
      )}

      {!isLoading && data?.connected && !data.error && data.events.length === 0 && (
        <div className='p-3'>
          <p className='text-sm font-medium'>No upcoming events</p>
          <p className='text-muted-foreground mt-1 text-xs'>Your next two weeks look clear.</p>
        </div>
      )}

      {!isLoading && data?.connected && data.events.length > 0 && (
        <div>
          <div className='border-b'>
            <div className='bg-muted/40 px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase'>
              Today
            </div>
            {todayEvents.length > 0 ? (
              todayEvents.map((event) => (
                <CalendarEventRow key={event.id} event={event} tone='today' />
              ))
            ) : (
              <p className='text-muted-foreground px-3 py-3 text-xs'>No events today.</p>
            )}
          </div>

          <div>
            <div className='bg-muted/40 px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase'>
              Upcoming
            </div>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => <CalendarEventRow key={event.id} event={event} />)
            ) : (
              <p className='text-muted-foreground px-3 py-3 text-xs'>No upcoming events.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

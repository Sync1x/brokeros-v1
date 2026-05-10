'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  colorId?: string;
  calendarId?: string;
  calendarSummary?: string;
  calendarBackgroundColor?: string;
  calendarForegroundColor?: string;
  eventBackgroundColor?: string;
  eventForegroundColor?: string;
  organizer?: {
    email?: string;
    displayName?: string;
    self?: boolean;
  };
  creator?: {
    email?: string;
    displayName?: string;
    self?: boolean;
  };
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

interface EventEditForm {
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description: string;
  location: string;
}

function eventStart(event: GoogleCalendarEvent) {
  return event.start?.dateTime ?? event.start?.date ?? '';
}

function eventKey(event: GoogleCalendarEvent) {
  return `${event.calendarId ?? 'primary'}:${event.id}`;
}

function eventEnd(event: GoogleCalendarEvent) {
  return event.end?.dateTime ?? event.end?.date ?? eventStart(event);
}

function parseEventDate(value: string) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function endOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(23, 59, 59, 999);
  return nextDate;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toDateInputValue(value?: string) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toTimeInputValue(value?: string) {
  if (!value || /^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formFromEvent(event: GoogleCalendarEvent): EventEditForm {
  const startValue = event.start?.dateTime ?? event.start?.date;
  const endValue = event.end?.dateTime ?? event.end?.date;

  return {
    title: event.summary ?? '',
    startDate: toDateInputValue(startValue),
    startTime: toTimeInputValue(startValue),
    endDate: toDateInputValue(endValue || startValue),
    endTime: toTimeInputValue(endValue),
    description: event.description ?? '',
    location: event.location ?? ''
  };
}

function formatTimeRange(event: GoogleCalendarEvent) {
  if (event.start?.date && !event.start.dateTime) return 'All day';

  const start = parseEventDate(eventStart(event));
  const end = parseEventDate(eventEnd(event));
  if (
    !start ||
    !end ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  )
    return 'TBD';

  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function formatDayHeading(date: Date) {
  const label = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }).format(date);

  return isSameDay(date, new Date()) ? `Today, ${label}` : label;
}

function formatDayKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatEventDay(event: GoogleCalendarEvent) {
  const date = parseEventDate(eventStart(event));
  if (!date || Number.isNaN(date.getTime())) return 'Google Calendar';

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

function sourceLabel(event: GoogleCalendarEvent | null) {
  if (!event) return 'Google Calendar';
  return (
    event.organizer?.displayName ??
    event.organizer?.email ??
    event.creator?.displayName ??
    event.creator?.email ??
    'Google Calendar'
  );
}

function sortEvents(events: GoogleCalendarEvent[]) {
  return events.toSorted((a, b) => {
    const aDate =
      parseEventDate(eventStart(a))?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bDate =
      parseEventDate(eventStart(b))?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return aDate - bDate;
  });
}

function isValidHexColor(value?: string) {
  return Boolean(value && /^#[0-9a-f]{6}$/i.test(value));
}

function calendarColor(event: GoogleCalendarEvent) {
  const background =
    event.eventBackgroundColor ??
    event.calendarBackgroundColor ??
    (event.colorId ? GOOGLE_EVENT_COLOR_FALLBACKS[event.colorId] : undefined) ??
    '#4285f4';
  const foreground =
    event.eventForegroundColor ??
    event.calendarForegroundColor ??
    (background.toLowerCase() === '#000000' ? '#ffffff' : '#111827');

  return {
    background: isValidHexColor(background) ? background : '#4285f4',
    foreground: isValidHexColor(foreground) ? foreground : '#111827'
  };
}

function minutesFromDayStart(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function eventsForDay(events: GoogleCalendarEvent[], day: Date) {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  return events.filter((event) => {
    const start = parseEventDate(eventStart(event));
    const end = parseEventDate(eventEnd(event));
    if (
      !start ||
      !end ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return false;
    }

    return start <= dayEnd && end > dayStart;
  });
}

const GOOGLE_EVENT_COLOR_FALLBACKS: Record<string, string> = {
  '1': '#a4bdfc',
  '2': '#7ae7bf',
  '3': '#dbadff',
  '4': '#ff887c',
  '5': '#fbd75b',
  '6': '#ffb878',
  '7': '#46d6db',
  '8': '#e1e1e1',
  '9': '#5484ed',
  '10': '#51b749',
  '11': '#dc2127'
};

const TIMELINE_MARKERS = ['12 AM', '6 AM', '12 PM', '6 PM', '11:59 PM'];
const TIMELINE_HEIGHT = 720;

function buildDateTime(date: string, time: string) {
  if (!date) return undefined;
  if (!time) return { date };

  return {
    dateTime: new Date(`${date}T${time}`).toISOString()
  };
}

function CalendarEventBlock({
  event,
  day,
  selected,
  onClick
}: {
  event: GoogleCalendarEvent;
  day: Date;
  selected: boolean;
  onClick: () => void;
}) {
  const start = parseEventDate(eventStart(event));
  const end = parseEventDate(eventEnd(event));
  const isAllDay = Boolean(event.start?.date && !event.start.dateTime);
  const color = calendarColor(event);
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  const clampedStart = start && start > dayStart ? start : dayStart;
  const clampedEnd = end && end < dayEnd ? end : dayEnd;
  const startMinute = isAllDay ? 0 : minutesFromDayStart(clampedStart);
  const endMinute = isAllDay
    ? 1440
    : Math.max(startMinute + 20, minutesFromDayStart(clampedEnd));
  const top = (startMinute / 1440) * 100;
  const height = Math.max(32, ((endMinute - startMinute) / 1440) * 100);
  const eventStyle = {
    '--event-color': color.background,
    top: `${top}%`,
    height: `${height}%`,
    borderColor: color.background,
    backgroundColor: `${color.background}1f`
  } as CSSProperties;

  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'absolute right-2 left-16 overflow-hidden rounded-md border bg-background/95 px-2.5 py-1.5 text-left shadow-xs transition-all hover:-translate-y-px hover:shadow-sm',
        'before:absolute before:inset-y-1.5 before:left-1.5 before:w-1 before:rounded-full before:bg-[var(--event-color)]',
        selected && 'ring-2 ring-ring/35'
      )}
      style={eventStyle}
      aria-label={`Edit ${event.summary || 'untitled event'}`}
    >
      <div className='min-w-0 pl-3'>
        <p className='truncate text-xs font-semibold leading-tight'>
          {event.summary || 'Untitled event'}
        </p>
        <p className='mt-0.5 truncate font-mono text-[0.62rem] text-muted-foreground uppercase'>
          {formatTimeRange(event)}
        </p>
        <p className='mt-0.5 truncate text-[0.68rem] text-muted-foreground'>
          {event.location || event.calendarSummary || 'Google Calendar'}
        </p>
      </div>
    </button>
  );
}

function DayTimeline({
  day,
  events,
  selectedEventKey,
  onEventClick
}: {
  day: Date;
  events: GoogleCalendarEvent[];
  selectedEventKey?: string;
  onEventClick: (event: GoogleCalendarEvent) => void;
}) {
  const dayEvents = eventsForDay(events, day);

  return (
    <div className='border-b last:border-b-0'>
      <div className='sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-3 py-2 backdrop-blur'>
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold'>
            {formatDayHeading(day)}
          </p>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            12:00 AM - 11:59 PM
          </p>
        </div>
        <span className='font-mono text-[0.68rem] text-muted-foreground uppercase'>
          {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      <div
        className='relative bg-background'
        style={{ height: TIMELINE_HEIGHT }}
      >
        {TIMELINE_MARKERS.map((marker, index) => (
          <div
            key={marker}
            className='absolute right-0 left-0 border-t border-dashed border-border/70'
            style={{ top: `${(index / (TIMELINE_MARKERS.length - 1)) * 100}%` }}
          >
            <span className='absolute -top-2 left-3 bg-background pr-2 font-mono text-[0.62rem] text-muted-foreground uppercase'>
              {marker}
            </span>
          </div>
        ))}

        {dayEvents.length > 0 ? (
          dayEvents.map((event) => (
            <CalendarEventBlock
              key={`${formatDayKey(day)}-${event.calendarId ?? 'primary'}-${event.id}`}
              day={day}
              event={event}
              selected={selectedEventKey === eventKey(event)}
              onClick={() => onEventClick(event)}
            />
          ))
        ) : (
          <div className='absolute inset-x-16 top-1/2 -translate-y-1/2 rounded-md border border-dashed bg-muted/20 px-3 py-2 text-center text-xs text-muted-foreground'>
            No events scheduled.
          </div>
        )}
      </div>
    </div>
  );
}

export function GoogleCalendarWidget() {
  const [data, setData] = useState<EventsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] =
    useState<GoogleCalendarEvent | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editableEventForm, setEditableEventForm] = useState<EventEditForm>(
    () => formFromEvent({ id: '' })
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      const response = await fetch('/api/google-calendar/events');
      const nextData = (await response.json()) as EventsResponse;
      if (!cancelled)
        setData({ ...nextData, events: sortEvents(nextData.events ?? []) });
    }

    void loadEvents()
      .catch((loadError) => {
        if (!cancelled) {
          setData({
            connected: true,
            events: [],
            error:
              loadError instanceof Error
                ? loadError.message
                : 'Unable to load calendar events'
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

  const calendarDays = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 14 }, (_, index) => addDays(today, index));
  }, []);

  function openEventEditor(event: GoogleCalendarEvent) {
    setSelectedEvent(event);
    setEditableEventForm(formFromEvent(event));
    setError(null);
    setIsEditOpen(true);
  }

  function closeEventEditor() {
    setIsEditOpen(false);
    setSelectedEvent(null);
    setError(null);
    setIsSaving(false);
  }

  function handleEventFieldChange(field: keyof EventEditForm, value: string) {
    setEditableEventForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function saveEventChanges() {
    if (!selectedEvent) return;
    setIsSaving(true);
    setError(null);

    const start = buildDateTime(
      editableEventForm.startDate,
      editableEventForm.startTime
    );
    const end = buildDateTime(
      editableEventForm.endDate || editableEventForm.startDate,
      editableEventForm.endTime
    );

    if (!start || !end) {
      setError('Start and end dates are required.');
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/google-calendar/events', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          calendarId: selectedEvent.calendarId,
          event: {
            summary: editableEventForm.title || 'Untitled event',
            description: editableEventForm.description,
            location: editableEventForm.location,
            start,
            end
          }
        })
      });
      const result = (await response.json()) as {
        connected: boolean;
        event: GoogleCalendarEvent | null;
        error?: string;
      };

      if (!response.ok || result.error || !result.event) {
        throw new Error(result.error ?? 'Unable to save calendar event');
      }

      const updatedEvent = result.event;
      setData((current) => {
        if (!current) return current;
        return {
          ...current,
          events: sortEvents(
            current.events.map((event) =>
              eventKey(event) === eventKey(selectedEvent)
                ? {
                    ...event,
                    ...updatedEvent,
                    calendarSummary:
                      updatedEvent.calendarSummary ?? event.calendarSummary,
                    calendarBackgroundColor:
                      updatedEvent.calendarBackgroundColor ??
                      event.calendarBackgroundColor,
                    calendarForegroundColor:
                      updatedEvent.calendarForegroundColor ??
                      event.calendarForegroundColor,
                    eventBackgroundColor:
                      updatedEvent.eventBackgroundColor ??
                      event.eventBackgroundColor,
                    eventForegroundColor:
                      updatedEvent.eventForegroundColor ??
                      event.eventForegroundColor
                  }
                : event
            )
          )
        };
      });
      closeEventEditor();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save calendar event'
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteEvent() {
    if (!selectedEvent) return;
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/google-calendar/events?${new URLSearchParams({
          eventId: selectedEvent.id,
          ...(selectedEvent.calendarId && {
            calendarId: selectedEvent.calendarId
          })
        }).toString()}`,
        {
          method: 'DELETE'
        }
      );
      const result = (await response.json()) as {
        connected: boolean;
        deleted: boolean;
        eventId?: string;
        error?: string;
      };

      if (!response.ok || result.error || !result.deleted) {
        throw new Error(result.error ?? 'Unable to delete calendar event');
      }

      setData((current) => {
        if (!current) return current;
        return {
          ...current,
          events: current.events.filter(
            (event) => eventKey(event) !== eventKey(selectedEvent)
          )
        };
      });
      closeEventEditor();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Unable to delete event'
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <section className='flex h-[calc(100vh-8.75rem)] min-h-[520px] flex-col overflow-hidden rounded-xl border bg-background shadow-xs'>
        <div className='flex items-center justify-between border-b bg-muted/20 px-3 py-2.5'>
          <div className='min-w-0'>
            <h2 className='text-sm font-semibold'>Calendar</h2>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              Full-day Google Calendar view
            </p>
          </div>
          <Button variant='outline' size='icon' aria-label='Calendar widget'>
            <Icons.calendar />
          </Button>
        </div>

        {isLoading && (
          <div className='flex flex-col gap-3 p-3'>
            <Skeleton className='h-10 rounded-md' />
            <Skeleton className='h-56 rounded-md' />
            <Skeleton className='h-56 rounded-md' />
          </div>
        )}

        {!isLoading && data && !data.connected && (
          <div className='p-3'>
            <p className='text-sm font-medium'>Connect Google Calendar</p>
            <p className='mt-1 text-xs text-muted-foreground'>
              Add your calendar in Settings to show meetings beside the action
              feed.
            </p>
            <Button asChild size='sm' className='mt-3'>
              <Link href='/settings'>Open Settings</Link>
            </Button>
          </div>
        )}

        {!isLoading && data?.error && (
          <div className='border-b p-3'>
            <p className='text-sm font-medium text-destructive'>
              Calendar unavailable
            </p>
            <p className='mt-1 text-xs text-muted-foreground'>{data.error}</p>
          </div>
        )}

        {!isLoading && data?.connected && !data.error && (
          <div className='min-h-0 flex-1 overflow-y-auto'>
            {calendarDays.map((day) => (
              <DayTimeline
                key={formatDayKey(day)}
                day={day}
                events={data.events}
                selectedEventKey={
                  selectedEvent ? eventKey(selectedEvent) : undefined
                }
                onEventClick={openEventEditor}
              />
            ))}
          </div>
        )}
      </section>

      <Sheet
        open={isEditOpen}
        onOpenChange={(open) => {
          if (!open) closeEventEditor();
          else setIsEditOpen(true);
        }}
      >
        <SheetContent className='w-full gap-0 p-0 sm:max-w-md'>
          <SheetHeader className='border-b px-4 py-3'>
            <SheetTitle className='text-sm'>Edit Event</SheetTitle>
            <SheetDescription className='text-xs'>
              {selectedEvent?.calendarSummary || sourceLabel(selectedEvent)} ·{' '}
              {selectedEvent
                ? formatEventDay(selectedEvent)
                : 'Google Calendar'}
            </SheetDescription>
          </SheetHeader>

          <div className='min-h-0 flex-1 overflow-y-auto px-4 py-4'>
            <FieldSet>
              <FieldGroup className='gap-4'>
                <Field>
                  <FieldLabel htmlFor='calendar-event-title'>
                    Event title
                  </FieldLabel>
                  <Input
                    id='calendar-event-title'
                    value={editableEventForm.title}
                    onChange={(event) =>
                      handleEventFieldChange('title', event.target.value)
                    }
                  />
                </Field>

                <div className='grid gap-3 sm:grid-cols-2'>
                  <Field>
                    <FieldLabel htmlFor='calendar-event-start-date'>
                      Start date
                    </FieldLabel>
                    <Input
                      id='calendar-event-start-date'
                      type='date'
                      value={editableEventForm.startDate}
                      onChange={(event) =>
                        handleEventFieldChange('startDate', event.target.value)
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='calendar-event-start-time'>
                      Start time
                    </FieldLabel>
                    <Input
                      id='calendar-event-start-time'
                      type='time'
                      value={editableEventForm.startTime}
                      onChange={(event) =>
                        handleEventFieldChange('startTime', event.target.value)
                      }
                    />
                  </Field>
                </div>

                <div className='grid gap-3 sm:grid-cols-2'>
                  <Field>
                    <FieldLabel htmlFor='calendar-event-end-date'>
                      End date
                    </FieldLabel>
                    <Input
                      id='calendar-event-end-date'
                      type='date'
                      value={editableEventForm.endDate}
                      onChange={(event) =>
                        handleEventFieldChange('endDate', event.target.value)
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='calendar-event-end-time'>
                      End time
                    </FieldLabel>
                    <Input
                      id='calendar-event-end-time'
                      type='time'
                      value={editableEventForm.endTime}
                      onChange={(event) =>
                        handleEventFieldChange('endTime', event.target.value)
                      }
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor='calendar-event-location'>
                    Location
                  </FieldLabel>
                  <Input
                    id='calendar-event-location'
                    value={editableEventForm.location}
                    onChange={(event) =>
                      handleEventFieldChange('location', event.target.value)
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor='calendar-event-description'>
                    Description
                  </FieldLabel>
                  <Textarea
                    id='calendar-event-description'
                    className='min-h-24 resize-none'
                    value={editableEventForm.description}
                    onChange={(event) =>
                      handleEventFieldChange('description', event.target.value)
                    }
                  />
                </Field>
              </FieldGroup>
            </FieldSet>

            {error && (
              <div className='mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive'>
                {error}
              </div>
            )}
          </div>

          <SheetFooter className='border-t px-4 py-3 sm:flex-row sm:justify-between'>
            <Button
              type='button'
              variant='ghost'
              className='text-destructive hover:text-destructive'
              disabled={isSaving}
              onClick={deleteEvent}
            >
              <Icons.trash />
              Delete
            </Button>
            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                disabled={isSaving}
                onClick={closeEventEditor}
              >
                Cancel
              </Button>
              <Button
                type='button'
                isLoading={isSaving}
                onClick={saveEventChanges}
              >
                Save
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

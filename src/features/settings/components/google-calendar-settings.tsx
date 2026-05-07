'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';

type CalendarStatus = {
  connected: boolean;
  error?: string;
};

export function GoogleCalendarSettings() {
  const [status, setStatus] = useState<CalendarStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      const response = await fetch('/api/google-calendar/status');
      const data = (await response.json()) as CalendarStatus;
      if (!cancelled) setStatus(data);
    }

    void loadStatus().catch((error) => {
      if (!cancelled) {
        setStatus({
          connected: false,
          error: error instanceof Error ? error.message : 'Unable to check calendar status'
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className='bg-background border-t border-l'>
      <div className='border-r border-b p-3'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div>
            <div className='flex items-center gap-2'>
              <h2 className='font-mono text-xs font-medium tracking-[0.14em] uppercase'>
                Google Calendar
              </h2>
              {status?.connected && (
                <Badge variant='outline' className='border-green-500 bg-green-500 text-white'>
                  Connected
                </Badge>
              )}
            </div>
            <p className='text-muted-foreground mt-1 text-xs'>
              Connect Google Calendar to show today’s meetings and upcoming events in Command
              Center.
            </p>
          </div>
          <Button asChild size='sm' className='shrink-0'>
            <Link href='/api/google-calendar/auth'>
              <Icons.calendar />
              {status?.connected ? 'Reconnect Google Calendar' : 'Add Google Calendar'}
            </Link>
          </Button>
        </div>

        {status?.error && (
          <Alert variant='destructive' className='mt-3 rounded-none'>
            <Icons.warning />
            <AlertTitle>Calendar setup needs attention</AlertTitle>
            <AlertDescription className='text-xs'>{status.error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

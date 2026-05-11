'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ElementType } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

type ConnectorStatus = {
  connected: boolean;
  error?: string;
};

interface ConnectorConfig {
  id: string;
  name: string;
  statusLabel: string;
  connectedLabel: string;
  description: string;
  icon: ElementType<{ className?: string }>;
  isLive: boolean;
  isConnected: boolean;
  connectHref: string;
  settingsAction: () => void;
}

function GoogleCalendarIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-8 place-items-center rounded-md border bg-background shadow-xs',
        className
      )}
      aria-hidden='true'
    >
      <span className='grid size-5 grid-cols-2 overflow-hidden rounded-[4px] border border-background'>
        <span className='bg-blue-500' />
        <span className='bg-red-500' />
        <span className='bg-yellow-400' />
        <span className='bg-green-500' />
      </span>
    </span>
  );
}

function ConnectorBlock({ connector }: { connector: ConnectorConfig }) {
  const Icon = connector.icon;
  const statusText = connector.isConnected ? connector.connectedLabel : connector.statusLabel;

  return (
    <article className='bg-background hover:bg-muted/15 grid min-h-28 grid-cols-[1fr_auto] gap-3 rounded-lg border p-4 transition-colors'>
      <div className='flex min-w-0 gap-3'>
        <Icon className='shrink-0' />
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2'>
            <h3 className='truncate text-sm font-semibold'>{connector.name}</h3>
            <span
              className={cn(
                'text-[0.68rem]',
                connector.isConnected
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-muted-foreground'
              )}
            >
              {statusText}
            </span>
          </div>
          <p className='mt-3 max-w-sm text-xs leading-relaxed text-muted-foreground'>
            {connector.description}
          </p>
        </div>
      </div>

      <div className='self-start'>
        {connector.isConnected ? (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-8 text-muted-foreground'
            onClick={connector.settingsAction}
            aria-label={`Open ${connector.name} settings`}
          >
            <Icons.settings />
          </Button>
        ) : (
          <Button
            asChild
            variant='ghost'
            size='icon'
            className='size-8 text-muted-foreground'
            aria-label={`Connect ${connector.name}`}
          >
            <Link href={connector.connectHref}>
              <Icons.add />
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}

function GoogleCalendarConnectorSettingsModal({
  open,
  onOpenChange,
  status,
  isDisconnecting,
  onDisconnect
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: ConnectorStatus | null;
  isDisconnecting: boolean;
  onDisconnect: () => void;
}) {
  const isConnected = Boolean(status?.connected);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Google Calendar</DialogTitle>
          <DialogDescription>Manage your BrokerOS calendar connection.</DialogDescription>
        </DialogHeader>

        <div className='rounded-lg border p-3'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-sm font-medium'>Connection status</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                {isConnected
                  ? 'BrokerOS can sync schedule, meetings, tasks, and showing-related events.'
                  : 'Google Calendar is not connected.'}
              </p>
            </div>
            <Badge
              variant='outline'
              className={cn(
                isConnected
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-muted-foreground/30 text-muted-foreground'
              )}
            >
              {isConnected ? 'Connected' : 'Not connected'}
            </Badge>
          </div>
          {status?.error && (
            <p className='mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive'>
              {status.error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button asChild variant='outline'>
            <Link href='/api/google-calendar/auth'>Refresh / reconnect</Link>
          </Button>
          <Button
            type='button'
            variant='destructive'
            isLoading={isDisconnecting}
            disabled={!isConnected}
            onClick={onDisconnect}
          >
            Disconnect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsConnectorsSection() {
  const [status, setStatus] = useState<ConnectorStatus | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  async function loadGoogleCalendarStatus() {
    const response = await fetch('/api/google-calendar/status');
    const data = (await response.json()) as ConnectorStatus;
    setStatus(data);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      const response = await fetch('/api/google-calendar/status');
      const data = (await response.json()) as ConnectorStatus;
      if (!cancelled) setStatus(data);
    }

    void loadStatus().catch((error) => {
      if (!cancelled) {
        setStatus({
          connected: false,
          error: error instanceof Error ? error.message : 'Unable to check connector status'
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function disconnectGoogleCalendar() {
    setIsDisconnecting(true);
    try {
      const response = await fetch('/api/google-calendar/status', {
        method: 'DELETE'
      });
      const data = (await response.json()) as ConnectorStatus;
      setStatus(data);
      if (response.ok) setIsSettingsOpen(false);
    } catch (error) {
      setStatus({
        connected: true,
        error: error instanceof Error ? error.message : 'Unable to disconnect Google Calendar'
      });
    } finally {
      setIsDisconnecting(false);
    }
  }

  const connectors = useMemo<ConnectorConfig[]>(
    () => [
      {
        id: 'google-calendar',
        name: 'Google Calendar',
        statusLabel: 'Live',
        connectedLabel: 'Connected',
        description: 'Sync your schedule, meetings, tasks, and showing-related events.',
        icon: GoogleCalendarIcon,
        isLive: true,
        isConnected: Boolean(status?.connected),
        connectHref: '/api/google-calendar/auth',
        settingsAction: () => {
          void loadGoogleCalendarStatus().finally(() => setIsSettingsOpen(true));
        }
      }
    ],
    [status?.connected]
  );

  return (
    <section className='space-y-3'>
      <div>
        <h2 className='text-sm font-semibold'>Connectors</h2>
        <p className='mt-1 text-xs text-muted-foreground'>Connect external tools to BrokerOS.</p>
      </div>

      <div className='grid gap-3 md:grid-cols-2'>
        {connectors.map((connector) => (
          <ConnectorBlock key={connector.id} connector={connector} />
        ))}
      </div>

      <GoogleCalendarConnectorSettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        status={status}
        isDisconnecting={isDisconnecting}
        onDisconnect={disconnectGoogleCalendar}
      />
    </section>
  );
}

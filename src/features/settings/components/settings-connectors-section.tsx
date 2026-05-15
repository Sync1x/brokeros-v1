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
  isLive?: boolean;
  isConnected: boolean;
  connectHref?: string;
  settingsAction?: () => void;
}

function GoogleCalendarIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-6 place-items-center rounded-sm border bg-background shadow-xs',
        className
      )}
      aria-hidden='true'
    >
      <span className='grid size-3.5 grid-cols-2 overflow-hidden rounded-[3px] border border-background'>
        <span className='bg-blue-500' />
        <span className='bg-red-500' />
        <span className='bg-yellow-400' />
        <span className='bg-green-500' />
      </span>
    </span>
  );
}

function GmailIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-6 place-items-center rounded-sm border bg-background text-red-500 shadow-xs',
        className
      )}
      aria-hidden='true'
    >
      <Icons.inbox className='size-3.5' />
    </span>
  );
}

function SmsIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-6 place-items-center rounded-sm border bg-background text-green-600 shadow-xs',
        className
      )}
      aria-hidden='true'
    >
      <Icons.chat className='size-3.5' />
    </span>
  );
}

function OutlookCalendarIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-6 place-items-center rounded-sm border bg-background text-blue-600 shadow-xs',
        className
      )}
      aria-hidden='true'
    >
      <Icons.calendar className='size-3.5' />
    </span>
  );
}

function OutlookMailIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-6 place-items-center rounded-sm border bg-background text-sky-600 shadow-xs',
        className
      )}
      aria-hidden='true'
    >
      <Icons.inbox className='size-3.5' />
    </span>
  );
}

function DriveIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-6 place-items-center rounded-sm border bg-background text-yellow-600 shadow-xs',
        className
      )}
      aria-hidden='true'
    >
      <Icons.folderOpen className='size-3.5' />
    </span>
  );
}

function OneDriveIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-6 place-items-center rounded-sm border bg-background text-blue-500 shadow-xs',
        className
      )}
      aria-hidden='true'
    >
      <Icons.workspace className='size-3.5' />
    </span>
  );
}

function ConnectorBlock({ connector }: { connector: ConnectorConfig }) {
  const Icon = connector.icon;
  const statusText = connector.isConnected ? connector.connectedLabel : connector.statusLabel;
  const isActionable = connector.isLive && connector.connectHref;

  return (
    <article className='bg-background hover:bg-muted/15 grid min-h-0 w-full max-w-44 grid-cols-[1fr_auto] gap-1.5 rounded-md border p-2 transition-colors'>
      <div className='flex min-w-0 gap-1.5'>
        <Icon className='shrink-0' />
        <div className='min-w-0'>
          <div className='flex items-center gap-1.5'>
            <h3 className='truncate text-[0.72rem] font-semibold leading-4'>{connector.name}</h3>
            <span
              className={cn(
                'shrink-0 text-[0.58rem] leading-4',
                connector.isConnected
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-muted-foreground'
              )}
            >
              {statusText}
            </span>
          </div>
          <p className='mt-0.5 line-clamp-2 text-[0.64rem] leading-3.5 text-muted-foreground'>
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
            className='size-6 text-muted-foreground'
            onClick={connector.settingsAction}
            aria-label={`Open ${connector.name} settings`}
          >
            <Icons.settings />
          </Button>
        ) : isActionable ? (
          <Button
            asChild
            variant='ghost'
            size='icon'
            className='size-6 text-muted-foreground'
            aria-label={`Connect ${connector.name}`}
          >
            <Link href={connector.connectHref ?? '#'}>
              <Icons.add />
            </Link>
          </Button>
        ) : (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='size-6 text-muted-foreground'
            disabled
            aria-label={`${connector.name} coming soon`}
          >
            <Icons.lock />
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
        description: 'Sync meetings and showings.',
        icon: GoogleCalendarIcon,
        isLive: true,
        isConnected: Boolean(status?.connected),
        connectHref: '/api/google-calendar/auth',
        settingsAction: () => {
          void loadGoogleCalendarStatus().finally(() => setIsSettingsOpen(true));
        }
      },
      {
        id: 'gmail',
        name: 'Gmail',
        statusLabel: 'Soon',
        connectedLabel: 'Connected',
        description: 'Email sync and send actions.',
        icon: GmailIcon,
        isConnected: false
      },
      {
        id: 'sms',
        name: 'SMS',
        statusLabel: 'Soon',
        connectedLabel: 'Connected',
        description: 'Text lead follow-ups.',
        icon: SmsIcon,
        isConnected: false
      },
      {
        id: 'outlook-calendar',
        name: 'Outlook Calendar',
        statusLabel: 'Soon',
        connectedLabel: 'Connected',
        description: 'Microsoft calendar sync.',
        icon: OutlookCalendarIcon,
        isConnected: false
      },
      {
        id: 'outlook-mail',
        name: 'Outlook Mail',
        statusLabel: 'Soon',
        connectedLabel: 'Connected',
        description: 'Microsoft mail sync.',
        icon: OutlookMailIcon,
        isConnected: false
      },
      {
        id: 'google-drive',
        name: 'Google Drive',
        statusLabel: 'Soon',
        connectedLabel: 'Connected',
        description: 'Docs and file access.',
        icon: DriveIcon,
        isConnected: false
      },
      {
        id: 'onedrive',
        name: 'OneDrive',
        statusLabel: 'Soon',
        connectedLabel: 'Connected',
        description: 'Microsoft file access.',
        icon: OneDriveIcon,
        isConnected: false
      }
    ],
    [status?.connected]
  );

  return (
    <section className='space-y-2'>
      <div>
        <h2 className='text-sm font-semibold'>Connectors</h2>
        <p className='mt-1 text-xs text-muted-foreground'>Connect external tools to BrokerOS.</p>
      </div>

      <div className='grid grid-cols-[repeat(auto-fill,minmax(10.25rem,11rem))] gap-2'>
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

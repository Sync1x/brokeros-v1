'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type {
  CommandAction,
  CommandActionState,
  CommandPace
} from '../api/types';

const STORAGE_KEY = 'brokeros:command-center-action-state';

type StoredActionState = Record<
  string,
  {
    state: CommandActionState;
    snoozedUntil?: string;
    dismissReason?: string;
  }
>;

interface CommandCenterWorkbenchProps {
  actions: CommandAction[];
  pace: CommandPace;
  sideSlot?: ReactNode;
}

const typeLabels: Record<CommandAction['type'], string> = {
  new_lead: 'Speed-to-lead',
  follow_up: 'Follow-up',
  match_ready: 'Ready to send',
  showing_prep: 'Showing prep',
  deal_blocker: 'Deal blocker',
  seller_launch: 'Seller launch',
  offer_task: 'Offer task'
};

function priorityClass(priority: CommandAction['priority']) {
  if (priority === 'critical') return 'border-destructive/40 text-destructive';
  if (priority === 'high') return 'border-primary/35 text-primary';
  return 'border-muted-foreground/30 text-muted-foreground';
}

function readStoredState() {
  if (typeof window === 'undefined') return {};

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored) as StoredActionState;
  } catch {
    return {};
  }
}

function writeStoredState(state: StoredActionState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function mergeActionState(
  action: CommandAction,
  storedState: StoredActionState
): CommandAction {
  const saved = storedState[action.id];
  if (!saved) return action;

  return {
    ...action,
    state: saved.state,
    snoozedUntil: saved.snoozedUntil,
    dismissReason: saved.dismissReason
  };
}

function isVisibleAction(action: CommandAction, now: Date) {
  if (action.state === 'done') return false;
  if (action.state !== 'snoozed') return true;
  if (!action.snoozedUntil) return true;
  return new Date(action.snoozedUntil) <= now;
}

function snoozeUntilNextMorning() {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  next.setHours(9, 0, 0, 0);
  return next.toISOString();
}

function ActionCard({
  action,
  onDone,
  onSnooze
}: {
  action: CommandAction;
  onDone: (action: CommandAction) => void;
  onSnooze: (action: CommandAction) => void;
}) {
  return (
    <article className='rounded-xl border bg-background p-3 shadow-xs'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge
              variant='outline'
              className={cn(
                'rounded-md font-mono text-[0.62rem] uppercase',
                priorityClass(action.priority)
              )}
            >
              {action.priority}
            </Badge>
            <span className='font-mono text-[0.66rem] text-muted-foreground uppercase'>
              {typeLabels[action.type]}
            </span>
          </div>
          <h3 className='mt-2 text-sm font-semibold leading-tight'>
            {action.title}
          </h3>
          <p className='mt-1 text-xs text-muted-foreground'>{action.whyNow}</p>
        </div>
        <div className='shrink-0 text-right'>
          <p className='font-mono text-[0.64rem] text-muted-foreground uppercase'>
            Due
          </p>
          <p className='mt-1 font-mono text-xs font-medium'>
            {action.dueAt ?? 'Today'}
          </p>
        </div>
      </div>

      <div className='mt-3 rounded-lg border bg-muted/15 px-3 py-2'>
        <p className='font-mono text-[0.62rem] text-muted-foreground uppercase'>
          Next action
        </p>
        <p className='mt-1 text-xs font-medium'>{action.nextAction}</p>
      </div>

      <div className='mt-3 flex flex-wrap gap-1.5'>
        {action.sourceFacts.map((fact) => (
          <span
            key={fact}
            className='rounded-md border bg-background px-2 py-1 text-[0.68rem] text-muted-foreground'
          >
            {fact}
          </span>
        ))}
      </div>

      <div className='mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3'>
        <div className='flex flex-wrap gap-2'>
          <Button asChild size='sm'>
            <Link href={action.primaryHref}>{action.primaryCtaLabel}</Link>
          </Button>
          {action.secondaryHref && action.secondaryCtaLabel && (
            <Button asChild variant='outline' size='sm'>
              <Link href={action.secondaryHref}>
                {action.secondaryCtaLabel}
              </Link>
            </Button>
          )}
        </div>
        <div className='flex gap-1.5'>
          <Button
            variant='ghost'
            size='sm'
            type='button'
            onClick={() => onSnooze(action)}
          >
            Snooze
          </Button>
          <Button
            variant='outline'
            size='sm'
            type='button'
            onClick={() => onDone(action)}
          >
            Done
          </Button>
        </div>
      </div>
    </article>
  );
}

function ActionWidget({
  title,
  description,
  actions
}: {
  title: string;
  description: string;
  actions: CommandAction[];
}) {
  return (
    <section className='rounded-xl border bg-background shadow-xs'>
      <div className='border-b bg-muted/20 px-3 py-2.5'>
        <div className='flex items-center justify-between gap-3'>
          <div className='min-w-0'>
            <h2 className='text-sm font-semibold'>{title}</h2>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              {description}
            </p>
          </div>
          <span className='font-mono text-xs text-muted-foreground'>
            {actions.length}
          </span>
        </div>
      </div>
      <div className='flex flex-col gap-2 p-3'>
        {actions.length > 0 ? (
          actions.slice(0, 3).map((action) => (
            <Link
              key={action.id}
              href={action.primaryHref}
              className='rounded-lg border px-3 py-2 transition-colors hover:bg-muted/35'
            >
              <p className='truncate text-xs font-semibold'>{action.title}</p>
              <p className='mt-1 line-clamp-2 text-xs text-muted-foreground'>
                {action.whyNow}
              </p>
            </Link>
          ))
        ) : (
          <p className='rounded-lg border border-dashed bg-muted/20 px-3 py-4 text-center text-xs text-muted-foreground'>
            Nothing urgent here.
          </p>
        )}
      </div>
    </section>
  );
}

function PaceCard({ pace }: { pace: CommandPace }) {
  return (
    <section className='rounded-xl border bg-background p-3 shadow-xs'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='text-sm font-semibold'>{pace.label}</p>
          <p className='mt-1 text-xs text-muted-foreground'>
            Keep outreach moving without turning this into analytics.
          </p>
        </div>
        <Icons.phone className='mt-0.5 text-muted-foreground' />
      </div>
      <div className='mt-3 grid grid-cols-2 gap-2'>
        <div className='rounded-lg border bg-muted/15 px-3 py-2'>
          <p className='font-mono text-xl font-semibold'>
            {pace.contactsToday}
          </p>
          <p className='text-[0.68rem] text-muted-foreground uppercase'>
            Today
          </p>
        </div>
        <div className='rounded-lg border bg-muted/15 px-3 py-2'>
          <p className='font-mono text-xl font-semibold'>
            {pace.contactsThisWeek}
          </p>
          <p className='text-[0.68rem] text-muted-foreground uppercase'>
            This week
          </p>
        </div>
      </div>
    </section>
  );
}

function EmptyQueue() {
  return (
    <div className='rounded-xl border border-dashed bg-muted/20 p-6 text-center'>
      <p className='text-sm font-semibold'>
        Nothing urgent. Good time to prospect.
      </p>
      <p className='mt-1 text-xs text-muted-foreground'>
        Add a lead, review cold leads, or schedule outreach while the queue is
        quiet.
      </p>
      <div className='mt-4 flex flex-wrap justify-center gap-2'>
        <Button asChild size='sm'>
          <Link href='/leads'>Add Lead</Link>
        </Button>
        <Button asChild variant='outline' size='sm'>
          <Link href='/leads'>Review Cold Leads</Link>
        </Button>
        <Button asChild variant='outline' size='sm'>
          <Link href='/settings'>Open Calendar</Link>
        </Button>
      </div>
    </div>
  );
}

export function CommandCenterWorkbench({
  actions,
  pace,
  sideSlot
}: CommandCenterWorkbenchProps) {
  const [storedState, setStoredState] = useState<StoredActionState>({});

  useEffect(() => {
    setStoredState(readStoredState());
  }, []);

  function updateActionState(
    action: CommandAction,
    value: StoredActionState[string]
  ) {
    setStoredState((current) => {
      const next = {
        ...current,
        [action.id]: value
      };
      writeStoredState(next);
      return next;
    });
  }

  const visibleActions = useMemo(() => {
    const now = new Date();
    return actions
      .map((action) => mergeActionState(action, storedState))
      .filter((action) => isVisibleAction(action, now));
  }, [actions, storedState]);

  const speedToLeadActions = visibleActions.filter(
    (action) => action.type === 'new_lead'
  );
  const readyToSendActions = visibleActions.filter(
    (action) => action.type === 'match_ready'
  );
  const blockerActions = visibleActions.filter(
    (action) => action.type === 'deal_blocker'
  );
  const followUpActions = visibleActions.filter(
    (action) => action.type === 'follow_up'
  );

  return (
    <div className='grid min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_360px]'>
      <div className='flex min-w-0 flex-col gap-3'>
        <section className='rounded-xl border bg-background shadow-xs'>
          <div className='border-b bg-muted/20 px-3 py-3'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <h2 className='text-base font-semibold'>
                  Priority Action Queue
                </h2>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Ranked by urgency, decay risk, deal value, and recency.
                </p>
              </div>
              <Badge
                variant='outline'
                className='rounded-md font-mono text-[0.65rem] uppercase'
              >
                {visibleActions.length} active
              </Badge>
            </div>
          </div>
          <div className='flex flex-col gap-3 p-3'>
            {visibleActions.length > 0 ? (
              visibleActions.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  onDone={(nextAction) =>
                    updateActionState(nextAction, {
                      state: 'done',
                      dismissReason: 'Handled from command center'
                    })
                  }
                  onSnooze={(nextAction) =>
                    updateActionState(nextAction, {
                      state: 'snoozed',
                      snoozedUntil: snoozeUntilNextMorning(),
                      dismissReason: 'Snoozed until tomorrow morning'
                    })
                  }
                />
              ))
            ) : (
              <EmptyQueue />
            )}
          </div>
        </section>

        <div className='grid gap-3 lg:grid-cols-2'>
          <ActionWidget
            title='Speed-to-Lead'
            description='Fresh or neglected people to contact now.'
            actions={speedToLeadActions}
          />
          <ActionWidget
            title='Ready to Send'
            description='Matches that are clean enough to preview.'
            actions={readyToSendActions}
          />
          <ActionWidget
            title='Deal Blockers'
            description='Missing items stopping movement.'
            actions={blockerActions}
          />
          <ActionWidget
            title='Follow-Up Cadence'
            description='People who need a specific reason to hear from you.'
            actions={followUpActions}
          />
        </div>
      </div>

      <aside className='flex min-w-0 flex-col gap-3'>
        {sideSlot}
        <PaceCard pace={pace} />
      </aside>
    </div>
  );
}

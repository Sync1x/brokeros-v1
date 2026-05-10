'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CommandAction, CommandActionState, CommandPace } from '../api/types';

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
  new_lead: 'Lead',
  follow_up: 'Follow-up',
  match_ready: 'Ready',
  showing_prep: 'Showing',
  deal_blocker: 'Blocker',
  seller_launch: 'Seller',
  offer_task: 'Offer'
};

function priorityClass(priority: CommandAction['priority']) {
  if (priority === 'critical') return 'border-red-500 bg-red-500 text-white';
  if (priority === 'high') return 'border-orange-500 bg-orange-500 text-white';
  return 'border-blue-500 bg-blue-500 text-white';
}

function PriorityBadge({ priority }: { priority: CommandAction['priority'] }) {
  return (
    <Badge
      variant='outline'
      className={cn('font-mono text-[0.62rem] uppercase', priorityClass(priority))}
    >
      {priority}
    </Badge>
  );
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

function mergeActionState(action: CommandAction, storedState: StoredActionState): CommandAction {
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
  isSelected,
  onSelect,
  onDone,
  onSnooze
}: {
  action: CommandAction;
  isSelected: boolean;
  onSelect: (action: CommandAction) => void;
  onDone: (action: CommandAction) => void;
  onSnooze: (action: CommandAction) => void;
}) {
  return (
    <article className='border-b py-2 last:border-b-0'>
      <div className='grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-3'>
        <button
          type='button'
          onClick={() => onSelect(action)}
          className='grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 text-left'
          aria-expanded={isSelected}
        >
          <PriorityBadge priority={action.priority} />
          <h3
            className={cn(
              'truncate text-sm font-semibold leading-tight transition-colors hover:text-primary',
              isSelected && 'text-primary'
            )}
          >
            {action.title}
          </h3>
        </button>

        <div className='flex gap-1'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 px-2 text-muted-foreground'
            type='button'
            onClick={() => onSnooze(action)}
          >
            Snooze
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 px-2 text-muted-foreground'
            type='button'
            onClick={() => onDone(action)}
          >
            Done
          </Button>
        </div>
      </div>

      {isSelected && (
        <div className='mt-2 rounded-lg bg-muted/30 px-3 py-2.5'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='font-mono text-sm font-semibold'>
              {action.contactPhone ?? 'No phone on file'}
            </span>
            {action.contactEmail ? (
              <Button asChild size='sm' variant='outline' className='h-7 px-2.5'>
                <a href={`mailto:${action.contactEmail}`}>Email</a>
              </Button>
            ) : (
              <Button size='sm' variant='outline' className='h-7 px-2.5' disabled>
                Email
              </Button>
            )}
            <PriorityBadge priority={action.priority} />
            <span className='font-mono text-[0.62rem] text-muted-foreground uppercase'>
              {typeLabels[action.type]} / {action.dueAt ?? 'Today'}
            </span>
          </div>
          <p className='mt-2 text-xs font-medium'>{action.nextAction}</p>
          <p className='mt-1 text-xs text-muted-foreground'>{action.whyNow}</p>
          <div className='mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.68rem] text-muted-foreground'>
            {action.sourceFacts.map((fact) => (
              <span key={fact}>{fact}</span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function ContactsStat({ pace }: { pace: CommandPace }) {
  return (
    <div className='text-right'>
      <p className='text-[0.6rem] font-medium text-muted-foreground uppercase'>Contacts made</p>
      <p className='font-mono text-xs font-semibold'>
        {pace.contactsToday} today / {pace.contactsThisWeek} this week
      </p>
    </div>
  );
}

function ActionLine({ title, actions }: { title: string; actions: CommandAction[] }) {
  const preview = actions
    .slice(0, 2)
    .map((action) => action.personName)
    .join(', ');

  return (
    <div className='grid grid-cols-[8rem_minmax(0,1fr)_auto] items-center gap-3 border-b py-2 last:border-b-0'>
      <p className='truncate text-xs font-medium'>{title}</p>
      <p className='truncate text-xs text-muted-foreground'>{preview || 'Clear'}</p>
      <div className='flex size-6 items-center justify-center rounded-full bg-muted text-[0.68rem] font-medium'>
        {actions.length}
      </div>
    </div>
  );
}

function EmptyQueue() {
  return (
    <div className='border-y border-dashed py-8 text-center'>
      <p className='text-sm font-semibold'>Nothing urgent. Good time to prospect.</p>
      <p className='mt-1 text-xs text-muted-foreground'>
        Add a lead, review cold leads, or schedule outreach while the queue is quiet.
      </p>
      <div className='mt-4 flex flex-wrap justify-center gap-2'>
        <Button asChild variant='outline' size='sm'>
          <Link href='/leads'>Review Cold Leads</Link>
        </Button>
        <Button asChild variant='outline' size='sm'>
          <Link href='/inbox'>Open Email</Link>
        </Button>
      </div>
    </div>
  );
}

export function CommandCenterWorkbench({ actions, pace, sideSlot }: CommandCenterWorkbenchProps) {
  const [storedState, setStoredState] = useState<StoredActionState>({});
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  useEffect(() => {
    setStoredState(readStoredState());
  }, []);

  function updateActionState(action: CommandAction, value: StoredActionState[string]) {
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

  useEffect(() => {
    if (selectedActionId && !visibleActions.some((action) => action.id === selectedActionId)) {
      setSelectedActionId(null);
    }
  }, [selectedActionId, visibleActions]);

  const speedToLeadActions = visibleActions.filter((action) => action.type === 'new_lead');
  const readyToSendActions = visibleActions.filter((action) => action.type === 'match_ready');
  const blockerActions = visibleActions.filter((action) => action.type === 'deal_blocker');
  const followUpActions = visibleActions.filter((action) => action.type === 'follow_up');

  return (
    <div className='grid w-full min-h-0 gap-4 lg:h-[calc(100dvh-4.75rem)] lg:grid-cols-[minmax(0,1fr)_340px] lg:overflow-hidden'>
      <div className='grid min-w-0 gap-4 lg:min-h-0 lg:grid-rows-[minmax(0,1fr)_auto] lg:overflow-hidden'>
        <section className='flex min-h-0 flex-col overflow-hidden rounded-xl border bg-background shadow-xs'>
          <div className='flex items-center justify-between gap-3 border-b bg-muted/20 px-3 py-2.5'>
            <div className='min-w-0'>
              <div className='flex items-center gap-2'>
                <h2 className='text-base font-semibold'>Priority queue</h2>
                <Badge
                  variant='secondary'
                  className='rounded-full px-2 font-mono text-[0.62rem] uppercase'
                >
                  {visibleActions.length}
                </Badge>
              </div>
            </div>
          </div>

          <div className='min-h-0 overflow-y-auto px-3'>
            {visibleActions.length > 0 ? (
              <div>
                {visibleActions.map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    isSelected={selectedActionId === action.id}
                    onSelect={(nextAction) =>
                      setSelectedActionId((current) =>
                        current === nextAction.id ? null : nextAction.id
                      )
                    }
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
                ))}
              </div>
            ) : (
              <EmptyQueue />
            )}
          </div>
        </section>

        <section className='min-h-0'>
          <div className='mb-1 flex items-center justify-between gap-3'>
            <h2 className='text-xs font-semibold uppercase text-muted-foreground'>Focus</h2>
          </div>
          <div>
            <ActionLine title='Speed-to-lead' actions={speedToLeadActions} />
            <ActionLine title='Ready to send' actions={readyToSendActions} />
            <ActionLine title='Blockers' actions={blockerActions} />
            <ActionLine title='Follow-up' actions={followUpActions} />
          </div>
        </section>
      </div>

      <aside className='ml-auto flex w-full min-w-0 flex-col gap-3 lg:w-[340px] lg:min-h-0 lg:justify-self-end lg:overflow-hidden'>
        <ContactsStat pace={pace} />
        {sideSlot}
      </aside>
    </div>
  );
}

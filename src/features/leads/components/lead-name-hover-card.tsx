'use client';

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type LeadHoverProfile = {
  name: string;
  eyebrow?: string;
  status?: string;
  summary?: string;
  details: {
    label: string;
    value: string;
  }[];
  notes?: string[];
};

export function LeadNameHoverCard({
  profile,
  children,
  className
}: {
  profile: LeadHoverProfile;
  children: ReactNode;
  className?: string;
}) {
  return (
    <HoverCard openDelay={2000} closeDelay={180}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent
        side='top'
        align='start'
        sideOffset={10}
        collisionPadding={16}
        className={cn(
          'w-80 overflow-hidden rounded-sm p-0 shadow-[0_18px_50px_rgba(15,23,42,0.18)]',
          className
        )}
      >
        <div className='max-h-[420px] overflow-y-auto'>
          <div className='border-b bg-muted/25 px-3 py-3'>
            <p className='font-mono text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase'>
              {profile.eyebrow ?? 'Lead Profile'}
            </p>
            <div className='mt-1 flex items-start justify-between gap-3'>
              <h3 className='min-w-0 text-sm font-semibold break-words'>{profile.name}</h3>
              {profile.status && (
                <span className='shrink-0 border px-1.5 py-0.5 font-mono text-[0.62rem] text-muted-foreground uppercase'>
                  {profile.status}
                </span>
              )}
            </div>
            {profile.summary && (
              <p className='mt-2 text-xs leading-5 text-muted-foreground'>{profile.summary}</p>
            )}
          </div>

          <dl className='divide-y text-xs'>
            {profile.details.map((detail) => (
              <div
                key={`${detail.label}-${detail.value}`}
                className='grid grid-cols-[92px_1fr] gap-2 px-3 py-2'
              >
                <dt className='font-mono text-[0.62rem] tracking-[0.12em] text-muted-foreground uppercase'>
                  {detail.label}
                </dt>
                <dd className='min-w-0 font-medium break-words'>{detail.value || '-'}</dd>
              </div>
            ))}
          </dl>

          {profile.notes && profile.notes.length > 0 && (
            <div className='border-t px-3 py-3'>
              <p className='font-mono text-[0.62rem] tracking-[0.12em] text-muted-foreground uppercase'>
                Details
              </p>
              <ul className='mt-2 space-y-1.5'>
                {profile.notes.map((note) => (
                  <li key={note} className='border-l pl-2 text-xs leading-5 text-muted-foreground'>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

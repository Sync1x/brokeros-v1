'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { brokerLeads, brokerListings, brokerMatches } from '@/constants/brokeros-mock-data';
import { LeadNameHoverCard } from '@/features/leads/components/lead-name-hover-card';
import { brokerLeadHoverProfile } from '@/features/leads/utils/lead-hover-profile';
import type { Lead } from '@/types/brokeros';

export function MatchInspector() {
  const pathname = usePathname();
  const [, section, id] = pathname.split('/');

  if (!id || (section !== 'leads' && section !== 'listings' && section !== 'matches')) {
    return null;
  }

  if (section === 'leads') {
    const lead = brokerLeads.find((item) => item.id === id);
    if (!lead) return null;
    const matches = brokerMatches.filter((match) => match.leadId === lead.id);

    return (
      <InspectorShell
        eyebrow='Selected Lead'
        title={
          <LeadNameHoverCard profile={brokerLeadHoverProfile(lead)}>
            <span className='underline-offset-4 hover:text-primary hover:underline'>
              {lead.name}
            </span>
          </LeadNameHoverCard>
        }
      >
        <dl className='divide-y text-xs'>
          <InspectorRow label='Budget' value={lead.budget} mono />
          <InspectorRow label='Area' value={lead.desiredArea} />
          <InspectorRow label='Stage' value={lead.stage} mono />
          <InspectorRow label='Contact' value={lead.lastContact} mono />
        </dl>
        <InspectorSection title='Matched Listings'>
          {matches.map((match) => {
            const listing = brokerListings.find((item) => item.id === match.listingId)!;
            return (
              <RelatedLink
                key={match.id}
                href={`/matches/${match.id}`}
                title={listing.address}
                meta={`${match.score}% / ${match.nextStep}`}
              />
            );
          })}
        </InspectorSection>
      </InspectorShell>
    );
  }

  if (section === 'listings') {
    const listing = brokerListings.find((item) => item.id === id);
    if (!listing) return null;
    const matches = brokerMatches.filter((match) => match.listingId === listing.id);

    return (
      <InspectorShell eyebrow='Selected Listing' title={listing.address}>
        <dl className='divide-y text-xs'>
          <InspectorRow label='Price' value={listing.price} mono />
          <InspectorRow label='Area' value={listing.neighborhood} />
          <InspectorRow label='Profile' value={`${listing.beds} bd / ${listing.baths} ba`} mono />
          <InspectorRow label='Status' value={listing.status} mono />
        </dl>
        <InspectorSection title='Matching Leads'>
          {matches.map((match) => {
            const lead = brokerLeads.find((item) => item.id === match.leadId)!;
            return (
              <RelatedLink
                key={match.id}
                href={`/matches/${match.id}`}
                title={lead.name}
                meta={`${match.score}% / ${match.nextStep}`}
                lead={lead}
              />
            );
          })}
        </InspectorSection>
      </InspectorShell>
    );
  }

  const match = brokerMatches.find((item) => item.id === id);
  if (!match) return null;
  const lead = brokerLeads.find((item) => item.id === match.leadId)!;
  const listing = brokerListings.find((item) => item.id === match.listingId)!;

  return (
    <InspectorShell
      eyebrow='Selected Match'
      title={
        <>
          <LeadNameHoverCard profile={brokerLeadHoverProfile(lead)}>
            <span className='underline-offset-4 hover:text-primary hover:underline'>
              {lead.name}
            </span>
          </LeadNameHoverCard>
          {' -> '}
          {listing.neighborhood}
        </>
      }
    >
      <dl className='divide-y text-xs'>
        <InspectorRow
          label='Lead'
          value={
            <LeadNameHoverCard profile={brokerLeadHoverProfile(lead)}>
              <span className='underline-offset-4 hover:text-primary hover:underline'>
                {lead.name}
              </span>
            </LeadNameHoverCard>
          }
        />
        <InspectorRow label='Listing' value={listing.address} />
        <InspectorRow label='Score' value={`${match.score}%`} mono />
        <InspectorRow label='Status' value={match.status} mono />
      </dl>
      <div className='mt-auto grid grid-cols-2 border-t'>
        <Button asChild variant='ghost' className='justify-start border-r'>
          <Link href={`/leads/${lead.id}`}>Lead</Link>
        </Button>
        <Button asChild variant='ghost' className='justify-start'>
          <Link href={`/listings/${listing.id}`}>Listing</Link>
        </Button>
      </div>
    </InspectorShell>
  );
}

function InspectorShell({
  eyebrow,
  title,
  children
}: {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <aside className='hidden w-80 shrink-0 border-l bg-background xl:flex xl:flex-col'>
      <div className='border-b px-3 py-3'>
        <p className='font-mono text-[0.68rem] tracking-[0.14em] text-muted-foreground uppercase'>
          {eyebrow}
        </p>
        <h2 className='mt-1 text-sm font-semibold'>{title}</h2>
      </div>
      {children}
    </aside>
  );
}

function InspectorSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='border-t px-3 py-3'>
      <p className='font-mono text-[0.68rem] tracking-[0.14em] text-muted-foreground uppercase'>
        {title}
      </p>
      <div className='mt-2'>{children}</div>
    </section>
  );
}

function InspectorRow({
  label,
  value,
  mono = false
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className='grid grid-cols-[76px_1fr] gap-2 px-3 py-2'>
      <dt className='font-mono text-[0.68rem] tracking-[0.1em] text-muted-foreground uppercase'>
        {label}
      </dt>
      <dd className={mono ? 'font-mono text-xs' : 'truncate text-xs'}>{value}</dd>
    </div>
  );
}

function RelatedLink({
  href,
  title,
  meta,
  lead
}: {
  href: string;
  title: string;
  meta: string;
  lead?: Lead;
}) {
  return (
    <Link href={href} className='block border-t py-2 first:border-t-0 hover:bg-muted/20'>
      {lead ? (
        <LeadNameHoverCard profile={brokerLeadHoverProfile(lead)}>
          <span className='block truncate text-xs underline-offset-4 hover:text-primary hover:underline'>
            {title}
          </span>
        </LeadNameHoverCard>
      ) : (
        <span className='block truncate text-xs'>{title}</span>
      )}
      <span className='mt-0.5 block truncate font-mono text-[0.68rem] text-muted-foreground uppercase'>
        {meta}
      </span>
    </Link>
  );
}

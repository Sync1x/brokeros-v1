'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type {
  BrokerReadModel,
  BrokerSearchLead
} from '@/features/brokeros/api/read-model-types';
import { LeadNameHoverCard } from '@/features/leads/components/lead-name-hover-card';
import { brokerLeadHoverProfile } from '@/features/leads/utils/lead-hover-profile';

const EMPTY_READ_MODEL: BrokerReadModel = {
  leads: [],
  listings: [],
  matches: []
};

export function MatchInspector() {
  const pathname = usePathname();
  const [, section, id] = pathname.split('/');
  const [readModel, setReadModel] = useState<BrokerReadModel>(EMPTY_READ_MODEL);

  useEffect(() => {
    let isMounted = true;

    async function loadBrokerData() {
      try {
        const response = await fetch('/api/brokeros/read-model');
        if (!response.ok) throw new Error('Unable to load BrokerOS inspector data');
        const data = (await response.json()) as BrokerReadModel;
        if (isMounted) setReadModel(data);
      } catch {
        if (isMounted) setReadModel(EMPTY_READ_MODEL);
      }
    }

    void loadBrokerData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!id || (section !== 'leads' && section !== 'listings' && section !== 'matches')) {
    return null;
  }

  if (section === 'leads') {
    const lead = readModel.leads.find((item) => item.id === id);
    if (!lead) return null;
    const matches = readModel.matches.filter((match) => match.leadId === lead.id);

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
          {matches.length > 0 ? (
            matches.map((match) => {
              const listing =
                match.houseProfile ??
                readModel.listings.find((item) => item.id === match.listingId);
              if (!listing) return null;
              return (
                <RelatedLink
                  key={match.id}
                  href={`/matches/${match.id}`}
                  title={listing.address}
                  meta={`${match.score}% / ${match.nextStep}`}
                />
              );
            })
          ) : (
            <EmptyRelatedState label='No matched listings yet' />
          )}
        </InspectorSection>
      </InspectorShell>
    );
  }

  if (section === 'listings') {
    const listing = readModel.listings.find((item) => item.id === id);
    if (!listing) return null;
    const matches = readModel.matches.filter((match) => match.listingId === listing.id);

    return (
      <InspectorShell eyebrow='Selected Listing' title={listing.address}>
        <dl className='divide-y text-xs'>
          <InspectorRow label='Price' value={listing.price} mono />
          <InspectorRow label='Area' value={listing.neighborhood} />
          <InspectorRow label='Profile' value={`${listing.beds} bd / ${listing.baths} ba`} mono />
          <InspectorRow label='Status' value={listing.status} mono />
        </dl>
        <InspectorSection title='Matching Leads'>
          {matches.length > 0 ? (
            matches.map((match) => {
              const lead =
                match.buyerLead ?? readModel.leads.find((item) => item.id === match.leadId);
              if (!lead) return null;
              return (
                <RelatedLink
                  key={match.id}
                  href={`/matches/${match.id}`}
                  title={lead.name}
                  meta={`${match.score}% / ${match.nextStep}`}
                  lead={lead}
                />
              );
            })
          ) : (
            <EmptyRelatedState label='No matching leads yet' />
          )}
        </InspectorSection>
      </InspectorShell>
    );
  }

  const match = readModel.matches.find((item) => item.id === id);
  if (!match) return null;
  const lead = match.buyerLead ?? readModel.leads.find((item) => item.id === match.leadId);
  const listing =
    match.houseProfile ?? readModel.listings.find((item) => item.id === match.listingId);
  if (!lead || !listing) return null;

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

function EmptyRelatedState({ label }: { label: string }) {
  return <p className='text-muted-foreground py-2 text-xs'>{label}</p>;
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
  lead?: BrokerSearchLead;
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

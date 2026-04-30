import Link from 'next/link';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { Lead, Listing, Match } from '@/types/brokeros';

interface MatchWorkbenchProps {
  leads: Lead[];
  listings: Listing[];
  matches: Match[];
}

function getMatchTone(score: number) {
  if (score >= 90) return 'text-brokeros-success border-brokeros-success/60';
  if (score >= 80) return 'text-brokeros-warning border-brokeros-warning/60';
  return 'text-brokeros-danger border-brokeros-danger/60';
}

export function MatchWorkbench({ leads, listings, matches }: MatchWorkbenchProps) {
  const activeMatch = matches[0];
  const activeLead = leads.find((lead) => lead.id === activeMatch.leadId)!;
  const activeListing = listings.find((listing) => listing.id === activeMatch.listingId)!;

  return (
    <ResizablePanelGroup direction='horizontal' className='min-h-[calc(100dvh-8.5rem)] border-y'>
      <ResizablePanel defaultSize={72} minSize={55}>
        <div className='flex h-full min-h-0 flex-col'>
          <div className='grid border-b md:grid-cols-4'>
            <StatusCell label='Ready Matches' value={matches.length.toString()} tone='green' />
            <StatusCell label='Lead Queue' value={leads.length.toString()} />
            <StatusCell label='Inventory' value={listings.length.toString()} />
            <StatusCell
              label='Top Score'
              value={`${activeMatch.score}%`}
              tone={activeMatch.score >= 90 ? 'green' : 'yellow'}
            />
          </div>

          <section className='min-h-0 flex-1'>
            <div className='border-b px-2.5 py-1.5'>
              <h2 className='font-mono text-[0.68rem] font-semibold tracking-[0.16em] uppercase'>
                Match Matrix
              </h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Listing</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match, index) => {
                  const lead = leads.find((item) => item.id === match.leadId)!;
                  const listing = listings.find((item) => item.id === match.listingId)!;
                  return (
                    <TableRow
                      key={match.id}
                      data-state={index === 0 ? 'selected' : undefined}
                      className='group'
                    >
                      <TableCell className='font-mono text-[0.68rem] text-muted-foreground uppercase'>
                        {match.id}
                      </TableCell>
                      <TableCell>
                        <Link href={`/leads/${lead.id}`} className='hover:text-primary'>
                          {lead.name}
                        </Link>
                        <p className='mt-0.5 font-mono text-[0.65rem] text-muted-foreground uppercase'>
                          {lead.stage} / {lead.temperature}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Link href={`/listings/${listing.id}`} className='hover:text-primary'>
                          {listing.address}
                        </Link>
                        <p className='mt-0.5 font-mono text-[0.65rem] text-muted-foreground uppercase'>
                          {listing.price} / {listing.status}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={`font-mono tabular-nums ${getMatchTone(match.score)}`}
                        >
                          {match.score}%
                        </Badge>
                      </TableCell>
                      <TableCell className='font-mono text-[0.68rem] uppercase'>
                        {match.status}
                      </TableCell>
                      <TableCell className='max-w-[340px] truncate text-xs text-muted-foreground'>
                        {match.nextStep}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </section>

          <div className='grid border-t md:grid-cols-2'>
            <QueuePanel title='Lead Queue'>
              {leads.map((lead) => (
                <QueueRow
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  primary={lead.name}
                  secondary={`${lead.desiredArea} / ${lead.budget}`}
                  status={lead.temperature}
                />
              ))}
            </QueuePanel>
            <QueuePanel title='Listing Queue'>
              {listings.map((listing) => (
                <QueueRow
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  primary={listing.address}
                  secondary={`${listing.neighborhood} / ${listing.price}`}
                  status={listing.status}
                />
              ))}
            </QueuePanel>
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel defaultSize={28} minSize={22} maxSize={38}>
        <aside className='flex h-full min-h-0 flex-col bg-background'>
          <div className='border-b px-2.5 py-1.5'>
            <p className='font-mono text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase'>
              Inspector / Active Match
            </p>
            <h2 className='mt-1 text-xs font-semibold'>{activeLead.name}</h2>
          </div>
          <div className='divide-y text-xs'>
            <InspectorRow label='Match ID' value={activeMatch.id} mono />
            <InspectorRow label='Lead' value={activeLead.name} />
            <InspectorRow label='Listing' value={activeListing.address} />
            <InspectorRow label='Price' value={activeListing.price} mono />
            <InspectorRow label='Score' value={`${activeMatch.score}%`} mono />
            <InspectorRow label='Status' value={activeMatch.status} mono />
          </div>
          <div className='border-t px-2.5 py-2'>
            <p className='font-mono text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase'>
              Why It Matches
            </p>
            <p className='mt-2 text-xs leading-5 text-muted-foreground'>{activeMatch.rationale}</p>
          </div>
          <div className='border-t px-2.5 py-2'>
            <p className='font-mono text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase'>
              Next Action
            </p>
            <p className='mt-2 text-xs leading-5'>{activeMatch.nextStep}</p>
          </div>
          <div className='mt-auto grid grid-cols-2 border-t'>
            <Button asChild variant='ghost' className='justify-start border-r'>
              <Link href={`/matches/${activeMatch.id}`}>Open Brief</Link>
            </Button>
            <Button asChild variant='ghost' className='justify-start'>
              <Link href={`/listings/${activeListing.id}`}>Open Listing</Link>
            </Button>
          </div>
        </aside>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function StatusCell({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone?: 'green' | 'yellow';
}) {
  return (
    <div className='border-r px-2.5 py-1.5'>
      <p className='font-mono text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase'>
        {label}
      </p>
      <p
        className={`mt-1 font-mono text-sm font-semibold tabular-nums ${
          tone === 'green'
            ? 'text-brokeros-success'
            : tone === 'yellow'
              ? 'text-brokeros-warning'
              : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function QueuePanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='border-r'>
      <div className='border-b px-2.5 py-1.5'>
        <h3 className='font-mono text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase'>
          {title}
        </h3>
      </div>
      <div className='divide-y'>{children}</div>
    </section>
  );
}

function QueueRow({
  href,
  primary,
  secondary,
  status
}: {
  href: string;
  primary: string;
  secondary: string;
  status: string;
}) {
  return (
    <Link href={href} className='grid grid-cols-[1fr_auto] gap-3 px-2.5 py-1.5 hover:bg-muted/20'>
      <span className='min-w-0'>
        <span className='block truncate text-xs'>{primary}</span>
        <span className='mt-0.5 block truncate font-mono text-[0.65rem] text-muted-foreground uppercase'>
          {secondary}
        </span>
      </span>
      <span className='font-mono text-[0.65rem] text-muted-foreground uppercase'>{status}</span>
    </Link>
  );
}

function InspectorRow({
  label,
  value,
  mono = false
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className='grid grid-cols-[92px_1fr] gap-2 px-2.5 py-1.5'>
      <dt className='font-mono text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase'>
        {label}
      </dt>
      <dd className={mono ? 'font-mono text-[0.68rem]' : ''}>{value}</dd>
    </div>
  );
}

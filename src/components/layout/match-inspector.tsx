import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { brokerLeads, brokerListings, brokerMatches } from '@/constants/brokeros-mock-data';

export function MatchInspector() {
  const match = brokerMatches[0];
  const lead = brokerLeads.find((item) => item.id === match.leadId)!;
  const listing = brokerListings.find((item) => item.id === match.listingId)!;

  return (
    <aside className='hidden w-80 shrink-0 border-l bg-background xl:flex xl:flex-col'>
      <div className='border-b px-2.5 py-2'>
        <p className='font-mono text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase'>
          Right Inspector
        </p>
        <h2 className='mt-1 text-xs font-semibold'>Active Match</h2>
      </div>

      <dl className='divide-y text-xs'>
        <InspectorRow label='Match' value={match.id} mono />
        <InspectorRow label='Lead' value={lead.name} />
        <InspectorRow label='Listing' value={listing.address} />
        <InspectorRow label='Budget' value={lead.budget} mono />
        <InspectorRow label='Price' value={listing.price} mono />
        <InspectorRow label='Score' value={`${match.score}%`} mono />
      </dl>

      <div className='border-t px-2.5 py-2'>
        <div className='flex items-center justify-between gap-2'>
          <p className='font-mono text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase'>
            State
          </p>
          <Badge
            variant='outline'
            className='border-brokeros-success/60 font-mono text-brokeros-success'
          >
            {match.status}
          </Badge>
        </div>
      </div>

      <section className='border-t px-2.5 py-2'>
        <p className='font-mono text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase'>
          Why
        </p>
        <p className='mt-2 text-xs leading-5 text-muted-foreground'>{match.rationale}</p>
      </section>

      <section className='border-t px-2.5 py-2'>
        <p className='font-mono text-[0.65rem] tracking-[0.16em] text-muted-foreground uppercase'>
          Action
        </p>
        <p className='mt-2 text-xs leading-5'>{match.nextStep}</p>
      </section>

      <div className='mt-auto grid grid-cols-2 border-t'>
        <Button asChild variant='ghost' className='justify-start border-r'>
          <Link href={`/matches/${match.id}`}>Brief</Link>
        </Button>
        <Button asChild variant='ghost' className='justify-start'>
          <Link href={`/leads/${lead.id}`}>Lead</Link>
        </Button>
      </div>
    </aside>
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
    <div className='grid grid-cols-[76px_1fr] gap-2 px-2.5 py-1.5'>
      <dt className='font-mono text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase'>
        {label}
      </dt>
      <dd className={mono ? 'font-mono text-[0.68rem]' : 'truncate'}>{value}</dd>
    </div>
  );
}

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import type { Lead, Listing, Match } from '@/types/brokeros';

interface BrokerMatchCardProps {
  match: Match;
  lead: Lead;
  listing: Listing;
}

export function BrokerMatchCard({ match, lead, listing }: BrokerMatchCardProps) {
  return (
    <div className='bg-card/90 border p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <div className='flex items-center gap-2'>
            <p className='font-mono text-xs font-medium uppercase'>{lead.name}</p>
            <Icons.arrowRight className='text-muted-foreground size-3.5' />
            <p className='font-mono text-xs font-medium uppercase'>{listing.neighborhood}</p>
          </div>
          <p className='text-muted-foreground mt-2 font-mono text-[0.68rem] uppercase'>
            {listing.address}
          </p>
        </div>
        <Badge variant='outline' className='border-primary/50 font-mono text-primary'>
          {match.score}%
        </Badge>
      </div>
      <p className='text-muted-foreground mt-4 text-sm leading-6'>{match.rationale}</p>
      <div className='mt-4 flex items-center justify-between gap-3 border-t pt-3'>
        <p className='text-muted-foreground font-mono text-[0.68rem] uppercase'>{match.nextStep}</p>
        <Button asChild size='sm' variant='outline'>
          <Link href={`/matches/${match.id}`}>Open</Link>
        </Button>
      </div>
    </div>
  );
}

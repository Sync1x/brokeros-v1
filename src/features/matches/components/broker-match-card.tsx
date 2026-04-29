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
    <div className='bg-card/80 rounded-2xl border p-5'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2'>
            <p className='font-medium'>{lead.name}</p>
            <Icons.arrowRight className='text-muted-foreground size-4' />
            <p className='font-medium'>{listing.neighborhood}</p>
          </div>
          <p className='text-muted-foreground mt-2 text-sm'>{listing.address}</p>
        </div>
        <Badge variant='outline' className='border-primary/30 text-primary'>
          {match.score}%
        </Badge>
      </div>
      <p className='text-muted-foreground mt-5 text-sm leading-6'>{match.rationale}</p>
      <div className='mt-5 flex items-center justify-between gap-3 border-t pt-4'>
        <p className='text-muted-foreground text-sm'>{match.nextStep}</p>
        <Button asChild size='sm' variant='outline'>
          <Link href={`/matches/${match.id}`}>Open</Link>
        </Button>
      </div>
    </div>
  );
}

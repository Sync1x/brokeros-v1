import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { listBrokerMatches } from '@/features/brokeros/api/data';
import { LeadNameHoverCard } from '@/features/leads/components/lead-name-hover-card';
import { brokerLeadHoverProfile } from '@/features/leads/utils/lead-hover-profile';

function scoreClass(score: number) {
  if (score >= 90) return 'border-brokeros-success/60 text-brokeros-success';
  if (score >= 80) return 'border-brokeros-warning/60 text-brokeros-warning';
  return 'border-brokeros-danger/60 text-brokeros-danger';
}

export default async function MatchesPage() {
  const matches = await listBrokerMatches();

  return (
    <PageContainer
      pageTitle='Matches'
      pageDescription='Ranked lead-to-listing pairings with action-ready rationale.'
    >
      <div className='bg-background overflow-hidden border-y'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Match</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Listing</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Why</TableHead>
              <TableHead>Next Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => {
              const lead = match.buyerLead;
              const listing = match.houseProfile;

              return (
                <TableRow key={match.id}>
                  <TableCell className='font-mono text-[0.68rem] text-muted-foreground uppercase'>
                    <Link href={`/matches/${match.id}`} className='hover:text-primary'>
                      {match.id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {lead ? (
                      <LeadNameHoverCard profile={brokerLeadHoverProfile(lead)}>
                        <Link href={`/leads/${lead.id}`} className='hover:text-primary'>
                          {lead.name}
                        </Link>
                      </LeadNameHoverCard>
                    ) : (
                      <span className='text-muted-foreground'>Missing lead</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {listing ? (
                      <Link href={`/listings/${listing.id}`} className='hover:text-primary'>
                        {listing.address}
                      </Link>
                    ) : (
                      <span className='text-muted-foreground'>Missing listing</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline' className={`font-mono ${scoreClass(match.score)}`}>
                      {match.score}%
                    </Badge>
                  </TableCell>
                  <TableCell className='max-w-[320px] truncate text-xs text-muted-foreground'>
                    {match.rationale}
                  </TableCell>
                  <TableCell className='max-w-[280px] truncate text-xs'>{match.nextStep}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </PageContainer>
  );
}

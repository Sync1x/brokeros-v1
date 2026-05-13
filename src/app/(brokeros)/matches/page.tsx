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
import { brokerLeads, brokerListings, brokerMatches } from '@/constants/brokeros-mock-data';
import { LeadNameHoverCard } from '@/features/leads/components/lead-name-hover-card';
import { brokerLeadHoverProfile } from '@/features/leads/utils/lead-hover-profile';

function scoreClass(score: number) {
  if (score >= 90) return 'border-brokeros-success/60 text-brokeros-success';
  if (score >= 80) return 'border-brokeros-warning/60 text-brokeros-warning';
  return 'border-brokeros-danger/60 text-brokeros-danger';
}

export default function MatchesPage() {
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
            {brokerMatches.map((match) => {
              const lead = brokerLeads.find((item) => item.id === match.leadId)!;
              const listing = brokerListings.find((item) => item.id === match.listingId)!;

              return (
                <TableRow key={match.id}>
                  <TableCell className='font-mono text-[0.68rem] text-muted-foreground uppercase'>
                    <Link href={`/matches/${match.id}`} className='hover:text-primary'>
                      {match.id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <LeadNameHoverCard profile={brokerLeadHoverProfile(lead)}>
                      <Link href={`/leads/${lead.id}`} className='hover:text-primary'>
                        {lead.name}
                      </Link>
                    </LeadNameHoverCard>
                  </TableCell>
                  <TableCell>
                    <Link href={`/listings/${listing.id}`} className='hover:text-primary'>
                      {listing.address}
                    </Link>
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

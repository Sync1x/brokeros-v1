import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { listBrokerMatches } from '@/features/brokeros/api/data';
import { LeadNameHoverCard } from '@/features/leads/components/lead-name-hover-card';
import { brokerLeadHoverProfile } from '@/features/leads/utils/lead-hover-profile';
import { MatchesQueueToolbar } from '@/features/matches/components/matches-queue-toolbar';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { MINIMUM_PERSISTED_MATCH_SCORE } from '@/lib/matching/scoring-constants';
import { cn } from '@/lib/utils';

function scoreClass(score: number) {
  if (score >= 90) return 'border-brokeros-success/20 bg-brokeros-success/10 text-brokeros-success';
  return 'border-brokeros-warning/20 bg-brokeros-warning/10 text-brokeros-warning';
}

function getMatchStatus(score: number) {
  if (score >= 90) return 'Strong Match';
  return 'Review';
}

function getMatchStatusClass(score: number) {
  if (score >= 90) return 'border-brokeros-success/20 bg-brokeros-success/10 text-brokeros-success';
  return 'border-brokeros-warning/20 bg-brokeros-warning/10 text-brokeros-warning';
}

export default async function MatchesPage() {
  const matches = await listBrokerMatches();
  const visibleMatches = matches.filter((match) => match.score >= MINIMUM_PERSISTED_MATCH_SCORE);

  return (
    <PageContainer pageTitle='Matches' pageHeaderAction={<MatchesQueueToolbar />}>
      <div className='space-y-3'>
        {visibleMatches.length > 0 ? (
          <>
            <div className='relative hidden items-center gap-4 px-4 pb-1 text-[0.62rem] font-medium tracking-[0.16em] text-muted-foreground uppercase md:grid md:grid-cols-[1.2fr_1.6fr_auto_0.9fr_minmax(12rem,1.4fr)_auto] md:px-5'>
              <div>Buyer</div>
              <div>Listing</div>
              <div>Score</div>
              <div>Match Status</div>
              <div>Next Action</div>
              <div className='text-right'>Open</div>
            </div>

            <div className='space-y-3'>
              {visibleMatches.map((match) => {
                const lead = match.buyerLead;
                const listing = match.houseProfile;
                const matchStatus = getMatchStatus(match.score);

                return (
                  <article
                    key={match.id}
                    className='relative overflow-hidden rounded-lg border bg-card px-4 py-4 shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-border/80 hover:shadow-md md:px-5'
                  >
                    <div className='grid gap-4 md:grid-cols-[1.2fr_1.6fr_auto_0.9fr_minmax(12rem,1.4fr)_auto] md:items-center'>
                      <div className='min-w-0'>
                        <div className='mb-1 text-[0.62rem] font-medium tracking-[0.16em] text-muted-foreground uppercase md:hidden'>
                          Buyer
                        </div>
                        {lead ? (
                          <LeadNameHoverCard profile={brokerLeadHoverProfile(lead)}>
                            <Link
                              href={`/leads/${lead.id}`}
                              className='font-medium text-foreground hover:text-primary'
                            >
                              {lead.name}
                            </Link>
                          </LeadNameHoverCard>
                        ) : (
                          <span className='text-muted-foreground'>Missing lead</span>
                        )}
                      </div>

                      <div className='min-w-0'>
                        <div className='mb-1 text-[0.62rem] font-medium tracking-[0.16em] text-muted-foreground uppercase md:hidden'>
                          Listing
                        </div>
                        {listing ? (
                          <Link
                            href={`/listings/${listing.id}`}
                            className='font-medium text-foreground hover:text-primary'
                          >
                            {listing.address}
                          </Link>
                        ) : (
                          <span className='text-muted-foreground'>Missing listing</span>
                        )}
                      </div>

                      <div>
                        <div className='mb-1 text-[0.62rem] font-medium tracking-[0.16em] text-muted-foreground uppercase md:hidden'>
                          Score
                        </div>
                        <Badge
                          variant='outline'
                          className={cn('font-mono text-[0.7rem]', scoreClass(match.score))}
                        >
                          {match.score}%
                        </Badge>
                      </div>

                      <div className='md:pt-0.5'>
                        <div className='mb-1 text-[0.62rem] font-medium tracking-[0.16em] text-muted-foreground uppercase md:hidden'>
                          Match Status
                        </div>
                        <Badge
                          variant='outline'
                          className={cn('w-fit font-medium', getMatchStatusClass(match.score))}
                        >
                          {matchStatus}
                        </Badge>
                      </div>

                      <div className='min-w-0'>
                        <div className='mb-1 text-[0.62rem] font-medium tracking-[0.16em] text-muted-foreground uppercase md:hidden'>
                          Next Action
                        </div>
                        <span className='text-sm leading-5 text-foreground/90'>
                          {match.nextStep}
                        </span>
                      </div>

                      <div className='md:justify-self-end'>
                        <div className='mb-1 text-[0.62rem] font-medium tracking-[0.16em] text-muted-foreground uppercase md:hidden'>
                          Open
                        </div>
                        <Button asChild variant='ghost' size='sm' className='shrink-0'>
                          <Link href={`/matches/${match.id}`}>
                            Open
                            <Icons.externalLink />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className='border-border/60 bg-card rounded-lg border px-6 py-10 text-center'>
            <p className='text-sm font-medium text-foreground'>
              No reviewable matches yet. Add stronger buyer/listing criteria or refresh matches.
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

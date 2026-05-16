import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { listBrokerMatches } from '@/features/brokeros/api/data';
import { MatchesQueueToolbar } from '@/features/matches/components/matches-queue-toolbar';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { MINIMUM_PERSISTED_MATCH_SCORE } from '@/lib/matching/scoring-constants';
import { cn } from '@/lib/utils';

function getMatchStatus(score: number) {
  if (score >= 90) return 'Strong Match';
  return 'Review Match';
}

function getMatchStatusClass(score: number) {
  if (score >= 90) return 'border-brokeros-success/20 bg-brokeros-success/10 text-brokeros-success';
  return 'border-brokeros-warning/20 bg-brokeros-warning/10 text-brokeros-warning';
}

function formatCardValue(value: string | number | null | undefined) {
  if (value == null) return '';
  const text = String(value).trim();
  return text && text !== 'Not set' ? text : '';
}

export default async function MatchesPage() {
  const matches = await listBrokerMatches();
  const visibleMatches = matches.filter((match) => match.score >= MINIMUM_PERSISTED_MATCH_SCORE);

  return (
    <PageContainer pageTitle='Matches' pageHeaderAction={<MatchesQueueToolbar />}>
      <div className='space-y-3'>
        {visibleMatches.length > 0 ? (
          <div className='grid grid-cols-1 gap-4 justify-items-start sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
            {visibleMatches.map((match) => {
              const lead = match.buyerLead;
              const listing = match.houseProfile;
              const matchStatus = getMatchStatus(match.score);
              const location = listing ? formatCardValue(listing.neighborhood) : '';
              const price = listing ? formatCardValue(listing.price) : '';
              const profileBits = listing
                ? [
                    listing.beds ? `${listing.beds} bd` : '',
                    listing.baths ? `${listing.baths} ba` : '',
                    listing.sqft ? `${listing.sqft} sqft` : ''
                  ]
                    .filter(Boolean)
                    .join(' · ')
                : '';

              return (
                <article
                  key={match.id}
                  className='bg-card flex w-full max-w-[22.5rem] flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-border/80 hover:shadow-md'
                >
                  <div className='border-b px-4 py-4'>
                    <div className='mb-3 flex items-start justify-between gap-3'>
                      <Badge
                        variant='outline'
                        className={cn(
                          'rounded-full px-3 py-1 text-[0.65rem] font-semibold tracking-wide uppercase',
                          getMatchStatusClass(match.score)
                        )}
                      >
                        {matchStatus}
                      </Badge>
                      <Badge
                        variant='outline'
                        className={cn(
                          'rounded-full px-3 py-1 text-sm font-bold tabular-nums',
                          match.score >= 90
                            ? 'border-brokeros-success/20 bg-brokeros-success/10 text-brokeros-success'
                            : 'border-brokeros-warning/20 bg-brokeros-warning/10 text-brokeros-warning'
                        )}
                      >
                        {match.score}%
                      </Badge>
                    </div>

                    <div className='space-y-1'>
                      <p className='text-muted-foreground text-[0.62rem] font-medium tracking-[0.18em] uppercase'>
                        Buyer
                      </p>
                      {lead ? (
                        <Link
                          href={`/leads/${lead.id}`}
                          className='line-clamp-1 text-lg font-bold text-foreground hover:text-primary'
                        >
                          {lead.name}
                        </Link>
                      ) : (
                        <span className='text-lg font-bold text-muted-foreground'>Missing lead</span>
                      )}
                    </div>
                  </div>

                  <div className='flex flex-1 flex-col gap-3 px-4 py-4'>
                    <div className='space-y-1'>
                      <p className='text-muted-foreground text-[0.62rem] font-medium tracking-[0.18em] uppercase'>
                        Matched with
                      </p>
                      {listing ? (
                        <Link
                          href={`/listings/${listing.id}`}
                          className='line-clamp-2 text-base font-semibold text-foreground hover:text-primary'
                        >
                          {listing.address}
                        </Link>
                      ) : (
                        <span className='text-base font-semibold text-muted-foreground'>
                          Missing listing
                        </span>
                      )}
                      {location ? <p className='text-sm text-muted-foreground'>{location}</p> : null}
                    </div>

                    <div className='space-y-2'>
                      <div className='flex flex-wrap items-center gap-2 text-sm'>
                        {price ? (
                          <span className='font-semibold text-foreground'>{price}</span>
                        ) : null}
                        {profileBits ? (
                          <span className='text-muted-foreground'>{profileBits}</span>
                        ) : null}
                      </div>
                      <p className='text-sm leading-5 text-foreground/90'>{match.nextStep}</p>
                    </div>

                    <div className='mt-auto pt-1'>
                      <Button asChild size='sm' className='w-full'>
                        <Link href={`/matches/${match.id}`}>
                          Open Match
                          <Icons.externalLink />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
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

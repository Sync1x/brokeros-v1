import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { StatusPill } from '@/components/brokeros/status-pill';
import { getBrokerHouseProfileById, listBrokerMatches } from '@/features/brokeros/api/data';
import { notFound } from 'next/navigation';

function ListingStatsRow({
  beds,
  baths,
  sqft
}: {
  beds: number;
  baths: number;
  sqft: string;
}) {
  const stats = [
    { icon: Icons.bed, label: 'Beds', value: String(beds) },
    { icon: Icons.bath, label: 'Baths', value: String(baths) },
    { icon: Icons.sqft, label: 'Sqft', value: sqft }
  ].filter((stat) => Boolean(stat.value));

  return (
    <dl className='mt-3 grid gap-0 border-t border-l text-xs sm:grid-cols-3'>
      {stats.map(({ icon: Icon, label, value }) => (
        <div key={label} className='flex items-start gap-2 border-r border-b p-2'>
          <Icon className='text-muted-foreground mt-0.5 size-4 shrink-0' />
          <div>
            <dt className='text-muted-foreground font-mono text-[0.65rem] uppercase'>{label}</dt>
            <dd className='mt-1 font-mono text-xs font-medium'>{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

function listingStatusVariant(status: string | null | undefined) {
  if (status === 'Active') return 'active';
  if (status === 'Coming Soon') return 'warning';
  if (status === 'Under Review') return 'info';
  if (status === 'Private') return 'neutral';
  if (status === 'Closed') return 'success';
  return 'neutral';
}

function matchQualityLabel(score: number) {
  if (score >= 90) return 'Strong Match';
  if (score >= 80) return 'Good Match';
  if (score >= 70) return 'Possible Match';
  return 'Weak Match';
}

function matchQualityVariant(score: number) {
  if (score >= 90) return 'success';
  if (score >= 80) return 'info';
  if (score >= 70) return 'warning';
  return 'danger';
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [listing, allMatches] = await Promise.all([
    getBrokerHouseProfileById(id),
    listBrokerMatches()
  ]);

  if (!listing) {
    notFound();
  }

  const matches = allMatches.filter((match) => match.listingId === listing.id);

  return (
    <PageContainer pageTitle={listing.address} pageDescription={listing.signal}>
      <div className='grid gap-3 xl:grid-cols-[0.9fr_1.1fr]'>
        <div className='bg-background border-y p-2.5'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className='text-muted-foreground font-mono text-[0.68rem] uppercase'>
                {listing.neighborhood}
              </p>
              <p className='mt-1 font-mono text-xl font-semibold'>{listing.price}</p>
            </div>
            <StatusPill variant={listingStatusVariant(listing.status)} dot>
              {listing.status}
            </StatusPill>
          </div>
          <ListingStatsRow beds={listing.beds} baths={listing.baths} sqft={listing.sqft} />
        </div>

        <section className='bg-background border-y p-2.5'>
          <h2 className='font-mono text-xs font-semibold uppercase tracking-[0.16em]'>
            Matched Demand
          </h2>
          <div className='mt-2 divide-y border-y'>
            {matches.map((match) => (
              <div key={match.id} className='px-2 py-2 transition-colors hover:bg-muted/20'>
                <div className='flex items-center justify-between gap-3'>
                  <p className='text-xs'>{match.rationale}</p>
                  <div className='flex items-center gap-2'>
                    <StatusPill
                      appearance='outline'
                      variant={matchQualityVariant(match.score)}
                    >
                      {matchQualityLabel(match.score)}
                    </StatusPill>
                    <StatusPill appearance='score'>{match.score}%</StatusPill>
                  </div>
                </div>
                <p className='text-muted-foreground mt-2 font-mono text-[0.68rem] uppercase'>
                  {match.nextStep}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}

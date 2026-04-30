import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { brokerListings, brokerMatches } from '@/constants/brokeros-mock-data';
import { notFound } from 'next/navigation';

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = brokerListings.find((item) => item.id === id);

  if (!listing) {
    notFound();
  }

  const matches = brokerMatches.filter((match) => match.listingId === listing.id);

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
            <Badge variant='outline' className='font-mono text-[0.65rem] uppercase'>
              {listing.status}
            </Badge>
          </div>
          <dl className='mt-3 grid border-t border-l text-xs'>
            <div className='border-r border-b p-2'>
              <dt className='text-muted-foreground font-mono text-[0.65rem] uppercase'>Beds</dt>
              <dd className='mt-1 font-mono text-xs font-medium'>{listing.beds}</dd>
            </div>
            <div className='border-r border-b p-2'>
              <dt className='text-muted-foreground font-mono text-[0.65rem] uppercase'>Baths</dt>
              <dd className='mt-1 font-mono text-xs font-medium'>{listing.baths}</dd>
            </div>
            <div className='border-r border-b p-2'>
              <dt className='text-muted-foreground font-mono text-[0.65rem] uppercase'>Sqft</dt>
              <dd className='mt-1 font-mono text-xs font-medium'>{listing.sqft}</dd>
            </div>
          </dl>
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
                  <Badge variant='outline' className='font-mono'>
                    {match.score}%
                  </Badge>
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

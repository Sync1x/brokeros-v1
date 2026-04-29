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
      <div className='grid gap-6 xl:grid-cols-[0.9fr_1.1fr]'>
        <div className='bg-card/80 rounded-2xl border p-6'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <p className='text-muted-foreground text-sm'>{listing.neighborhood}</p>
              <p className='mt-3 text-3xl font-semibold'>{listing.price}</p>
            </div>
            <Badge variant='outline'>{listing.status}</Badge>
          </div>
          <dl className='mt-6 grid grid-cols-3 gap-3 text-sm'>
            <div className='rounded-xl border p-3'>
              <dt className='text-muted-foreground'>Beds</dt>
              <dd className='mt-1 font-medium'>{listing.beds}</dd>
            </div>
            <div className='rounded-xl border p-3'>
              <dt className='text-muted-foreground'>Baths</dt>
              <dd className='mt-1 font-medium'>{listing.baths}</dd>
            </div>
            <div className='rounded-xl border p-3'>
              <dt className='text-muted-foreground'>Sqft</dt>
              <dd className='mt-1 font-medium'>{listing.sqft}</dd>
            </div>
          </dl>
        </div>

        <section className='bg-card/80 rounded-2xl border p-6'>
          <h2 className='font-semibold'>Matched Demand</h2>
          <div className='mt-4 space-y-3'>
            {matches.map((match) => (
              <div key={match.id} className='rounded-xl border p-4'>
                <div className='flex items-center justify-between gap-4'>
                  <p className='text-sm'>{match.rationale}</p>
                  <Badge variant='outline'>{match.score}%</Badge>
                </div>
                <p className='text-muted-foreground mt-3 text-xs'>{match.nextStep}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}

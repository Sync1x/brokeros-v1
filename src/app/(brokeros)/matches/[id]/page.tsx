import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { brokerLeads, brokerListings, brokerMatches } from '@/constants/brokeros-mock-data';
import { notFound } from 'next/navigation';

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = brokerMatches.find((item) => item.id === id);

  if (!match) {
    notFound();
  }

  const lead = brokerLeads.find((item) => item.id === match.leadId)!;
  const listing = brokerListings.find((item) => item.id === match.listingId)!;

  return (
    <PageContainer
      pageTitle='Match Brief'
      pageDescription={`${lead.name} matched to ${listing.address}.`}
    >
      <div className='bg-card/80 rounded-2xl border p-6'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-muted-foreground text-sm'>{lead.name}</p>
            <h2 className='mt-2 text-2xl font-semibold'>{listing.address}</h2>
          </div>
          <Badge variant='outline' className='border-primary/30 text-primary'>
            {match.score}% confidence
          </Badge>
        </div>
        <p className='text-muted-foreground mt-6 max-w-3xl leading-7'>{match.rationale}</p>
        <div className='mt-6 rounded-xl border p-4'>
          <p className='text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase'>
            Next Step
          </p>
          <p className='mt-2 font-medium'>{match.nextStep}</p>
        </div>
      </div>
    </PageContainer>
  );
}

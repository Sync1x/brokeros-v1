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
      <div className='bg-card/90 border p-4'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-muted-foreground font-mono text-[0.68rem] uppercase'>{lead.name}</p>
            <h2 className='mt-2 font-mono text-lg font-semibold uppercase'>{listing.address}</h2>
          </div>
          <Badge variant='outline' className='border-primary/50 font-mono text-primary'>
            {match.score}% confidence
          </Badge>
        </div>
        <p className='text-muted-foreground mt-4 max-w-3xl text-sm leading-6'>{match.rationale}</p>
        <div className='mt-4 border p-3'>
          <p className='text-muted-foreground font-mono text-[0.65rem] font-medium tracking-[0.18em] uppercase'>
            Next Step
          </p>
          <p className='mt-2 text-sm font-medium'>{match.nextStep}</p>
        </div>
      </div>
    </PageContainer>
  );
}

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
      <div className='bg-background border-y p-2.5'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <p className='text-muted-foreground font-mono text-[0.68rem] uppercase'>{lead.name}</p>
            <h2 className='mt-1 font-mono text-base font-semibold uppercase'>{listing.address}</h2>
          </div>
          <Badge variant='outline' className='border-primary/50 font-mono text-primary'>
            {match.score}% confidence
          </Badge>
        </div>
        <p className='text-muted-foreground mt-3 max-w-3xl text-xs leading-5'>{match.rationale}</p>
        <div className='mt-3 border-y py-2'>
          <p className='text-muted-foreground font-mono text-[0.65rem] font-medium tracking-[0.18em] uppercase'>
            Next Step
          </p>
          <p className='mt-1 text-xs font-medium'>{match.nextStep}</p>
        </div>
      </div>
    </PageContainer>
  );
}

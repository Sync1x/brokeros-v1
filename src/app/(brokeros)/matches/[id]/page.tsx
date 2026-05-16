import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { getBrokerMatchById } from '@/features/brokeros/api/data';
import { LeadNameHoverCard } from '@/features/leads/components/lead-name-hover-card';
import { brokerLeadHoverProfile } from '@/features/leads/utils/lead-hover-profile';
import { notFound } from 'next/navigation';

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await getBrokerMatchById(id);

  if (!match || !match.buyerLead || !match.houseProfile) {
    notFound();
  }

  const lead = match.buyerLead;
  const listing = match.houseProfile;

  return (
    <PageContainer
      pageTitle='Match Brief'
      pageDescription={`${lead.name} matched to ${listing.address}.`}
    >
      <div className='bg-background border-y p-2.5'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <LeadNameHoverCard profile={brokerLeadHoverProfile(lead)}>
              <p className='text-muted-foreground font-mono text-[0.68rem] uppercase underline-offset-4 hover:text-primary hover:underline'>
                {lead.name}
              </p>
            </LeadNameHoverCard>
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

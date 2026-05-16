import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { getBrokerLeadById, listBrokerMatches } from '@/features/brokeros/api/data';
import { LeadNameHoverCard } from '@/features/leads/components/lead-name-hover-card';
import { brokerLeadHoverProfile } from '@/features/leads/utils/lead-hover-profile';
import { notFound } from 'next/navigation';

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lead, allMatches] = await Promise.all([getBrokerLeadById(id), listBrokerMatches()]);

  if (!lead) {
    notFound();
  }

  const matches = allMatches.filter((match) => match.leadId === lead.id);

  return (
    <PageContainer pageTitle={lead.name} pageDescription={`${lead.intent} in ${lead.desiredArea}.`}>
      <div className='grid gap-3 xl:grid-cols-[0.8fr_1.2fr]'>
        <div className='bg-background border-y p-2.5'>
          <LeadNameHoverCard profile={brokerLeadHoverProfile(lead)}>
            <h2 className='mb-2 text-sm font-semibold underline-offset-4 hover:text-primary hover:underline'>
              {lead.name}
            </h2>
          </LeadNameHoverCard>
          <Badge variant='outline' className='font-mono text-[0.65rem] uppercase'>
            {lead.temperature}
          </Badge>
          <dl className='mt-3 divide-y text-xs'>
            <div className='py-2 first:pt-0'>
              <dt className='text-muted-foreground font-mono text-[0.65rem] uppercase'>Budget</dt>
              <dd className='mt-1 font-mono text-xs font-medium'>{lead.budget}</dd>
            </div>
            <div className='py-2'>
              <dt className='text-muted-foreground font-mono text-[0.65rem] uppercase'>Stage</dt>
              <dd className='mt-1 font-mono text-xs font-medium'>{lead.stage}</dd>
            </div>
            <div className='py-2'>
              <dt className='text-muted-foreground font-mono text-[0.65rem] uppercase'>
                Assigned Agent
              </dt>
              <dd className='mt-1 font-mono text-xs font-medium'>{lead.assignedAgent}</dd>
            </div>
            <div className='py-2 pb-0'>
              <dt className='text-muted-foreground font-mono text-[0.65rem] uppercase'>Contact</dt>
              <dd className='mt-1 font-mono text-xs font-medium'>{lead.email}</dd>
              <dd className='text-muted-foreground mt-1 font-mono text-xs'>{lead.phone}</dd>
            </div>
          </dl>
        </div>

        <div className='flex flex-col gap-3'>
          <section className='bg-background border-y p-2.5'>
            <h2 className='font-mono text-xs font-semibold uppercase tracking-[0.16em]'>Memory</h2>
            <div className='mt-2 grid border-t border-l md:grid-cols-2'>
              {[...lead.notes, ...lead.preferences].map((item) => (
                <div key={item} className='border-r border-b p-2 text-xs text-muted-foreground'>
                  {item}
                </div>
              ))}
            </div>
          </section>
          <section className='bg-background border-y p-2.5'>
            <h2 className='font-mono text-xs font-semibold uppercase tracking-[0.16em]'>Matches</h2>
            <div className='mt-2 divide-y border-y'>
              {matches.map((match) => (
                <div
                  key={match.id}
                  className='flex items-center justify-between gap-3 px-2 py-2 transition-colors hover:bg-muted/20'
                >
                  <span className='text-xs'>{match.rationale}</span>
                  <Badge variant='outline' className='font-mono'>
                    {match.score}%
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}

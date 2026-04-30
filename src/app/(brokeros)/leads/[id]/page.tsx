import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { brokerLeads, brokerMatches } from '@/constants/brokeros-mock-data';
import { notFound } from 'next/navigation';

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = brokerLeads.find((item) => item.id === id);

  if (!lead) {
    notFound();
  }

  const matches = brokerMatches.filter((match) => match.leadId === lead.id);

  return (
    <PageContainer pageTitle={lead.name} pageDescription={`${lead.intent} in ${lead.desiredArea}.`}>
      <div className='grid gap-4 xl:grid-cols-[0.8fr_1.2fr]'>
        <div className='bg-card/90 border p-4'>
          <Badge variant='outline' className='font-mono text-[0.65rem] uppercase'>
            {lead.temperature}
          </Badge>
          <dl className='mt-4 flex flex-col gap-3 text-sm'>
            <div>
              <dt className='text-muted-foreground font-mono text-[0.65rem] uppercase'>Budget</dt>
              <dd className='mt-1 font-mono text-xs font-medium'>{lead.budget}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground font-mono text-[0.65rem] uppercase'>Stage</dt>
              <dd className='mt-1 font-mono text-xs font-medium'>{lead.stage}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground font-mono text-[0.65rem] uppercase'>
                Assigned Agent
              </dt>
              <dd className='mt-1 font-mono text-xs font-medium'>{lead.assignedAgent}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground font-mono text-[0.65rem] uppercase'>Contact</dt>
              <dd className='mt-1 font-mono text-xs font-medium'>{lead.email}</dd>
              <dd className='text-muted-foreground mt-1 font-mono text-xs'>{lead.phone}</dd>
            </div>
          </dl>
        </div>

        <div className='flex flex-col gap-4'>
          <section className='bg-card/90 border p-4'>
            <h2 className='font-mono text-xs font-semibold uppercase tracking-[0.16em]'>Memory</h2>
            <div className='mt-3 grid gap-2 md:grid-cols-2'>
              {[...lead.notes, ...lead.preferences].map((item) => (
                <div key={item} className='border p-3 text-sm text-muted-foreground'>
                  {item}
                </div>
              ))}
            </div>
          </section>
          <section className='bg-card/90 border p-4'>
            <h2 className='font-mono text-xs font-semibold uppercase tracking-[0.16em]'>Matches</h2>
            <div className='mt-3 flex flex-col gap-2'>
              {matches.map((match) => (
                <div key={match.id} className='flex items-center justify-between gap-3 border p-3'>
                  <span className='text-sm'>{match.rationale}</span>
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

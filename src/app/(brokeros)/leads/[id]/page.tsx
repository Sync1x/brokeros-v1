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
      <div className='grid gap-6 xl:grid-cols-[0.8fr_1.2fr]'>
        <div className='bg-card/80 rounded-2xl border p-6'>
          <Badge variant='outline'>{lead.temperature}</Badge>
          <dl className='mt-6 space-y-4 text-sm'>
            <div>
              <dt className='text-muted-foreground'>Budget</dt>
              <dd className='mt-1 font-medium'>{lead.budget}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Stage</dt>
              <dd className='mt-1 font-medium'>{lead.stage}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Assigned Agent</dt>
              <dd className='mt-1 font-medium'>{lead.assignedAgent}</dd>
            </div>
            <div>
              <dt className='text-muted-foreground'>Contact</dt>
              <dd className='mt-1 font-medium'>{lead.email}</dd>
              <dd className='text-muted-foreground mt-1'>{lead.phone}</dd>
            </div>
          </dl>
        </div>

        <div className='space-y-6'>
          <section className='bg-card/80 rounded-2xl border p-6'>
            <h2 className='font-semibold'>Memory</h2>
            <div className='mt-4 grid gap-3 md:grid-cols-2'>
              {[...lead.notes, ...lead.preferences].map((item) => (
                <div key={item} className='rounded-xl border p-3 text-sm text-muted-foreground'>
                  {item}
                </div>
              ))}
            </div>
          </section>
          <section className='bg-card/80 rounded-2xl border p-6'>
            <h2 className='font-semibold'>Matches</h2>
            <div className='mt-4 space-y-3'>
              {matches.map((match) => (
                <div
                  key={match.id}
                  className='flex items-center justify-between rounded-xl border p-3'
                >
                  <span className='text-sm'>{match.rationale}</span>
                  <Badge variant='outline'>{match.score}%</Badge>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}

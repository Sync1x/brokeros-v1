import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { brokerLeads } from '@/constants/brokeros-mock-data';
import { BrokerMetricCard } from '@/features/brokeros/components/broker-metric-card';
import { LeadMemoryTable } from '@/features/leads/components/lead-memory-table';

export default function LeadsPage() {
  return (
    <PageContainer
      pageTitle='Leads'
      pageDescription='Client memory, intent, preferences, and next best actions.'
    >
      <div className='space-y-6'>
        <div className='grid gap-4 md:grid-cols-3'>
          <BrokerMetricCard
            label='Hot Leads'
            value='12'
            delta='Ready for property briefs'
            icon={Icons.user}
          />
          <BrokerMetricCard
            label='Touring'
            value='8'
            delta='Across this week'
            icon={Icons.calendar}
          />
          <BrokerMetricCard
            label='Offer Stage'
            value='4'
            delta='Attorney or terms pending'
            icon={Icons.fileTypeDoc}
          />
        </div>
        <LeadMemoryTable leads={brokerLeads} />
      </div>
    </PageContainer>
  );
}

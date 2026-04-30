import PageContainer from '@/components/layout/page-container';
import { brokerLeads, brokerMatches } from '@/constants/brokeros-mock-data';
import { LeadMemoryTable } from '@/features/leads/components/lead-memory-table';

export default function LeadsPage() {
  return (
    <PageContainer
      pageTitle='Leads'
      pageDescription='Client intent, qualification state, and matching readiness.'
    >
      <LeadMemoryTable leads={brokerLeads} matches={brokerMatches} />
    </PageContainer>
  );
}

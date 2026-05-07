import PageContainer from '@/components/layout/page-container';
import { LeadsWorkspace } from '@/features/leads/components/leads-workspace';

export default function LeadsPage() {
  return (
    <PageContainer pageTitle='Leads' pageDescription='Buyer and seller pipeline workspace.'>
      <LeadsWorkspace />
    </PageContainer>
  );
}

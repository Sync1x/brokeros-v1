import PageContainer from '@/components/layout/page-container';
import { brokerLeads, brokerListings, brokerMatches } from '@/constants/brokeros-mock-data';
import { MatchWorkbench } from '@/features/matches/components/match-workbench';

export default function DashboardPage() {
  return (
    <PageContainer
      pageTitle='Match Command'
      pageDescription='Lead-to-listing matrix, rationale, and next action queue.'
    >
      <MatchWorkbench leads={brokerLeads} listings={brokerListings} matches={brokerMatches} />
    </PageContainer>
  );
}

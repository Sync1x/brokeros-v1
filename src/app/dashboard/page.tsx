import PageContainer from '@/components/layout/page-container';
import { DailyActionFeed } from '@/features/matches/components/daily-action-feed';

export default function DashboardPage() {
  return (
    <PageContainer
      pageTitle='Command Center'
      pageDescription='Today’s lead-to-listing actions, ranked by what needs attention.'
    >
      <DailyActionFeed />
    </PageContainer>
  );
}

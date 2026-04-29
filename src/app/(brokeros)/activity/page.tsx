import PageContainer from '@/components/layout/page-container';
import { brokerActivity } from '@/constants/brokeros-mock-data';
import { ActivityFeed } from '@/features/activity/components/activity-feed';

export default function ActivityPage() {
  return (
    <PageContainer
      pageTitle='Activity'
      pageDescription='The brokerage event stream, filtered to what matters.'
    >
      <ActivityFeed items={brokerActivity} />
    </PageContainer>
  );
}

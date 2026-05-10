import PageContainer from '@/components/layout/page-container';
import { GoogleCalendarWidget } from '@/features/calendar/components/google-calendar-widget';
import { DailyActionFeed } from '@/features/matches/components/daily-action-feed';

export default function DashboardPage() {
  return (
    <PageContainer
      pageTitle='Command Center'
      pageDescription='Today’s lead-to-listing actions, ranked by what needs attention.'
    >
      <div className='grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,1fr)_360px]'>
        <DailyActionFeed />
        <GoogleCalendarWidget />
      </div>
    </PageContainer>
  );
}

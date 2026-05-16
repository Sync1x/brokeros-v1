import PageContainer from '@/components/layout/page-container';
import { GoogleCalendarWidget } from '@/features/calendar/components/google-calendar-widget';
import { getCommandActions, getCommandPace } from '@/features/command-center/api/service';
import { CommandCenterWorkbench } from '@/features/command-center/components/command-center-workbench';

export default async function DashboardPage() {
  const [actions, pace] = await Promise.all([getCommandActions(), getCommandPace()]);

  return (
    <PageContainer>
      <CommandCenterWorkbench actions={actions} pace={pace} sideSlot={<GoogleCalendarWidget />} />
    </PageContainer>
  );
}

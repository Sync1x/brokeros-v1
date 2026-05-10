import PageContainer from '@/components/layout/page-container';
import { GoogleCalendarWidget } from '@/features/calendar/components/google-calendar-widget';
import {
  getCommandActions,
  getCommandPace
} from '@/features/command-center/api/service';
import { CommandCenterWorkbench } from '@/features/command-center/components/command-center-workbench';

export default function DashboardPage() {
  const actions = getCommandActions();
  const pace = getCommandPace();

  return (
    <PageContainer
      pageTitle='Command Center'
      pageDescription='The next actions that move leads, matches, showings, and deals forward.'
    >
      <CommandCenterWorkbench
        actions={actions}
        pace={pace}
        sideSlot={<GoogleCalendarWidget />}
      />
    </PageContainer>
  );
}

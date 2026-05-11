import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { MatchInspector } from '@/components/layout/match-inspector';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { FloatingAssistant } from '@/features/assistant/components/floating-assistant';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'BrokerOS',
  description: 'A quiet real estate brokerage operating system.',
  robots: {
    index: false,
    follow: false
  }
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <InfobarProvider defaultOpen={false}>
            <div className='flex min-h-0 flex-1'>
              <div className='min-w-0 flex-1 pb-32'>{children}</div>
              <MatchInspector />
            </div>
          </InfobarProvider>
          <FloatingAssistant />
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}

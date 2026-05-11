import PageContainer from '@/components/layout/page-container';
import { SettingsConnectorsSection } from '@/features/settings/components/settings-connectors-section';

const settings = ['Brokerage profile', 'Agent permissions', 'Notification cadence', 'Data sources'];

export default function SettingsPage() {
  return (
    <PageContainer
      pageTitle='Settings'
      pageDescription='BrokerOS configuration, currently backed by local mock state.'
    >
      <SettingsConnectorsSection />
      <div className='grid border-t border-l md:grid-cols-2'>
        {settings.map((setting) => (
          <div key={setting} className='bg-background border-r border-b p-2.5 hover:bg-muted/20'>
            <h2 className='font-mono text-xs font-medium uppercase tracking-[0.14em]'>{setting}</h2>
            <p className='text-muted-foreground mt-1 text-xs'>Mock configuration placeholder.</p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

import PageContainer from '@/components/layout/page-container';

const settings = ['Brokerage profile', 'Agent permissions', 'Notification cadence', 'Data sources'];

export default function SettingsPage() {
  return (
    <PageContainer
      pageTitle='Settings'
      pageDescription='BrokerOS configuration, currently backed by local mock state.'
    >
      <div className='grid gap-4 md:grid-cols-2'>
        {settings.map((setting) => (
          <div key={setting} className='bg-card/80 rounded-2xl border p-5'>
            <h2 className='font-medium'>{setting}</h2>
            <p className='text-muted-foreground mt-2 text-sm'>Mock configuration placeholder.</p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

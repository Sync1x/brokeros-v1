import { brokerLeads, brokerListings, brokerMatches } from '@/constants/brokeros-mock-data';

export function StatusBar() {
  const topScore = Math.max(...brokerMatches.map((match) => match.score));
  const readyMatches = brokerMatches.filter((match) => match.status === 'Ready').length;

  return (
    <footer className='flex h-7 shrink-0 items-center justify-between border-t bg-background px-2 font-mono text-[0.65rem] text-muted-foreground uppercase'>
      <div className='flex items-center gap-4'>
        <span>BrokerOS</span>
        <span>Leads {brokerLeads.length}</span>
        <span>Listings {brokerListings.length}</span>
        <span className='text-brokeros-success'>Ready {readyMatches}</span>
      </div>
      <div className='flex items-center gap-4'>
        <span>Top Match {topScore}%</span>
        <span>Mode Matching</span>
        <span>Cmd-K Command</span>
      </div>
    </footer>
  );
}

import PageContainer from '@/components/layout/page-container';
import { brokerLeads, brokerListings, brokerMatches } from '@/constants/brokeros-mock-data';
import { BrokerMatchCard } from '@/features/matches/components/broker-match-card';

export default function MatchesPage() {
  return (
    <PageContainer
      pageTitle='Matches'
      pageDescription='BrokerOS pairing logic for client intent and controlled inventory.'
    >
      <div className='grid gap-4 xl:grid-cols-2'>
        {brokerMatches.map((match) => {
          const lead = brokerLeads.find((item) => item.id === match.leadId)!;
          const listing = brokerListings.find((item) => item.id === match.listingId)!;
          return <BrokerMatchCard key={match.id} match={match} lead={lead} listing={listing} />;
        })}
      </div>
    </PageContainer>
  );
}

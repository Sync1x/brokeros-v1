import PageContainer from '@/components/layout/page-container';
import { brokerListings, brokerMatches } from '@/constants/brokeros-mock-data';
import { ListingTable } from '@/features/listings/components/listing-table';

export default function ListingsPage() {
  return (
    <PageContainer
      pageTitle='Listings'
      pageDescription='Controlled inventory available for lead matching and broker action.'
    >
      <ListingTable listings={brokerListings} matches={brokerMatches} />
    </PageContainer>
  );
}

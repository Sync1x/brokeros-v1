import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { brokerListings } from '@/constants/brokeros-mock-data';
import { BrokerMetricCard } from '@/features/brokeros/components/broker-metric-card';
import { ListingTable } from '@/features/listings/components/listing-table';

export default function ListingsPage() {
  return (
    <PageContainer
      pageTitle='Listings'
      pageDescription='Controlled inventory available for lead matching and broker action.'
    >
      <div className='flex flex-col gap-4'>
        <div className='grid gap-3 md:grid-cols-3'>
          <BrokerMetricCard
            label='Inventory Value'
            value='$10.3M'
            delta='Shown in current mock set'
            icon={Icons.home}
          />
          <BrokerMetricCard
            label='Private'
            value='1'
            delta='Quietly available'
            icon={Icons.eyeOff}
          />
          <BrokerMetricCard
            label='Coming Soon'
            value='1'
            delta='Seller qualification required'
            icon={Icons.clock}
          />
        </div>
        <ListingTable listings={brokerListings} />
      </div>
    </PageContainer>
  );
}

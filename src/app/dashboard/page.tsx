import PageContainer from '@/components/layout/page-container';
import {
  agentOversight,
  brokerActivity,
  brokerLeads,
  brokerListings,
  brokerMatches
} from '@/constants/brokeros-mock-data';
import { Icons } from '@/components/icons';
import { ActivityFeed } from '@/features/activity/components/activity-feed';
import { AgentOversightTable } from '@/features/brokeros/components/agent-oversight-table';
import { BrokerMetricCard } from '@/features/brokeros/components/broker-metric-card';
import { SectionPanel } from '@/features/brokeros/components/section-panel';
import { BrokerMatchCard } from '@/features/matches/components/broker-match-card';

export default function DashboardPage() {
  const firstMatch = brokerMatches[0];
  const firstLead = brokerLeads.find((lead) => lead.id === firstMatch.leadId)!;
  const firstListing = brokerListings.find((listing) => listing.id === firstMatch.listingId)!;

  return (
    <PageContainer
      pageTitle='BrokerOS'
      pageDescription='A quiet command center for leads, inventory, matches, and agent oversight.'
    >
      <div className='space-y-6'>
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
          <BrokerMetricCard
            label='Private Pipeline'
            value='$57.2M'
            delta='Across active buyer and seller mandates'
            icon={Icons.trendingUp}
            accent
          />
          <BrokerMetricCard
            label='Active Leads'
            value='64'
            delta='18 require follow-up today'
            icon={Icons.user}
          />
          <BrokerMetricCard
            label='Live Listings'
            value='21'
            delta='7 held private or coming soon'
            icon={Icons.home}
          />
          <BrokerMetricCard
            label='Match Quality'
            value='91%'
            delta='Average score for ready briefs'
            icon={Icons.checks}
          />
        </div>

        <div className='grid gap-6 xl:grid-cols-[1.1fr_0.9fr]'>
          <SectionPanel title='Highest Confidence Match' eyebrow='Today'>
            <BrokerMatchCard match={firstMatch} lead={firstLead} listing={firstListing} />
          </SectionPanel>
          <SectionPanel title='Live Activity' eyebrow='Signals'>
            <ActivityFeed items={brokerActivity} />
          </SectionPanel>
        </div>

        <SectionPanel title='Agent Oversight' eyebrow='Brokerage'>
          <AgentOversightTable agents={agentOversight} />
        </SectionPanel>
      </div>
    </PageContainer>
  );
}

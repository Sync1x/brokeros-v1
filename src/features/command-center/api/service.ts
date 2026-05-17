import {
  listBrokerHouseProfiles,
  listBrokerLeads,
  listBrokerMatches,
  type BrokerLeadData,
  type BrokerListingData,
  type BrokerMatchData
} from '@/features/brokeros/api/data';
import type { CommandAction, CommandPace } from './types';

const READY_LISTING_STATUSES = ['Active', 'Private', 'Coming Soon'] as const;
const CREATED_AT_BASE = '2026-05-10T09:00:00-04:00';

function isListingReady(listing: BrokerListingData) {
  return READY_LISTING_STATUSES.includes(listing.status as (typeof READY_LISTING_STATUSES)[number]);
}

function hasProofOfFundsOrPreapproval(lead: BrokerLeadData) {
  return [...lead.notes, ...lead.preferences].some((note) => /cash proof|proof|preapproval/i.test(note));
}

function actionBase(
  partial: Omit<CommandAction, 'state' | 'createdAt'> & {
    createdAt?: string;
  }
): CommandAction {
  return {
    ...partial,
    createdAt: partial.createdAt ?? CREATED_AT_BASE,
    state: 'active'
  };
}

function sortCommandActions(actions: CommandAction[]) {
  const priorityRank = {
    critical: 0,
    high: 1,
    normal: 2
  } satisfies Record<CommandAction['priority'], number>;

  return actions.toSorted((a, b) => {
    const priorityDelta = priorityRank[a.priority] - priorityRank[b.priority];
    if (priorityDelta !== 0) return priorityDelta;
    if (b.decayScore !== a.decayScore) return b.decayScore - a.decayScore;
    if (b.valueScore !== a.valueScore) return b.valueScore - a.valueScore;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function matchBlocker(match: BrokerMatchData, lead: BrokerLeadData, listing: BrokerListingData) {
  if (match.status === 'Review') return 'Match is marked for review before sending.';
  if (!hasProofOfFundsOrPreapproval(lead)) return 'Proof of funds or preapproval is not confirmed.';
  if (!isListingReady(listing)) return `${listing.address} is ${listing.status.toLowerCase()}.`;
  return null;
}

function buildMatchActions(matches: BrokerMatchData[]) {
  return matches.flatMap((match) => {
    const lead = match.buyerLead;
    const listing = match.houseProfile;
    if (!lead || !listing) return [];

    if (match.status === 'Ready' && match.score >= 90 && isListingReady(listing)) {
      return [
        actionBase({
          id: `match-ready-${match.id}`,
          type: 'match_ready',
          priority: 'high',
          title: `Send ${listing.address} to ${lead.name}`,
          personName: lead.name,
          contactEmail: lead.email,
          contactPhone: lead.phone,
          leadId: lead.id,
          listingId: listing.id,
          matchId: match.id,
          dueAt: 'Today',
          whyNow: `${lead.name} is searching in ${lead.desiredArea}; ${listing.address} is ${listing.status.toLowerCase()} inventory and matches at ${match.score}%.`,
          nextAction: match.nextStep,
          primaryCtaLabel: 'Send Preview',
          primaryHref: `/matches/${match.id}`,
          secondaryCtaLabel: 'Open Lead',
          secondaryHref: `/leads/${lead.id}`,
          valueScore: match.score,
          decayScore: 72,
          sourceFacts: [
            `${lead.name}: ${lead.intent}`,
            `${listing.address}: ${listing.signal}`,
            `Match rationale: ${match.rationale}`
          ]
        })
      ];
    }

    const blocker = matchBlocker(match, lead, listing);
    if (!blocker) {
      return [
        actionBase({
          id: `follow-up-${match.id}`,
          type: 'follow_up',
          priority: 'normal',
          title: `Review ${listing.neighborhood} match for ${lead.name}`,
          personName: lead.name,
          contactEmail: lead.email,
          contactPhone: lead.phone,
          leadId: lead.id,
          listingId: listing.id,
          matchId: match.id,
          dueAt: 'Today',
          whyNow: `${lead.name} has a ${match.score}% match with ${listing.address}.`,
          nextAction: match.nextStep,
          primaryCtaLabel: 'Open Match',
          primaryHref: `/matches/${match.id}`,
          secondaryCtaLabel: 'Open Lead',
          secondaryHref: `/leads/${lead.id}`,
          valueScore: match.score,
          decayScore: Math.min(80, match.score),
          sourceFacts: [
            `Lead area: ${lead.desiredArea}`,
            `Listing status: ${listing.status}`,
            `Rationale: ${match.rationale}`
          ]
        })
      ];
    }

    return [
      actionBase({
        id: `deal-blocker-${match.id}`,
        type: 'deal_blocker',
        priority: 'critical',
        title: `Clear blocker before sending ${listing.address}`,
        personName: lead.name,
        contactEmail: lead.email,
        contactPhone: lead.phone,
        leadId: lead.id,
        listingId: listing.id,
        matchId: match.id,
        dueAt: 'Today',
        whyNow: `${lead.name} matches ${listing.address} at ${match.score}%, but ${blocker.toLowerCase()}`,
        nextAction: match.nextStep,
        primaryCtaLabel: 'Review Blocker',
        primaryHref: `/matches/${match.id}`,
        secondaryCtaLabel: 'Open Listing',
        secondaryHref: `/listings/${listing.id}`,
        valueScore: match.score,
        decayScore: 92,
        sourceFacts: [
          `Blocker: ${blocker}`,
          `Match status: ${match.status}`,
          `Listing status: ${listing.status}`
        ]
      })
    ];
  });
}

function buildLeadActions(leads: BrokerLeadData[]) {
  return leads
    .filter((lead) => lead.leadType === 'buyer')
    .slice(0, 4)
    .map((lead, index) =>
      actionBase({
        id: `lead-follow-up-${lead.id}`,
        type: index === 0 ? 'new_lead' : 'follow_up',
        priority: lead.temperature === 'Hot' ? 'critical' : lead.temperature === 'Warm' ? 'high' : 'normal',
        title: `${index === 0 ? 'Respond to' : 'Follow up with'} ${lead.name}`,
        personName: lead.name,
        contactEmail: lead.email,
        contactPhone: lead.phone,
        leadId: lead.id,
        dueAt: index === 0 ? 'Now' : 'Today',
        whyNow: `${lead.name} is a ${lead.temperature.toLowerCase()} ${lead.stage.toLowerCase()} lead searching in ${lead.desiredArea}.`,
        nextAction: 'Confirm current criteria and the next showing window.',
        primaryCtaLabel: 'Open Lead',
        primaryHref: `/leads/${lead.id}`,
        secondaryCtaLabel: 'Review Matches',
        secondaryHref: '/matches',
        valueScore: lead.temperature === 'Hot' ? 92 : lead.temperature === 'Warm' ? 76 : 58,
        decayScore: lead.temperature === 'Hot' ? 95 : lead.temperature === 'Warm' ? 72 : 48,
        sourceFacts: [
          `Budget: ${lead.budget}`,
          `Area: ${lead.desiredArea}`,
          `Last contact: ${lead.lastContact}`
        ]
      })
    );
}

function buildSellerLaunchActions(listings: BrokerListingData[]) {
  return listings
    .filter((listing) => listing.status === 'Coming Soon' || listing.status === 'Private')
    .slice(0, 3)
    .map((listing) =>
      actionBase({
        id: `seller-launch-${listing.id}`,
        type: 'seller_launch',
        priority: 'normal',
        title: `Confirm launch packet for ${listing.address}`,
        personName: listing.owner,
        listingId: listing.id,
        dueAt: 'Today',
        whyNow: `${listing.address} is ${listing.status.toLowerCase()} inventory with ${listing.signal.toLowerCase()}.`,
        nextAction: 'Confirm seller-facing details before sending buyer previews.',
        primaryCtaLabel: 'Open Listing',
        primaryHref: `/listings/${listing.id}`,
        secondaryCtaLabel: 'Review Matches',
        secondaryHref: '/matches',
        valueScore: 68,
        decayScore: 58,
        sourceFacts: [
          `Listing status: ${listing.status}`,
          `Owner: ${listing.owner}`,
          `Signal: ${listing.signal}`
        ]
      })
    );
}

export async function getCommandActions() {
  const [leads, listings, matches] = await Promise.all([
    listBrokerLeads(),
    listBrokerHouseProfiles(),
    listBrokerMatches()
  ]);

  return sortCommandActions([
    ...buildLeadActions(leads),
    ...buildMatchActions(matches),
    ...buildSellerLaunchActions(listings)
  ]);
}

export async function getCommandPace(): Promise<CommandPace> {
  const leads = await listBrokerLeads();
  const hotLeads = leads.filter((lead) => lead.temperature === 'Hot').length;

  return {
    contactsToday: hotLeads,
    contactsThisWeek: leads.length,
    label: 'Contacts made'
  };
}

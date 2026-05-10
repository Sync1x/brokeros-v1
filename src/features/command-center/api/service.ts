import {
  brokerDocuments,
  brokerLeads,
  brokerListings,
  brokerMatches
} from '@/constants/brokeros-mock-data';
import type { BrokerDocument, Lead, Listing, Match } from '@/types/brokeros';
import type { CommandAction, CommandPace } from './types';

const READY_LISTING_STATUSES = ['Active', 'Private', 'Coming Soon'] as const;
const CREATED_AT_BASE = '2026-05-10T09:00:00-04:00';

function leadById(id: string) {
  return brokerLeads.find((lead) => lead.id === id);
}

function listingById(id: string) {
  return brokerListings.find((listing) => listing.id === id);
}

function documentsForClient(name: string) {
  return brokerDocuments.filter((document) => document.client === name);
}

function hasNeedsReviewDocument(documents: BrokerDocument[]) {
  return documents.some((document) => document.status === 'Needs Review');
}

function hasBuyerAgreement(lead: Lead) {
  return documentsForClient(lead.name).some((document) => document.type === 'Agreement');
}

function hasProofOfFundsOrPreapproval(lead: Lead) {
  return lead.notes.some((note) => /cash proof|proof|preapproval/i.test(note));
}

function isListingReady(listing: Listing) {
  return READY_LISTING_STATUSES.includes(listing.status as (typeof READY_LISTING_STATUSES)[number]);
}

function isReadyMatch(match: Match, lead: Lead, listing: Listing) {
  return (
    match.status === 'Ready' &&
    match.score >= 90 &&
    isListingReady(listing) &&
    hasBuyerAgreement(lead)
  );
}

function matchBlocker(match: Match, lead: Lead, listing: Listing) {
  const documents = documentsForClient(lead.name);
  if (match.status === 'Review') return 'Match is marked for review before sending.';
  if (hasNeedsReviewDocument(documents)) return 'A related document still needs review.';
  if (!hasBuyerAgreement(lead)) return 'Buyer agreement is not confirmed before tour outreach.';
  if (!hasProofOfFundsOrPreapproval(lead)) return 'Proof of funds or preapproval is not confirmed.';
  if (!isListingReady(listing)) return `${listing.address} is ${listing.status.toLowerCase()}.`;
  return null;
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

function buildMatchActions() {
  return brokerMatches.flatMap((match) => {
    const lead = leadById(match.leadId);
    const listing = listingById(match.listingId);
    if (!lead || !listing) return [];

    if (isReadyMatch(match, lead, listing)) {
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
          whyNow: `${lead.name} is touring in ${lead.desiredArea}; ${listing.address} is ${listing.status.toLowerCase()} inventory and matches at ${match.score}%.`,
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

    if (match.status === 'Sent') {
      return [
        actionBase({
          id: `sent-follow-up-${match.id}`,
          type: 'follow_up',
          priority: 'high',
          title: `Follow up with ${lead.name}`,
          personName: lead.name,
          contactEmail: lead.email,
          contactPhone: lead.phone,
          leadId: lead.id,
          listingId: listing.id,
          matchId: match.id,
          dueAt: 'Today',
          whyNow: `${lead.name} received a ${listing.neighborhood} match after the ${lead.lastContact} check-in and has not responded in the mock activity stream.`,
          nextAction: match.nextStep,
          primaryCtaLabel: 'Send Follow-Up',
          primaryHref: `/matches/${match.id}`,
          secondaryCtaLabel: 'Open Lead',
          secondaryHref: `/leads/${lead.id}`,
          valueScore: match.score,
          decayScore: 78,
          createdAt: '2026-05-10T08:40:00-04:00',
          sourceFacts: [
            `Last contact: ${lead.lastContact}`,
            `Sent match: ${listing.address}`,
            `Buyer intent: ${lead.intent}`
          ]
        })
      ];
    }

    const blocker = matchBlocker(match, lead, listing);
    if (!blocker) return [];

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
        createdAt: '2026-05-10T08:55:00-04:00',
        sourceFacts: [
          `Blocker: ${blocker}`,
          `Match status: ${match.status}`,
          `Listing status: ${listing.status}`
        ]
      })
    ];
  });
}

function buildLeadActions() {
  const amelia = brokerLeads.find((lead) => lead.name === 'Amelia Hart');
  const marcus = brokerLeads.find((lead) => lead.name === 'Marcus Lee');
  const sofia = brokerLeads.find((lead) => lead.name === 'Sofia Bennett');

  return [
    amelia &&
      actionBase({
        id: 'speed-to-lead-amelia',
        type: 'new_lead',
        priority: 'critical',
        title: 'Respond to Amelia before the private preview window moves',
        personName: amelia.name,
        contactEmail: amelia.email,
        contactPhone: '802-274-9999',
        leadId: amelia.id,
        dueAt: 'Now',
        whyNow: `${amelia.name} contacted you ${amelia.lastContact} about a private Tribeca preview; fast response protects the showing window.`,
        nextAction: 'Call first, then text two available showing windows if she does not answer.',
        primaryCtaLabel: 'Call Lead',
        primaryHref: `/leads/${amelia.id}`,
        secondaryCtaLabel: 'Send Text',
        secondaryHref: `/leads/${amelia.id}`,
        valueScore: 96,
        decayScore: 100,
        createdAt: '2026-05-10T09:20:00-04:00',
        sourceFacts: [
          `Last contact: ${amelia.lastContact}`,
          `Temperature: ${amelia.temperature}`,
          `Intent: ${amelia.intent}`
        ]
      }),
    amelia &&
      actionBase({
        id: 'showing-prep-amelia',
        type: 'showing_prep',
        priority: 'critical',
        title: 'Prep Amelia before today’s Tribeca tour',
        personName: amelia.name,
        contactEmail: amelia.email,
        contactPhone: '802-274-9999',
        leadId: amelia.id,
        listingId: 'listing-101',
        dueAt: 'Today',
        whyNow: `${amelia.name} prefers discreet elevator buildings and needs a home office; the Lispenard PH is private inventory with an office-ready third bedroom.`,
        nextAction:
          'Send the private preview packet and confirm buyer agreement coverage before the showing.',
        primaryCtaLabel: 'Open Match',
        primaryHref: '/matches/match-9001',
        secondaryCtaLabel: 'Open Lead',
        secondaryHref: `/leads/${amelia.id}`,
        valueScore: 94,
        decayScore: 96,
        createdAt: '2026-05-10T09:05:00-04:00',
        sourceFacts: [
          'Preference: discreet elevator buildings',
          'Need: home office',
          'Listing signal: quiet pre-market opportunity'
        ]
      }),
    marcus &&
      actionBase({
        id: 'financing-marcus',
        type: 'deal_blocker',
        priority: 'high',
        title: 'Get Marcus financing-ready',
        personName: marcus.name,
        contactEmail: marcus.email,
        contactPhone: marcus.phone,
        leadId: marcus.id,
        dueAt: 'Today',
        whyNow: `${marcus.name} is a first-time buyer last contacted ${marcus.lastContact}; financing education is blocking qualified Long Island City inventory.`,
        nextAction:
          'Request preapproval details and confirm the real ceiling before widening the search.',
        primaryCtaLabel: 'Request Preapproval',
        primaryHref: `/leads/${marcus.id}`,
        secondaryCtaLabel: 'Open Lead',
        secondaryHref: `/leads/${marcus.id}`,
        valueScore: 62,
        decayScore: 84,
        createdAt: '2026-05-10T08:25:00-04:00',
        sourceFacts: [
          `Last contact: ${marcus.lastContact}`,
          'Note: Needs financing education',
          `Budget: ${marcus.budget}`
        ]
      }),
    sofia &&
      actionBase({
        id: 'cadence-sofia',
        type: 'follow_up',
        priority: 'high',
        title: 'Revive Sofia after the digest',
        personName: sofia.name,
        contactEmail: sofia.email,
        contactPhone: sofia.phone,
        leadId: sofia.id,
        matchId: 'match-9003',
        dueAt: 'Overdue',
        whyNow: `${sofia.name} received the Brooklyn Heights digest after her ${sofia.lastContact} check-in and has not responded; ask whether investment timing changed.`,
        nextAction: 'Send a one-line follow-up tied to rental history and timing.',
        primaryCtaLabel: 'Send Follow-Up',
        primaryHref: '/matches/match-9003',
        secondaryCtaLabel: 'Open Lead',
        secondaryHref: `/leads/${sofia.id}`,
        valueScore: 78,
        decayScore: 82,
        createdAt: '2026-05-10T08:10:00-04:00',
        sourceFacts: [
          `Last contact: ${sofia.lastContact}`,
          'Preference: strong rental history',
          'Match sent: 91 Columbia Heights'
        ]
      })
  ].filter(Boolean) as CommandAction[];
}

function buildSellerLaunchActions() {
  const listing = brokerListings.find((item) => item.id === 'listing-102');
  const document = brokerDocuments.find((item) => item.title === 'West Village Offer Summary');
  if (!listing || !document) return [];

  return [
    actionBase({
      id: 'seller-launch-grove',
      type: 'seller_launch',
      priority: 'normal',
      title: 'Confirm Grove Street seller packet',
      personName: listing.owner,
      listingId: listing.id,
      dueAt: 'Today',
      whyNow: `${listing.address} is coming soon and ${document.title} is marked ${document.status.toLowerCase()}; the buyer preview should wait until the packet is clean.`,
      nextAction: 'Ask seller counsel for the final disclosure packet before sending the match.',
      primaryCtaLabel: 'Open Listing',
      primaryHref: `/listings/${listing.id}`,
      secondaryCtaLabel: 'Open Documents',
      secondaryHref: '/documents',
      valueScore: 74,
      decayScore: 66,
      createdAt: '2026-05-10T07:50:00-04:00',
      sourceFacts: [
        `Listing status: ${listing.status}`,
        `Document status: ${document.status}`,
        `Signal: ${listing.signal}`
      ]
    })
  ];
}

export function getCommandActions() {
  return sortCommandActions([
    ...buildLeadActions(),
    ...buildMatchActions(),
    ...buildSellerLaunchActions()
  ]);
}

export function getCommandPace(): CommandPace {
  return {
    contactsToday: 3,
    contactsThisWeek: 12,
    label: 'Contacts made'
  };
}

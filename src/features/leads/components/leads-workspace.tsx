'use client';

import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

type LeadType = 'buyer' | 'seller';
type SortKey = 'recent' | 'budget' | 'name';
type LeadStatus =
  | 'Active'
  | 'Hot'
  | 'Matched'
  | 'Prospect'
  | 'Stale'
  | 'New'
  | 'Under contract';
const LOCAL_LEADS_EVENT = 'brokeros:local-leads-updated';

interface HouseProfile {
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyType: string;
  estimatedListingPrice: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  lotSize: string;
  yearBuilt: string;
  parking: string;
  basement: string;
  heating: string;
  cooling: string;
  hoa: string;
  condition: string;
  occupancyStatus: string;
  showingInstructions: string;
  keyFeatures: string;
  upgrades: string;
  sellerDescription: string;
  agentNotes: string;
}

interface BaseLead {
  id: string;
  type: LeadType;
  name: string;
  status: LeadStatus;
  phone: string;
  email: string;
  preferredContactMethod: string;
  source: string;
  assignedAgent: string;
  area: string;
  lastContact: string;
  nextFollowUp: string;
  documents: string[];
  activity: string[];
  notes: string;
  contactRank: number;
}

interface BuyerLead extends BaseLead {
  type: 'buyer';
  budgetMin: string;
  budgetMax: string;
  preferredAreas: string[];
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  squareFootageRange: string;
  mustHaves: string;
  niceToHaves: string;
  dealBreakers: string;
  timeline: string;
  firstTimeBuyer: string;
  preapproved: string;
  preapprovalAmount: string;
  lender: string;
  currentHousingSituation: string;
  motivation: string;
}

interface SellerLead extends BaseLead {
  type: 'seller';
  targetSaleTimeline: string;
  reasonForSelling: string;
  expectedListingPrice: string;
  agentEstimatedValue: string;
  occupancyStatus: string;
  hasMortgage: string;
  needsToBuyAfterSelling: string;
  listingAppointmentDate: string;
  sellerUrgency: string;
  houseProfile?: HouseProfile;
}

type CrmLead = BuyerLead | SellerLead;
type BuyerLeadSeed = Omit<BuyerLead, 'contactRank'>;
type SellerLeadSeed = Omit<SellerLead, 'contactRank'>;

const emptyHouseProfile: HouseProfile = {
  address: '',
  city: '',
  state: 'IL',
  zip: '',
  propertyType: '',
  estimatedListingPrice: '',
  bedrooms: '',
  bathrooms: '',
  squareFeet: '',
  lotSize: '',
  yearBuilt: '',
  parking: '',
  basement: '',
  heating: '',
  cooling: '',
  hoa: '',
  condition: '',
  occupancyStatus: '',
  showingInstructions: '',
  keyFeatures: '',
  upgrades: '',
  sellerDescription: '',
  agentNotes: ''
};

const buyerLeadSeeds = [
  {
    id: 'buyer-001',
    type: 'buyer',
    name: 'James Okafor',
    status: 'New',
    phone: '(312) 555-0140',
    email: 'james.okafor@example.com',
    preferredContactMethod: 'Text',
    source: 'Website inquiry',
    assignedAgent: 'Mara Chen',
    area: 'Logan Square',
    lastContact: 'Today',
    nextFollowUp: 'Tomorrow, 10:00 AM',
    budgetMin: '$450K',
    budgetMax: '$520K',
    preferredAreas: ['Logan Square', 'Avondale', 'Bucktown'],
    bedrooms: '2+',
    bathrooms: '2',
    propertyType: 'Condo',
    squareFootageRange: '1,000-1,400 sqft',
    mustHaves: 'Transit access, outdoor space',
    niceToHaves: 'Garage parking, newer kitchen',
    dealBreakers: 'Garden unit, high HOA',
    timeline: '60 days',
    firstTimeBuyer: 'Yes',
    preapproved: 'Yes',
    preapprovalAmount: '$550K',
    lender: 'Guaranteed Rate',
    currentHousingSituation: 'Renting in Logan Square',
    motivation: 'Lease ending this summer',
    documents: ['Preapproval letter'],
    activity: [
      'Inquiry received from listing portal',
      'Budget confirmed by text'
    ],
    notes: 'Wants a condo near transit with outdoor space.'
  },
  {
    id: 'buyer-002',
    type: 'buyer',
    name: 'Marcus Webb',
    status: 'Hot',
    phone: '(773) 555-0199',
    email: 'marcus.webb@example.com',
    preferredContactMethod: 'Call',
    source: 'Agent referral',
    assignedAgent: 'Noah Vale',
    area: 'River North',
    lastContact: 'Yesterday',
    nextFollowUp: 'Today, 4:00 PM',
    budgetMin: '$1M',
    budgetMax: '$1.2M',
    preferredAreas: ['River North', 'Streeterville', 'West Loop'],
    bedrooms: '3+',
    bathrooms: '2.5+',
    propertyType: 'Condo',
    squareFootageRange: '1,800-2,400 sqft',
    mustHaves: 'Full-service building, parking, skyline view',
    niceToHaves: 'Fitness center, balcony',
    dealBreakers: 'No parking, investor-heavy building',
    timeline: '30 days',
    firstTimeBuyer: 'No',
    preapproved: 'Yes',
    preapprovalAmount: '$1.25M',
    lender: 'Chase Private Client',
    currentHousingSituation: 'Selling out of state',
    motivation: 'Corporate relocation',
    documents: ['Proof of funds', 'Lender intro'],
    activity: ['Requested Saturday tour block', 'Viewed 4 saved listings'],
    notes: 'Ready to tour full-service buildings this week.'
  },
  {
    id: 'buyer-003',
    type: 'buyer',
    name: 'Sarah Chen',
    status: 'Matched',
    phone: '(312) 555-0164',
    email: 'sarah.chen@example.com',
    preferredContactMethod: 'Email',
    source: 'Open house',
    assignedAgent: 'Elena Ruiz',
    area: 'Lincoln Park',
    lastContact: 'May 3',
    nextFollowUp: 'May 7, 9:30 AM',
    budgetMin: '$760K',
    budgetMax: '$850K',
    preferredAreas: ['Lincoln Park', 'Lakeview'],
    bedrooms: '3',
    bathrooms: '2',
    propertyType: 'Townhome',
    squareFootageRange: '1,600-2,100 sqft',
    mustHaves: 'School district, family room',
    niceToHaves: 'Small yard, finished basement',
    dealBreakers: 'Major renovation',
    timeline: '90 days',
    firstTimeBuyer: 'No',
    preapproved: 'Pending',
    preapprovalAmount: '$850K target',
    lender: 'TBD',
    currentHousingSituation: 'Owns condo',
    motivation: 'More space near schools',
    documents: ['Buyer intake'],
    activity: ['Match brief sent', 'Asked about school boundaries'],
    notes: 'Matched to two townhome options near schools.'
  },
  {
    id: 'buyer-004',
    type: 'buyer',
    name: 'Elena Torres',
    status: 'Active',
    phone: '(708) 555-0128',
    email: 'elena.torres@example.com',
    preferredContactMethod: 'Text',
    source: 'Zillow',
    assignedAgent: 'Mara Chen',
    area: 'Wicker Park',
    lastContact: 'May 2',
    nextFollowUp: 'May 6, 2:00 PM',
    budgetMin: '$650K',
    budgetMax: '$720K',
    preferredAreas: ['Wicker Park', 'Ukrainian Village'],
    bedrooms: '2',
    bathrooms: '2',
    propertyType: 'Condo',
    squareFootageRange: '1,200-1,600 sqft',
    mustHaves: 'Deeded parking, newer construction',
    niceToHaves: 'Private roof deck',
    dealBreakers: 'Walk-up above third floor',
    timeline: '45 days',
    firstTimeBuyer: 'Yes',
    preapproved: 'Yes',
    preapprovalAmount: '$750K',
    lender: 'Wintrust',
    currentHousingSituation: 'Renting',
    motivation: 'Wants to stop renting',
    documents: ['Agency agreement'],
    activity: ['Completed needs analysis', 'Saved parking-filtered search'],
    notes: 'Prefers newer construction and deeded parking.'
  },
  {
    id: 'buyer-005',
    type: 'buyer',
    name: 'David Kim',
    status: 'Prospect',
    phone: '(312) 555-0115',
    email: 'david.kim@example.com',
    preferredContactMethod: 'Email',
    source: 'Newsletter',
    assignedAgent: 'Noah Vale',
    area: 'Gold Coast',
    lastContact: 'Apr 30',
    nextFollowUp: 'May 14',
    budgetMin: '$850K',
    budgetMax: '$950K',
    preferredAreas: ['Gold Coast', 'Old Town'],
    bedrooms: '2+',
    bathrooms: '2',
    propertyType: 'Condo',
    squareFootageRange: '1,300-1,900 sqft',
    mustHaves: 'Doorman, lake access',
    niceToHaves: 'Balcony, valet parking',
    dealBreakers: 'High special assessments',
    timeline: '6 months',
    firstTimeBuyer: 'No',
    preapproved: 'No',
    preapprovalAmount: 'Not started',
    lender: 'Needs referral',
    currentHousingSituation: 'Owns primary residence',
    motivation: 'Potential city pied-a-terre',
    documents: ['Market snapshot'],
    activity: ['Subscribed to neighborhood alert', 'Opened pricing report'],
    notes: 'Early research phase, wants monthly market updates.'
  },
  {
    id: 'buyer-006',
    type: 'buyer',
    name: 'Angela Ross',
    status: 'Stale',
    phone: '(872) 555-0181',
    email: 'angela.ross@example.com',
    preferredContactMethod: 'Text',
    source: 'Past client referral',
    assignedAgent: 'Elena Ruiz',
    area: 'Bridgeport',
    lastContact: 'Apr 21',
    nextFollowUp: 'May 8',
    budgetMin: '$340K',
    budgetMax: '$380K',
    preferredAreas: ['Bridgeport', 'McKinley Park'],
    bedrooms: '2',
    bathrooms: '1.5+',
    propertyType: 'Single family',
    squareFootageRange: '900-1,300 sqft',
    mustHaves: 'Yard, low taxes',
    niceToHaves: 'Finished basement',
    dealBreakers: 'Flood history',
    timeline: 'Unknown',
    firstTimeBuyer: 'Yes',
    preapproved: 'Expired',
    preapprovalAmount: '$390K expired',
    lender: 'Needs refresh',
    currentHousingSituation: 'Renting',
    motivation: 'Needs reactivation',
    documents: ['Old preapproval'],
    activity: ['No response to follow-up', 'Last search opened Apr 22'],
    notes: 'Needs reactivation and updated lender conversation.'
  }
] satisfies BuyerLeadSeed[];

const sellerLeadSeeds = [
  {
    id: 'seller-001',
    type: 'seller',
    name: 'Robert Hunt',
    status: 'New',
    phone: '(312) 555-0107',
    email: 'robert.hunt@example.com',
    preferredContactMethod: 'Call',
    source: 'Home valuation page',
    assignedAgent: 'Mara Chen',
    area: 'Hyde Park',
    lastContact: 'Today',
    nextFollowUp: 'Tomorrow, 1:00 PM',
    targetSaleTimeline: '60 days',
    reasonForSelling: 'Relocating for work',
    expectedListingPrice: '$890K',
    agentEstimatedValue: '$860K-$900K',
    occupancyStatus: 'Owner occupied',
    hasMortgage: 'Yes',
    needsToBuyAfterSelling: 'No',
    listingAppointmentDate: 'May 9',
    sellerUrgency: 'Medium',
    houseProfile: {
      ...emptyHouseProfile,
      address: '5410 S Harper Ave',
      city: 'Chicago',
      zip: '60615',
      propertyType: 'Single family',
      estimatedListingPrice: '$890K',
      bedrooms: '4',
      bathrooms: '3',
      squareFeet: '2,650',
      lotSize: '3,900 sqft',
      yearBuilt: '1912',
      parking: '2-car garage',
      basement: 'Finished',
      heating: 'Gas forced air',
      cooling: 'Central air',
      hoa: 'None',
      condition: 'Updated',
      occupancyStatus: 'Owner occupied',
      showingInstructions: 'Appointment only',
      keyFeatures: 'Sunroom, original millwork, renovated kitchen',
      upgrades: 'Kitchen 2022, HVAC 2021',
      sellerDescription: 'Classic Hyde Park home near campus.',
      agentNotes: 'Prep exterior paint before photos.'
    },
    documents: ['Seller intake'],
    activity: ['Valuation request submitted', 'Asked for staging vendor'],
    notes: 'Needs CMA and prep checklist before signing.'
  },
  {
    id: 'seller-002',
    type: 'seller',
    name: 'Mei Tanaka',
    status: 'Under contract',
    phone: '(773) 555-0148',
    email: 'mei.tanaka@example.com',
    preferredContactMethod: 'Email',
    source: 'Past client',
    assignedAgent: 'Noah Vale',
    area: 'Pilsen',
    lastContact: 'Yesterday',
    nextFollowUp: 'May 8',
    targetSaleTimeline: 'Closing May 28',
    reasonForSelling: 'Upsizing',
    expectedListingPrice: '$540K',
    agentEstimatedValue: '$535K',
    occupancyStatus: 'Owner occupied',
    hasMortgage: 'Yes',
    needsToBuyAfterSelling: 'Yes',
    listingAppointmentDate: 'Completed',
    sellerUrgency: 'High',
    houseProfile: undefined,
    documents: ['Executed contract', 'Inspection response'],
    activity: ['Contract packet uploaded', 'Closing timeline confirmed'],
    notes: 'Attorney review complete, inspection credits resolved.'
  },
  {
    id: 'seller-003',
    type: 'seller',
    name: 'Tom Briggs',
    status: 'Active',
    phone: '(312) 555-0194',
    email: 'tom.briggs@example.com',
    preferredContactMethod: 'Call',
    source: 'Sphere',
    assignedAgent: 'Elena Ruiz',
    area: 'Lincoln Square',
    lastContact: 'May 3',
    nextFollowUp: 'May 6, 5:00 PM',
    targetSaleTimeline: 'Now',
    reasonForSelling: 'Downsizing',
    expectedListingPrice: '$1.1M',
    agentEstimatedValue: '$1.08M',
    occupancyStatus: 'Owner occupied',
    hasMortgage: 'No',
    needsToBuyAfterSelling: 'No',
    listingAppointmentDate: 'Completed',
    sellerUrgency: 'High',
    houseProfile: {
      ...emptyHouseProfile,
      address: '2231 W Wilson Ave',
      city: 'Chicago',
      zip: '60625',
      propertyType: 'Single family',
      estimatedListingPrice: '$1.1M',
      bedrooms: '5',
      bathrooms: '3.5',
      squareFeet: '3,200',
      lotSize: '4,600 sqft',
      yearBuilt: '1908',
      parking: 'Garage',
      basement: 'Partially finished',
      heating: 'Radiant',
      cooling: 'SpacePak',
      hoa: 'None',
      condition: 'Good',
      occupancyStatus: 'Owner occupied',
      showingInstructions: 'Use ShowingTime',
      keyFeatures: 'Wide lot, vintage details, chef kitchen',
      upgrades: 'Roof 2020, baths refreshed 2023',
      sellerDescription: 'Large family home near Lincoln Square retail.',
      agentNotes: 'Monitor price feedback after second weekend.'
    },
    documents: ['Listing agreement', 'Disclosures'],
    activity: ['Weekend showing report sent', 'Price feedback logged'],
    notes: 'Open house produced three qualified follow-ups.'
  },
  {
    id: 'seller-004',
    type: 'seller',
    name: 'Fatima Al-Hassan',
    status: 'Active',
    phone: '(224) 555-0162',
    email: 'fatima.alhassan@example.com',
    preferredContactMethod: 'Text',
    source: 'Instagram campaign',
    assignedAgent: 'Mara Chen',
    area: 'Andersonville',
    lastContact: 'May 1',
    nextFollowUp: 'May 6',
    targetSaleTimeline: '45 days',
    reasonForSelling: 'Moving closer to family',
    expectedListingPrice: '$420K',
    agentEstimatedValue: '$410K-$430K',
    occupancyStatus: 'Owner occupied',
    hasMortgage: 'Yes',
    needsToBuyAfterSelling: 'No',
    listingAppointmentDate: 'May 12',
    sellerUrgency: 'Medium',
    houseProfile: undefined,
    documents: ['Photo set', 'MLS draft'],
    activity: ['Photos delivered', 'MLS draft shared'],
    notes: 'Photography complete; launch copy needs approval.'
  },
  {
    id: 'seller-005',
    type: 'seller',
    name: 'Priya Nair',
    status: 'Prospect',
    phone: '(773) 555-0176',
    email: 'priya.nair@example.com',
    preferredContactMethod: 'Email',
    source: 'CMA request',
    assignedAgent: 'Noah Vale',
    area: 'Lakeview',
    lastContact: 'Apr 29',
    nextFollowUp: 'May 15',
    targetSaleTimeline: 'Fall',
    reasonForSelling: 'Testing market',
    expectedListingPrice: '$675K',
    agentEstimatedValue: '$650K-$680K',
    occupancyStatus: 'Tenant occupied',
    hasMortgage: 'Yes',
    needsToBuyAfterSelling: 'Maybe',
    listingAppointmentDate: 'Not scheduled',
    sellerUrgency: 'Low',
    houseProfile: undefined,
    documents: ['CMA report'],
    activity: ['CMA opened', 'Asked about private buyer list'],
    notes: 'Considering off-market preview before public listing.'
  },
  {
    id: 'seller-006',
    type: 'seller',
    name: 'Chris Park',
    status: 'Stale',
    phone: '(312) 555-0133',
    email: 'chris.park@example.com',
    preferredContactMethod: 'Text',
    source: 'Rental investor list',
    assignedAgent: 'Elena Ruiz',
    area: 'West Loop',
    lastContact: 'Apr 18',
    nextFollowUp: 'May 10',
    targetSaleTimeline: 'Paused',
    reasonForSelling: 'Waiting for lease end',
    expectedListingPrice: '$650K',
    agentEstimatedValue: '$625K-$655K',
    occupancyStatus: 'Tenant occupied',
    hasMortgage: 'Yes',
    needsToBuyAfterSelling: 'No',
    listingAppointmentDate: 'Not scheduled',
    sellerUrgency: 'Low',
    houseProfile: undefined,
    documents: ['Rental comp sheet'],
    activity: ['Lease timing note added', 'No response to valuation update'],
    notes: 'Follow up after tenant renewal decision.'
  }
] satisfies SellerLeadSeed[];

const initialBuyerLeads: BuyerLead[] = buyerLeadSeeds.map((lead, index) => ({
  ...lead,
  contactRank: index
}));

const initialSellerLeads: SellerLead[] = sellerLeadSeeds.map((lead, index) => ({
  ...lead,
  contactRank: index
}));

const sortTabs: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'budget', label: 'Budget' },
  { key: 'name', label: 'Name' }
];

const statusOptions: LeadStatus[] = [
  'Active',
  'Hot',
  'Matched',
  'Prospect',
  'Stale',
  'New',
  'Under contract'
];

function parseCurrency(value: string) {
  const numeric = Number(value.replaceAll(/[^0-9.]/g, ''));
  if (value.toLowerCase().includes('m')) return numeric * 1_000_000;
  if (value.toLowerCase().includes('k')) return numeric * 1_000;
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatBudgetRange(lead: BuyerLead) {
  return `${lead.budgetMin}-${lead.budgetMax}`;
}

function leadValue(lead: CrmLead) {
  return lead.type === 'buyer'
    ? formatBudgetRange(lead)
    : lead.expectedListingPrice;
}

function leadValueNumber(lead: CrmLead) {
  return lead.type === 'buyer'
    ? parseCurrency(lead.budgetMax)
    : parseCurrency(lead.expectedListingPrice);
}

function statusClass(status: string) {
  if (status === 'Active') return 'border-green-500 bg-green-500 text-white';
  if (status === 'Hot') return 'border-red-500 bg-red-500 text-white';
  if (status === 'Matched') return 'border-purple-500 bg-purple-500 text-white';
  if (status === 'Prospect')
    return 'border-orange-500 bg-orange-500 text-white';
  if (status === 'Stale') return 'border-yellow-400 bg-yellow-400 text-black';
  if (status === 'Under contract')
    return 'border-blue-500 bg-blue-500 text-white';
  return 'border-muted-foreground/40 bg-background text-foreground';
}

function filterAndSortLeads<T extends CrmLead>(leads: T[], sort: SortKey) {
  return leads.toSorted((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'budget') return leadValueNumber(b) - leadValueNumber(a);
    return a.contactRank - b.contactRank;
  });
}

function makeId(type: LeadType) {
  return `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function splitList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLines(items: string[]) {
  return items.join('\n');
}

function fieldValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function fieldOrDash(formData: FormData, key: string) {
  return fieldValue(formData, key) || '—';
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = '';
  let quoted = false;

  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values.map((value) => value.replace(/^"|"$/g, ''));
}

function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const [headerLine, ...rows] = lines;
  if (!headerLine) return [];

  const headers = parseCsvLine(headerLine);
  return rows.map((row) => {
    const values = parseCsvLine(row);
    return headers.reduce<Record<string, string>>((record, header, index) => {
      record[header] = values[index] ?? '';
      return record;
    }, {});
  });
}

function toBuyerLead(formData: FormData, rank: number): BuyerLead {
  return {
    id: makeId('buyer'),
    type: 'buyer',
    name: fieldOrDash(formData, 'name'),
    status: (fieldValue(formData, 'status') || 'Prospect') as LeadStatus,
    phone: fieldOrDash(formData, 'phone'),
    email: fieldOrDash(formData, 'email'),
    preferredContactMethod: fieldOrDash(formData, 'preferredContactMethod'),
    source: fieldOrDash(formData, 'source'),
    assignedAgent: fieldOrDash(formData, 'assignedAgent'),
    area: fieldOrDash(formData, 'area'),
    lastContact: fieldOrDash(formData, 'lastContact'),
    nextFollowUp: fieldOrDash(formData, 'nextFollowUp'),
    budgetMin: fieldOrDash(formData, 'budgetMin'),
    budgetMax: fieldOrDash(formData, 'budgetMax'),
    preferredAreas: splitList(fieldValue(formData, 'preferredAreas')),
    bedrooms: fieldOrDash(formData, 'bedrooms'),
    bathrooms: fieldOrDash(formData, 'bathrooms'),
    propertyType: fieldOrDash(formData, 'propertyType'),
    squareFootageRange: fieldOrDash(formData, 'squareFootageRange'),
    mustHaves: fieldOrDash(formData, 'mustHaves'),
    niceToHaves: fieldOrDash(formData, 'niceToHaves'),
    dealBreakers: fieldOrDash(formData, 'dealBreakers'),
    timeline: fieldOrDash(formData, 'timeline'),
    firstTimeBuyer: fieldOrDash(formData, 'firstTimeBuyer'),
    preapproved: fieldOrDash(formData, 'preapproved'),
    preapprovalAmount: fieldOrDash(formData, 'preapprovalAmount'),
    lender: fieldOrDash(formData, 'lender'),
    currentHousingSituation: fieldOrDash(formData, 'currentHousingSituation'),
    motivation: fieldOrDash(formData, 'motivation'),
    documents: ['Manual entry'],
    activity: ['Lead created manually'],
    notes: fieldValue(formData, 'notes'),
    contactRank: rank
  };
}

function toSellerLead(formData: FormData, rank: number): SellerLead {
  return {
    id: makeId('seller'),
    type: 'seller',
    name: fieldOrDash(formData, 'name'),
    status: (fieldValue(formData, 'status') || 'Prospect') as LeadStatus,
    phone: fieldOrDash(formData, 'phone'),
    email: fieldOrDash(formData, 'email'),
    preferredContactMethod: fieldOrDash(formData, 'preferredContactMethod'),
    source: fieldOrDash(formData, 'source'),
    assignedAgent: fieldOrDash(formData, 'assignedAgent'),
    area: fieldOrDash(formData, 'area'),
    lastContact: fieldOrDash(formData, 'lastContact'),
    nextFollowUp: fieldOrDash(formData, 'nextFollowUp'),
    targetSaleTimeline: fieldOrDash(formData, 'targetSaleTimeline'),
    reasonForSelling: fieldOrDash(formData, 'reasonForSelling'),
    expectedListingPrice: fieldOrDash(formData, 'expectedListingPrice'),
    agentEstimatedValue: fieldOrDash(formData, 'agentEstimatedValue'),
    occupancyStatus: fieldOrDash(formData, 'occupancyStatus'),
    hasMortgage: fieldOrDash(formData, 'hasMortgage'),
    needsToBuyAfterSelling: fieldOrDash(formData, 'needsToBuyAfterSelling'),
    listingAppointmentDate: fieldOrDash(formData, 'listingAppointmentDate'),
    sellerUrgency: fieldOrDash(formData, 'sellerUrgency'),
    houseProfile: undefined,
    documents: ['Manual entry'],
    activity: ['Lead created manually'],
    notes: fieldValue(formData, 'notes'),
    contactRank: rank
  };
}

function editedLeadFromForm(lead: CrmLead, formData: FormData): CrmLead {
  const base = {
    ...lead,
    name: fieldOrDash(formData, 'name'),
    status: (fieldValue(formData, 'status') || lead.status) as LeadStatus,
    phone: fieldOrDash(formData, 'phone'),
    email: fieldOrDash(formData, 'email'),
    preferredContactMethod: fieldOrDash(formData, 'preferredContactMethod'),
    source: fieldOrDash(formData, 'source'),
    assignedAgent: fieldOrDash(formData, 'assignedAgent'),
    area: fieldOrDash(formData, 'area'),
    lastContact: fieldOrDash(formData, 'lastContact'),
    nextFollowUp: fieldOrDash(formData, 'nextFollowUp'),
    documents: splitLines(fieldValue(formData, 'documents')),
    activity: splitLines(fieldValue(formData, 'activity')),
    notes: fieldValue(formData, 'notes')
  };

  if (lead.type === 'buyer') {
    return {
      ...base,
      type: 'buyer',
      budgetMin: fieldOrDash(formData, 'budgetMin'),
      budgetMax: fieldOrDash(formData, 'budgetMax'),
      preferredAreas: splitList(fieldValue(formData, 'preferredAreas')),
      bedrooms: fieldOrDash(formData, 'bedrooms'),
      bathrooms: fieldOrDash(formData, 'bathrooms'),
      propertyType: fieldOrDash(formData, 'propertyType'),
      squareFootageRange: fieldOrDash(formData, 'squareFootageRange'),
      mustHaves: fieldOrDash(formData, 'mustHaves'),
      niceToHaves: fieldOrDash(formData, 'niceToHaves'),
      dealBreakers: fieldOrDash(formData, 'dealBreakers'),
      timeline: fieldOrDash(formData, 'timeline'),
      firstTimeBuyer: fieldOrDash(formData, 'firstTimeBuyer'),
      preapproved: fieldOrDash(formData, 'preapproved'),
      preapprovalAmount: fieldOrDash(formData, 'preapprovalAmount'),
      lender: fieldOrDash(formData, 'lender'),
      currentHousingSituation: fieldOrDash(formData, 'currentHousingSituation'),
      motivation: fieldOrDash(formData, 'motivation')
    };
  }

  return {
    ...base,
    type: 'seller',
    targetSaleTimeline: fieldOrDash(formData, 'targetSaleTimeline'),
    reasonForSelling: fieldOrDash(formData, 'reasonForSelling'),
    expectedListingPrice: fieldOrDash(formData, 'expectedListingPrice'),
    agentEstimatedValue: fieldOrDash(formData, 'agentEstimatedValue'),
    occupancyStatus: fieldOrDash(formData, 'occupancyStatus'),
    hasMortgage: fieldOrDash(formData, 'hasMortgage'),
    needsToBuyAfterSelling: fieldOrDash(formData, 'needsToBuyAfterSelling'),
    listingAppointmentDate: fieldOrDash(formData, 'listingAppointmentDate'),
    sellerUrgency: fieldOrDash(formData, 'sellerUrgency'),
    houseProfile: lead.houseProfile
  };
}

function csvRowToLead(row: Record<string, string>, rank: number): CrmLead {
  const type = row.type?.toLowerCase() === 'seller' ? 'seller' : 'buyer';
  const status = (row.status || 'Prospect') as LeadStatus;
  const base = {
    id: makeId(type),
    name: row.fullName || 'Unnamed lead',
    status,
    phone: row.phone || '—',
    email: row.email || '—',
    preferredContactMethod: '—',
    source: row.source || 'CSV import',
    assignedAgent: 'Unassigned',
    area: row.area || '—',
    lastContact: 'Imported',
    nextFollowUp: '—',
    documents: ['CSV import'],
    activity: ['Imported from CSV'],
    notes: row.notes || '',
    contactRank: rank
  };

  if (type === 'seller') {
    return {
      ...base,
      type: 'seller',
      targetSaleTimeline: row.timeline || '—',
      reasonForSelling: '—',
      expectedListingPrice: row.listingValue || '—',
      agentEstimatedValue: row.listingValue || '—',
      occupancyStatus: '—',
      hasMortgage: '—',
      needsToBuyAfterSelling: '—',
      listingAppointmentDate: '—',
      sellerUrgency: '—',
      houseProfile: undefined
    };
  }

  return {
    ...base,
    type: 'buyer',
    budgetMin: row.budgetMin || '—',
    budgetMax: row.budgetMax || '—',
    preferredAreas: row.area ? [row.area] : [],
    bedrooms: row.bedrooms || '—',
    bathrooms: row.bathrooms || '—',
    propertyType: '—',
    squareFootageRange: '—',
    mustHaves: '—',
    niceToHaves: '—',
    dealBreakers: '—',
    timeline: row.timeline || '—',
    firstTimeBuyer: '—',
    preapproved: '—',
    preapprovalAmount: '—',
    lender: '—',
    currentHousingSituation: '—',
    motivation: '—'
  };
}

function publishLocalSearchLeads(leads: CrmLead[]) {
  window.dispatchEvent(
    new CustomEvent(LOCAL_LEADS_EVENT, {
      detail: leads.map((lead) => ({
        id: lead.id,
        type: lead.type,
        name: lead.name,
        area: lead.area,
        status: lead.status,
        email: lead.email,
        phone: lead.phone
      }))
    })
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant='outline'
      className={cn('font-mono text-[0.62rem] uppercase', statusClass(status))}
    >
      {status}
    </Badge>
  );
}

function Field({
  label,
  name,
  defaultValue = '',
  type = 'text'
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className='grid gap-1 text-xs font-medium'>
      {label}
      <Input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className='h-8 rounded-none text-xs shadow-none'
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: string[];
}) {
  return (
    <label className='grid gap-1 text-xs font-medium'>
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className='border-input bg-background h-8 rounded-none border px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/35'
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextareaField({
  label,
  name,
  defaultValue = ''
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className='grid gap-1 text-xs font-medium md:col-span-2'>
      {label}
      <Textarea
        name={name}
        defaultValue={defaultValue}
        className='min-h-20 rounded-none text-xs shadow-none'
      />
    </label>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='grid grid-cols-[128px_minmax(0,1fr)] gap-3 border-b py-2 text-xs last:border-b-0'>
      <dt className='text-muted-foreground'>{label}</dt>
      <dd className='min-w-0 font-medium break-words'>{value || '—'}</dd>
    </div>
  );
}

function PanelSection({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className='border-b px-4 py-3'>
      <h3 className='mb-2 text-xs font-semibold tracking-wide uppercase'>
        {title}
      </h3>
      <dl>{children}</dl>
    </section>
  );
}

function CollapsiblePanelSection({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
  return (
    <Collapsible className='border-b'>
      <CollapsibleTrigger className='hover:bg-muted/50 flex w-full items-center justify-between px-4 py-3 text-xs font-semibold tracking-wide uppercase'>
        {title}
        <Icons.chevronDown className='text-muted-foreground size-4' />
      </CollapsibleTrigger>
      <CollapsibleContent className='px-4 pb-3'>
        <ul className='space-y-2 text-xs'>
          {items.map((item) => (
            <li key={item} className='text-muted-foreground border-l pl-2'>
              {item}
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface LeadColumnProps<T extends CrmLead> {
  title: string;
  leads: T[];
  sort: SortKey;
  selectedLeadId?: string;
  onSortChange: (value: SortKey) => void;
  onSelectLead: (lead: T) => void;
}

function LeadColumn<T extends CrmLead>({
  title,
  leads,
  sort,
  selectedLeadId,
  onSortChange,
  onSelectLead
}: LeadColumnProps<T>) {
  return (
    <section className='bg-background min-w-0 border-y md:border-x md:first:border-r-0'>
      <div className='flex h-full min-h-[520px] flex-col'>
        <div className='flex items-center justify-between border-b px-3 py-2'>
          <h2 className='text-sm font-semibold'>{title}</h2>
          <span className='text-muted-foreground font-mono text-xs'>
            {leads.length}
          </span>
        </div>
        <div className='flex items-center gap-1 border-b p-2'>
          {sortTabs.map((tab) => (
            <button
              key={tab.key}
              type='button'
              onClick={() => onSortChange(tab.key)}
              className={cn(
                'h-7 border px-2.5 text-[0.68rem] font-medium transition-colors',
                sort === tab.key
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className='min-h-0 flex-1 overflow-auto'>
          {leads.map((lead) => {
            const isSelected = lead.id === selectedLeadId;

            return (
              <button
                key={lead.id}
                type='button'
                onClick={() => onSelectLead(lead)}
                className={cn(
                  'grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-b px-3 py-2.5 text-left text-sm transition-colors',
                  'hover:bg-muted/50 focus-visible:ring-ring/35 focus-visible:ring-2 focus-visible:outline-none',
                  isSelected &&
                    'bg-muted/70 shadow-[inset_3px_0_0_var(--primary)]'
                )}
              >
                <span className='min-w-0'>
                  <span className='block truncate font-medium'>
                    {lead.name}
                  </span>
                  <span className='text-muted-foreground mt-0.5 block truncate text-xs'>
                    {lead.area}
                  </span>
                </span>
                <span className='font-mono text-xs whitespace-nowrap'>
                  {leadValue(lead)}
                </span>
                <StatusBadge status={lead.status} />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HouseProfileBlock({
  lead,
  onEdit
}: {
  lead: SellerLead;
  onEdit: (lead: SellerLead) => void;
}) {
  const profile = lead.houseProfile;

  return (
    <section className='px-4 py-3'>
      <div className='rounded-xl border bg-background shadow-xs'>
        <div className='flex items-center justify-between gap-2 border-b bg-muted/20 px-3 py-2.5'>
          <div className='min-w-0'>
            <h3 className='text-xs font-semibold tracking-wide uppercase'>
              Home Profile
            </h3>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              Seller property details and showing notes.
            </p>
          </div>
          <Button
            variant='outline'
            size='sm'
            type='button'
            onClick={() => onEdit(lead)}
          >
            <Icons.edit />
            {profile ? 'Edit' : 'Add'}
          </Button>
        </div>
        {profile ? (
          <dl className='px-3 py-1'>
            <DetailRow
              label='Address'
              value={`${profile.address}, ${profile.city}, ${profile.state} ${profile.zip}`}
            />
            <DetailRow label='Property type' value={profile.propertyType} />
            <DetailRow label='Price' value={profile.estimatedListingPrice} />
            <DetailRow label='Beds' value={profile.bedrooms} />
            <DetailRow label='Baths' value={profile.bathrooms} />
            <DetailRow label='Square feet' value={profile.squareFeet} />
            <DetailRow label='Lot size' value={profile.lotSize} />
            <DetailRow label='Year built' value={profile.yearBuilt} />
            <DetailRow label='Parking' value={profile.parking} />
            <DetailRow label='Basement' value={profile.basement} />
            <DetailRow label='Heating' value={profile.heating} />
            <DetailRow label='Cooling' value={profile.cooling} />
            <DetailRow label='HOA' value={profile.hoa} />
            <DetailRow label='Condition' value={profile.condition} />
            <DetailRow label='Occupancy' value={profile.occupancyStatus} />
            <DetailRow
              label='Showing instructions'
              value={profile.showingInstructions}
            />
            <DetailRow label='Key features' value={profile.keyFeatures} />
            <DetailRow label='Upgrades' value={profile.upgrades} />
            <DetailRow
              label='Seller description'
              value={profile.sellerDescription}
            />
            <DetailRow label='Agent notes' value={profile.agentNotes} />
          </dl>
        ) : (
          <div className='px-3 py-6 text-center'>
            <p className='text-sm font-medium'>No home profile yet</p>
            <p className='mt-1 text-xs text-muted-foreground'>
              Add property details before preparing listing materials.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function LeadEditDialog({
  lead,
  open,
  onOpenChange,
  onSave
}: {
  lead: CrmLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (lead: CrmLead) => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lead) return;

    onSave(editedLeadFromForm(lead, new FormData(event.currentTarget)));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[88vh] overflow-hidden rounded-lg p-0 sm:max-w-5xl'>
        <DialogHeader className='border-b px-4 py-3'>
          <DialogTitle className='text-base'>Edit Lead</DialogTitle>
          <DialogDescription className='text-xs'>
            Update contact details, profile fields, documents, activity, and
            notes.
          </DialogDescription>
        </DialogHeader>

        {lead && (
          <form
            onSubmit={handleSubmit}
            className='flex min-h-0 flex-col overflow-hidden'
          >
            <div className='min-h-0 flex-1 overflow-y-auto p-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <section className='rounded-lg border p-3 md:col-span-2'>
                  <h3 className='mb-3 text-xs font-semibold tracking-wide uppercase'>
                    Basics
                  </h3>
                  <div className='grid gap-3 md:grid-cols-2'>
                    <Field
                      label='Full name'
                      name='name'
                      defaultValue={lead.name}
                    />
                    <SelectField
                      label='Status'
                      name='status'
                      defaultValue={lead.status}
                      options={statusOptions}
                    />
                    <Field
                      label='Phone'
                      name='phone'
                      defaultValue={lead.phone}
                    />
                    <Field
                      label='Email'
                      name='email'
                      defaultValue={lead.email}
                    />
                    <Field
                      label='Preferred contact'
                      name='preferredContactMethod'
                      defaultValue={lead.preferredContactMethod}
                    />
                    <Field
                      label='Source'
                      name='source'
                      defaultValue={lead.source}
                    />
                    <Field
                      label='Assigned agent'
                      name='assignedAgent'
                      defaultValue={lead.assignedAgent}
                    />
                    <Field label='Area' name='area' defaultValue={lead.area} />
                    <Field
                      label='Last contact'
                      name='lastContact'
                      defaultValue={lead.lastContact}
                    />
                    <Field
                      label='Next follow-up'
                      name='nextFollowUp'
                      defaultValue={lead.nextFollowUp}
                    />
                  </div>
                </section>

                {lead.type === 'buyer' ? (
                  <>
                    <section className='rounded-lg border p-3 md:col-span-2'>
                      <h3 className='mb-3 text-xs font-semibold tracking-wide uppercase'>
                        Buyer Criteria
                      </h3>
                      <div className='grid gap-3 md:grid-cols-2'>
                        <Field
                          label='Budget min'
                          name='budgetMin'
                          defaultValue={lead.budgetMin}
                        />
                        <Field
                          label='Budget max'
                          name='budgetMax'
                          defaultValue={lead.budgetMax}
                        />
                        <Field
                          label='Preferred areas'
                          name='preferredAreas'
                          defaultValue={lead.preferredAreas.join(', ')}
                        />
                        <Field
                          label='Bedrooms'
                          name='bedrooms'
                          defaultValue={lead.bedrooms}
                        />
                        <Field
                          label='Bathrooms'
                          name='bathrooms'
                          defaultValue={lead.bathrooms}
                        />
                        <Field
                          label='Property type'
                          name='propertyType'
                          defaultValue={lead.propertyType}
                        />
                        <Field
                          label='Square footage'
                          name='squareFootageRange'
                          defaultValue={lead.squareFootageRange}
                        />
                        <TextareaField
                          label='Must-haves'
                          name='mustHaves'
                          defaultValue={lead.mustHaves}
                        />
                        <TextareaField
                          label='Nice-to-haves'
                          name='niceToHaves'
                          defaultValue={lead.niceToHaves}
                        />
                        <TextareaField
                          label='Deal breakers'
                          name='dealBreakers'
                          defaultValue={lead.dealBreakers}
                        />
                      </div>
                    </section>

                    <section className='rounded-lg border p-3 md:col-span-2'>
                      <h3 className='mb-3 text-xs font-semibold tracking-wide uppercase'>
                        Buying Situation
                      </h3>
                      <div className='grid gap-3 md:grid-cols-2'>
                        <Field
                          label='Timeline'
                          name='timeline'
                          defaultValue={lead.timeline}
                        />
                        <Field
                          label='First-time buyer'
                          name='firstTimeBuyer'
                          defaultValue={lead.firstTimeBuyer}
                        />
                        <Field
                          label='Preapproved'
                          name='preapproved'
                          defaultValue={lead.preapproved}
                        />
                        <Field
                          label='Preapproval amount'
                          name='preapprovalAmount'
                          defaultValue={lead.preapprovalAmount}
                        />
                        <Field
                          label='Lender'
                          name='lender'
                          defaultValue={lead.lender}
                        />
                        <Field
                          label='Housing situation'
                          name='currentHousingSituation'
                          defaultValue={lead.currentHousingSituation}
                        />
                        <TextareaField
                          label='Motivation'
                          name='motivation'
                          defaultValue={lead.motivation}
                        />
                      </div>
                    </section>
                  </>
                ) : (
                  <section className='rounded-lg border p-3 md:col-span-2'>
                    <h3 className='mb-3 text-xs font-semibold tracking-wide uppercase'>
                      Seller Situation
                    </h3>
                    <div className='grid gap-3 md:grid-cols-2'>
                      <Field
                        label='Sale timeline'
                        name='targetSaleTimeline'
                        defaultValue={lead.targetSaleTimeline}
                      />
                      <Field
                        label='Reason'
                        name='reasonForSelling'
                        defaultValue={lead.reasonForSelling}
                      />
                      <Field
                        label='Expected price'
                        name='expectedListingPrice'
                        defaultValue={lead.expectedListingPrice}
                      />
                      <Field
                        label='Agent estimate'
                        name='agentEstimatedValue'
                        defaultValue={lead.agentEstimatedValue}
                      />
                      <Field
                        label='Occupancy'
                        name='occupancyStatus'
                        defaultValue={lead.occupancyStatus}
                      />
                      <Field
                        label='Has mortgage'
                        name='hasMortgage'
                        defaultValue={lead.hasMortgage}
                      />
                      <Field
                        label='Buy after selling'
                        name='needsToBuyAfterSelling'
                        defaultValue={lead.needsToBuyAfterSelling}
                      />
                      <Field
                        label='Listing appointment'
                        name='listingAppointmentDate'
                        defaultValue={lead.listingAppointmentDate}
                      />
                      <Field
                        label='Urgency'
                        name='sellerUrgency'
                        defaultValue={lead.sellerUrgency}
                      />
                    </div>
                  </section>
                )}

                <section className='rounded-lg border p-3 md:col-span-2'>
                  <h3 className='mb-3 text-xs font-semibold tracking-wide uppercase'>
                    Workspace Records
                  </h3>
                  <div className='grid gap-3 md:grid-cols-2'>
                    <TextareaField
                      label='Documents'
                      name='documents'
                      defaultValue={joinLines(lead.documents)}
                    />
                    <TextareaField
                      label='Activity'
                      name='activity'
                      defaultValue={joinLines(lead.activity)}
                    />
                    <TextareaField
                      label='Notes'
                      name='notes'
                      defaultValue={lead.notes}
                    />
                  </div>
                </section>
              </div>
            </div>

            <DialogFooter className='border-t p-4'>
              <Button
                variant='outline'
                type='button'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit'>Save Lead</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function LeadProfilePanel({
  lead,
  onClose,
  onNoteChange,
  onEditLead,
  onEditHouseProfile
}: {
  lead: CrmLead;
  onClose: () => void;
  onNoteChange: (leadId: string, value: string) => void;
  onEditLead: (lead: CrmLead) => void;
  onEditHouseProfile: (lead: SellerLead) => void;
}) {
  return (
    <aside className='bg-background fixed inset-y-0 right-0 z-50 flex w-[min(100vw,410px)] flex-col border-l lg:static lg:z-auto lg:w-[380px] xl:w-[410px]'>
      <div className='border-b px-4 py-3'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <h2 className='truncate text-base font-semibold'>{lead.name}</h2>
              <StatusBadge status={lead.status} />
            </div>
            <p className='text-muted-foreground mt-1 text-xs uppercase'>
              {lead.type}
            </p>
          </div>
          <div className='flex shrink-0 items-center gap-1'>
            <Button
              variant='outline'
              size='sm'
              type='button'
              onClick={() => onEditLead(lead)}
            >
              <Icons.edit />
              Edit
            </Button>
            <Button
              variant='ghost'
              size='icon'
              type='button'
              onClick={onClose}
              aria-label='Close lead profile'
            >
              <Icons.close />
            </Button>
          </div>
        </div>
        <div className='mt-3 grid grid-cols-3 gap-1'>
          <Button variant='outline' size='sm' type='button'>
            <Icons.phone />
            Call
          </Button>
          <Button variant='outline' size='sm' type='button'>
            <Icons.chat />
            Text
          </Button>
          <Button variant='outline' size='sm' type='button'>
            <Icons.send />
            Email
          </Button>
        </div>
      </div>
      <div className='min-h-0 flex-1 overflow-auto'>
        <PanelSection title='Contact Info'>
          <DetailRow label='Phone' value={lead.phone} />
          <DetailRow label='Email' value={lead.email} />
          <DetailRow
            label='Preferred contact'
            value={lead.preferredContactMethod}
          />
          <DetailRow label='Source' value={lead.source} />
          <DetailRow label='Assigned agent' value={lead.assignedAgent} />
          <DetailRow label='Area' value={lead.area} />
          <DetailRow label='Last contact' value={lead.lastContact} />
          <DetailRow label='Next follow-up' value={lead.nextFollowUp} />
        </PanelSection>

        {lead.type === 'buyer' ? (
          <>
            <PanelSection title='Buyer Criteria'>
              <DetailRow label='Budget range' value={formatBudgetRange(lead)} />
              <DetailRow
                label='Preferred areas'
                value={lead.preferredAreas.join(', ')}
              />
              <DetailRow label='Bedrooms' value={lead.bedrooms} />
              <DetailRow label='Bathrooms' value={lead.bathrooms} />
              <DetailRow label='Property type' value={lead.propertyType} />
              <DetailRow
                label='Square footage'
                value={lead.squareFootageRange}
              />
              <DetailRow label='Must-haves' value={lead.mustHaves} />
              <DetailRow label='Nice-to-haves' value={lead.niceToHaves} />
              <DetailRow label='Deal breakers' value={lead.dealBreakers} />
            </PanelSection>
            <PanelSection title='Buying Situation'>
              <DetailRow label='Timeline' value={lead.timeline} />
              <DetailRow label='First-time buyer' value={lead.firstTimeBuyer} />
              <DetailRow label='Preapproved' value={lead.preapproved} />
              <DetailRow
                label='Preapproval amount'
                value={lead.preapprovalAmount}
              />
              <DetailRow label='Lender' value={lead.lender} />
              <DetailRow
                label='Housing situation'
                value={lead.currentHousingSituation}
              />
              <DetailRow label='Motivation' value={lead.motivation} />
            </PanelSection>
            <CollapsiblePanelSection title='Documents' items={lead.documents} />
            <CollapsiblePanelSection title='Activity' items={lead.activity} />
          </>
        ) : (
          <>
            <PanelSection title='Seller Situation'>
              <DetailRow
                label='Sale timeline'
                value={lead.targetSaleTimeline}
              />
              <DetailRow label='Reason' value={lead.reasonForSelling} />
              <DetailRow
                label='Expected price'
                value={lead.expectedListingPrice}
              />
              <DetailRow
                label='Agent estimate'
                value={lead.agentEstimatedValue}
              />
              <DetailRow label='Occupancy' value={lead.occupancyStatus} />
              <DetailRow label='Has mortgage' value={lead.hasMortgage} />
              <DetailRow
                label='Buy after selling'
                value={lead.needsToBuyAfterSelling}
              />
              <DetailRow
                label='Listing appointment'
                value={lead.listingAppointmentDate}
              />
              <DetailRow label='Urgency' value={lead.sellerUrgency} />
            </PanelSection>
            <HouseProfileBlock lead={lead} onEdit={onEditHouseProfile} />
            <CollapsiblePanelSection
              title='Seller Documents'
              items={lead.documents}
            />
            <CollapsiblePanelSection
              title='Seller Activity'
              items={lead.activity}
            />
          </>
        )}

        <section className='px-4 py-3'>
          <h3 className='mb-2 text-xs font-semibold tracking-wide uppercase'>
            Notes
          </h3>
          <Textarea
            value={lead.notes}
            onChange={(event) => onNoteChange(lead.id, event.target.value)}
            placeholder='Add a note...'
            className='min-h-28 rounded-none text-xs shadow-none'
          />
        </section>
      </div>
    </aside>
  );
}

function AddLeadDialog({
  open,
  onOpenChange,
  onSubmit
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (lead: CrmLead) => void;
}) {
  const [type, setType] = useState<LeadType>('buyer');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const lead =
      type === 'buyer'
        ? toBuyerLead(formData, -Date.now())
        : toSellerLead(formData, -Date.now());
    onSubmit(lead);
    onOpenChange(false);
    event.currentTarget.reset();
    setType('buyer');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[88vh] gap-0 overflow-hidden rounded-none p-0 sm:max-w-4xl'>
        <DialogHeader className='border-b px-4 py-3'>
          <DialogTitle className='text-base'>Add Lead</DialogTitle>
          <DialogDescription className='text-xs'>
            Create a buyer or seller lead in this local workspace.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className='flex min-h-0 flex-1 flex-col overflow-hidden'
        >
          <div className='grid min-h-0 flex-1 gap-3 overflow-y-auto p-4 md:grid-cols-2'>
            <label className='grid gap-1 text-xs font-medium'>
              Lead type
              <select
                name='type'
                value={type}
                onChange={(event) => setType(event.target.value as LeadType)}
                className='border-input bg-background h-8 rounded-none border px-2 text-xs'
              >
                <option value='buyer'>Buyer</option>
                <option value='seller'>Seller</option>
              </select>
            </label>
            <Field label='Full name' name='name' />
            <Field label='Phone' name='phone' />
            <Field label='Email' name='email' />
            <SelectField
              label='Status'
              name='status'
              defaultValue='Prospect'
              options={statusOptions}
            />
            <Field label='Source' name='source' />
            <Field
              label='Preferred contact method'
              name='preferredContactMethod'
            />
            <Field label='Assigned agent' name='assignedAgent' />
            <Field label='Area/location' name='area' />
            <Field label='Last contact' name='lastContact' />
            <Field label='Next follow-up' name='nextFollowUp' />

            {type === 'buyer' ? (
              <>
                <Field label='Budget min' name='budgetMin' />
                <Field label='Budget max' name='budgetMax' />
                <Field label='Preferred areas' name='preferredAreas' />
                <Field label='Bedrooms' name='bedrooms' />
                <Field label='Bathrooms' name='bathrooms' />
                <Field label='Property type' name='propertyType' />
                <Field label='Square footage range' name='squareFootageRange' />
                <Field label='Timeline' name='timeline' />
                <Field label='First-time buyer' name='firstTimeBuyer' />
                <Field label='Preapproved' name='preapproved' />
                <Field label='Preapproval amount' name='preapprovalAmount' />
                <Field label='Lender' name='lender' />
                <Field
                  label='Current housing situation'
                  name='currentHousingSituation'
                />
                <Field label='Motivation' name='motivation' />
                <TextareaField label='Must-haves' name='mustHaves' />
                <TextareaField label='Nice-to-haves' name='niceToHaves' />
                <TextareaField label='Deal breakers' name='dealBreakers' />
              </>
            ) : (
              <>
                <Field label='Target sale timeline' name='targetSaleTimeline' />
                <Field
                  label='Reason/motivation for selling'
                  name='reasonForSelling'
                />
                <Field
                  label='Expected listing price'
                  name='expectedListingPrice'
                />
                <Field
                  label='Agent estimated value'
                  name='agentEstimatedValue'
                />
                <Field label='Occupancy status' name='occupancyStatus' />
                <Field label='Has mortgage' name='hasMortgage' />
                <Field
                  label='Needs to buy after selling'
                  name='needsToBuyAfterSelling'
                />
                <Field
                  label='Listing appointment date'
                  name='listingAppointmentDate'
                />
                <Field label='Seller urgency' name='sellerUrgency' />
              </>
            )}
            <TextareaField label='Notes' name='notes' />
          </div>
          <DialogFooter className='bg-background shrink-0 border-t p-4'>
            <Button
              variant='outline'
              type='button'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit'>Confirm Add Lead</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ImportLeadsDialog({
  open,
  onOpenChange,
  onImport
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (leads: CrmLead[]) => void;
}) {
  const [csvText, setCsvText] = useState('');
  const parsedRows = useMemo(() => parseCsv(csvText), [csvText]);

  function handleFile(file?: File) {
    if (!file) return;
    void file.text().then(setCsvText);
  }

  function handleImport() {
    const leads = parsedRows.map((row, index) =>
      csvRowToLead(row, -Date.now() - index)
    );
    onImport(leads);
    setCsvText('');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[88vh] overflow-hidden rounded-none p-0 sm:max-w-3xl'>
        <DialogHeader className='border-b px-4 py-3'>
          <DialogTitle className='text-base'>Import Leads</DialogTitle>
          <DialogDescription className='text-xs'>
            Upload or paste CSV columns: type, fullName, phone, email, status,
            source, area, budgetMin, budgetMax, listingValue, bedrooms,
            bathrooms, timeline, notes.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-3 p-4'>
          <Input
            type='file'
            accept='.csv,text/csv'
            className='rounded-none text-xs shadow-none'
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <Textarea
            value={csvText}
            onChange={(event) => setCsvText(event.target.value)}
            placeholder='type,fullName,phone,email,status,source,area,budgetMin,budgetMax,listingValue,bedrooms,bathrooms,timeline,notes'
            className='min-h-36 rounded-none font-mono text-xs shadow-none'
          />
          <div className='max-h-56 overflow-auto border'>
            <table className='w-full text-left text-xs'>
              <thead className='bg-muted sticky top-0'>
                <tr>
                  <th className='border-b px-2 py-1'>Type</th>
                  <th className='border-b px-2 py-1'>Name</th>
                  <th className='border-b px-2 py-1'>Area</th>
                  <th className='border-b px-2 py-1'>Status</th>
                  <th className='border-b px-2 py-1'>Value</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.map((row, index) => (
                  <tr key={`${row.fullName}-${index}`}>
                    <td className='border-b px-2 py-1'>{row.type}</td>
                    <td className='border-b px-2 py-1'>{row.fullName}</td>
                    <td className='border-b px-2 py-1'>{row.area}</td>
                    <td className='border-b px-2 py-1'>{row.status}</td>
                    <td className='border-b px-2 py-1'>
                      {row.type === 'seller'
                        ? row.listingValue
                        : `${row.budgetMin}-${row.budgetMax}`}
                    </td>
                  </tr>
                ))}
                {parsedRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className='text-muted-foreground px-2 py-6 text-center'
                    >
                      No CSV rows ready to preview.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <DialogFooter className='border-t p-4'>
          <Button
            variant='outline'
            type='button'
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type='button'
            disabled={parsedRows.length === 0}
            onClick={handleImport}
          >
            Import {parsedRows.length || ''} leads
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HouseProfileDialog({
  lead,
  open,
  onOpenChange,
  onSave
}: {
  lead: SellerLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (leadId: string, profile: HouseProfile) => void;
}) {
  const profile = lead?.houseProfile ?? emptyHouseProfile;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lead) return;

    const formData = new FormData(event.currentTarget);
    const nextProfile = Object.keys(emptyHouseProfile).reduce<HouseProfile>(
      (record, key) => {
        const profileKey = key as keyof HouseProfile;
        record[profileKey] = fieldValue(formData, profileKey);
        return record;
      },
      { ...emptyHouseProfile }
    );

    onSave(lead.id, nextProfile);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[88vh] overflow-hidden rounded-none p-0 sm:max-w-4xl'>
        <DialogHeader className='border-b px-4 py-3'>
          <DialogTitle className='text-base'>
            {lead?.houseProfile ? 'Edit' : 'Add'} House Profile
          </DialogTitle>
          <DialogDescription className='text-xs'>
            Seller intake details attached only to this lead.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='min-h-0 overflow-auto'>
          <div className='grid gap-3 p-4 md:grid-cols-2'>
            <Field
              label='Property address'
              name='address'
              defaultValue={profile.address}
            />
            <Field label='City' name='city' defaultValue={profile.city} />
            <Field label='State' name='state' defaultValue={profile.state} />
            <Field label='ZIP' name='zip' defaultValue={profile.zip} />
            <Field
              label='Property type'
              name='propertyType'
              defaultValue={profile.propertyType}
            />
            <Field
              label='Estimated/listing price'
              name='estimatedListingPrice'
              defaultValue={profile.estimatedListingPrice}
            />
            <Field
              label='Bedrooms'
              name='bedrooms'
              defaultValue={profile.bedrooms}
            />
            <Field
              label='Bathrooms'
              name='bathrooms'
              defaultValue={profile.bathrooms}
            />
            <Field
              label='Square footage'
              name='squareFeet'
              defaultValue={profile.squareFeet}
            />
            <Field
              label='Lot size'
              name='lotSize'
              defaultValue={profile.lotSize}
            />
            <Field
              label='Year built'
              name='yearBuilt'
              defaultValue={profile.yearBuilt}
            />
            <Field
              label='Garage/parking'
              name='parking'
              defaultValue={profile.parking}
            />
            <Field
              label='Basement'
              name='basement'
              defaultValue={profile.basement}
            />
            <Field
              label='Heating'
              name='heating'
              defaultValue={profile.heating}
            />
            <Field
              label='Cooling'
              name='cooling'
              defaultValue={profile.cooling}
            />
            <Field label='HOA' name='hoa' defaultValue={profile.hoa} />
            <Field
              label='Property condition'
              name='condition'
              defaultValue={profile.condition}
            />
            <Field
              label='Occupancy status'
              name='occupancyStatus'
              defaultValue={profile.occupancyStatus}
            />
            <TextareaField
              label='Showing instructions'
              name='showingInstructions'
              defaultValue={profile.showingInstructions}
            />
            <TextareaField
              label='Key features'
              name='keyFeatures'
              defaultValue={profile.keyFeatures}
            />
            <TextareaField
              label='Upgrades/renovations'
              name='upgrades'
              defaultValue={profile.upgrades}
            />
            <TextareaField
              label='Seller description'
              name='sellerDescription'
              defaultValue={profile.sellerDescription}
            />
            <TextareaField
              label='Agent notes'
              name='agentNotes'
              defaultValue={profile.agentNotes}
            />
          </div>
          <DialogFooter className='border-t p-4'>
            <Button
              variant='outline'
              type='button'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit'>Save House Profile</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LeadsWorkspace() {
  const [buyerLeads, setBuyerLeads] = useState<BuyerLead[]>(initialBuyerLeads);
  const [sellerLeads, setSellerLeads] =
    useState<SellerLead[]>(initialSellerLeads);
  const [buyerSort, setBuyerSort] = useState<SortKey>('recent');
  const [sellerSort, setSellerSort] = useState<SortKey>('recent');
  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    initialBuyerLeads[0]?.id ?? ''
  );
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<CrmLead | null>(null);
  const [houseProfileLead, setHouseProfileLead] = useState<SellerLead | null>(
    null
  );

  const allLeads = useMemo(
    () => [...buyerLeads, ...sellerLeads],
    [buyerLeads, sellerLeads]
  );
  const selectedLead =
    allLeads.find((lead) => lead.id === selectedLeadId) ?? null;
  const filteredBuyers = useMemo(
    () => filterAndSortLeads(buyerLeads, buyerSort),
    [buyerLeads, buyerSort]
  );
  const filteredSellers = useMemo(
    () => filterAndSortLeads(sellerLeads, sellerSort),
    [sellerLeads, sellerSort]
  );

  function selectLead(lead: CrmLead) {
    setSelectedLeadId(lead.id);
  }

  function addLead(lead: CrmLead) {
    if (lead.type === 'buyer') {
      setBuyerLeads((current) => [lead, ...current]);
    } else {
      setSellerLeads((current) => [lead, ...current]);
    }
    publishLocalSearchLeads([lead]);
    setSelectedLeadId(lead.id);
  }

  function importLeads(leads: CrmLead[]) {
    const buyers = leads.filter(
      (lead): lead is BuyerLead => lead.type === 'buyer'
    );
    const sellers = leads.filter(
      (lead): lead is SellerLead => lead.type === 'seller'
    );
    setBuyerLeads((current) => [...buyers, ...current]);
    setSellerLeads((current) => [...sellers, ...current]);
    publishLocalSearchLeads(leads);
    if (leads[0]) setSelectedLeadId(leads[0].id);
  }

  function updateNote(leadId: string, value: string) {
    setBuyerLeads((current) =>
      current.map((lead) =>
        lead.id === leadId ? { ...lead, notes: value } : lead
      )
    );
    setSellerLeads((current) =>
      current.map((lead) =>
        lead.id === leadId ? { ...lead, notes: value } : lead
      )
    );
  }

  function saveLead(lead: CrmLead) {
    if (lead.type === 'buyer') {
      setBuyerLeads((current) =>
        current.map((item) => (item.id === lead.id ? lead : item))
      );
    } else {
      setSellerLeads((current) =>
        current.map((item) => (item.id === lead.id ? lead : item))
      );
    }
    publishLocalSearchLeads([lead]);
    setSelectedLeadId(lead.id);
  }

  function saveHouseProfile(leadId: string, profile: HouseProfile) {
    setSellerLeads((current) =>
      current.map((lead) =>
        lead.id === leadId ? { ...lead, houseProfile: profile } : lead
      )
    );
    setSelectedLeadId(leadId);
  }

  return (
    <>
      <div className='mb-3 flex justify-end border-b pb-3'>
        <div className='flex shrink-0 items-center gap-2'>
          <Button variant='outline' size='sm' type='button'>
            <Icons.adjustments />
            Filter
          </Button>
          <Button
            variant='outline'
            size='sm'
            type='button'
            onClick={() => setImportOpen(true)}
          >
            <Icons.upload />
            Import Leads
          </Button>
          <Button size='sm' type='button' onClick={() => setAddOpen(true)}>
            <Icons.add />
            Add Lead
          </Button>
        </div>
      </div>

      <div className='flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row'>
        <div className='grid min-w-0 flex-1 gap-3 md:grid-cols-2 lg:gap-0'>
          <LeadColumn
            title='Buyers'
            leads={filteredBuyers}
            sort={buyerSort}
            selectedLeadId={selectedLead?.id}
            onSortChange={setBuyerSort}
            onSelectLead={selectLead}
          />
          <LeadColumn
            title='Sellers'
            leads={filteredSellers}
            sort={sellerSort}
            selectedLeadId={selectedLead?.id}
            onSortChange={setSellerSort}
            onSelectLead={selectLead}
          />
        </div>
        {selectedLead && (
          <LeadProfilePanel
            lead={selectedLead}
            onNoteChange={updateNote}
            onEditLead={(lead) => setLeadToEdit(lead)}
            onEditHouseProfile={(lead) => setHouseProfileLead(lead)}
            onClose={() => setSelectedLeadId('')}
          />
        )}
      </div>

      <AddLeadDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={addLead}
      />
      <ImportLeadsDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={importLeads}
      />
      <LeadEditDialog
        lead={leadToEdit}
        open={leadToEdit !== null}
        onOpenChange={(open) => {
          if (!open) setLeadToEdit(null);
        }}
        onSave={saveLead}
      />
      <HouseProfileDialog
        lead={houseProfileLead}
        open={houseProfileLead !== null}
        onOpenChange={(open) => {
          if (!open) setHouseProfileLead(null);
        }}
        onSave={saveHouseProfile}
      />
    </>
  );
}

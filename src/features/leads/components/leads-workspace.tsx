'use client';

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { LeadNameHoverCard, type LeadHoverProfile } from './lead-name-hover-card';
import { cn } from '@/lib/utils';
import { humanizeKey, humanizeList } from '@/lib/vocabulary/display';

type LeadType = 'buyer' | 'seller';
type SortKey = 'recent' | 'budget' | 'name';
type LeadStatus = 'Hot' | 'Prospect' | 'Stale' | 'Active' | 'Inactive';
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

interface BrokerApiBuyerProfile {
  budget_max: number | null;
  bedrooms_min: number | string | null;
  bathrooms_min: number | string | null;
  property_type: string | null;
  location_primary: string | null;
  must_haves: string[] | null;
  nice_to_haves: string[] | null;
  dealbreakers: string[] | null;
}

interface BrokerApiLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: string;
  temperature: string;
  budget: string;
  desiredArea: string;
  intent: string;
  lastContact: string;
  assignedAgent: string;
  notes: string[];
  preferences: string[];
  leadType: LeadType;
  createdAt: string | null;
  buyerProfile: BrokerApiBuyerProfile | null;
  raw: {
    status: string | null;
    notes_md: string | null;
  };
}

interface BrokerApiHouseProfile {
  id: string;
  sellerLeadId: string;
  address: string;
  neighborhood: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  status: string;
  features: string[];
  raw: {
    address: string | null;
    town: string | null;
    beds: number | string | null;
    baths: number | string | null;
    sqft: number | null;
    property_type: string | null;
    features: string[] | null;
    list_price: number | null;
    status: string | null;
  };
}

interface BrokerLeadsResponse {
  leads: BrokerApiLead[];
  houseProfiles: BrokerApiHouseProfile[];
}

interface BrokerLeadResponse {
  lead: BrokerApiLead;
}

interface WorkspaceNotesEnvelope {
  kind: 'brokeros.lead.workspace.v1';
  notes: string;
  preferredContactMethod?: string;
  source?: string;
  assignedAgent?: string;
  area?: string;
  lastContact?: string;
  nextFollowUp?: string;
  documents?: string[];
  activity?: string[];
  buyer?: Partial<
    Pick<
      BuyerLead,
      | 'budgetMin'
      | 'squareFootageRange'
      | 'timeline'
      | 'firstTimeBuyer'
      | 'preapproved'
      | 'preapprovalAmount'
      | 'lender'
      | 'currentHousingSituation'
      | 'motivation'
    >
  >;
  seller?: Partial<
    Pick<
      SellerLead,
      | 'targetSaleTimeline'
      | 'reasonForSelling'
      | 'expectedListingPrice'
      | 'agentEstimatedValue'
      | 'occupancyStatus'
      | 'hasMortgage'
      | 'needsToBuyAfterSelling'
      | 'listingAppointmentDate'
      | 'sellerUrgency'
    >
  >;
}

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

const sortTabs: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'budget', label: 'Budget' },
  { key: 'name', label: 'Name' }
];

const statusOptions: LeadStatus[] = ['Hot', 'Prospect', 'Stale', 'Active', 'Inactive'];

function normalizeLeadStatus(value: string): LeadStatus {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'hot') return 'Hot';
  if (normalized === 'stale') return 'Stale';
  if (normalized === 'active') return 'Active';
  if (normalized === 'inactive') return 'Inactive';
  if (normalized === 'new') return 'Prospect';
  if (normalized === 'under contract') return 'Active';
  return 'Prospect';
}

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
  return lead.type === 'buyer' ? formatBudgetRange(lead) : lead.expectedListingPrice;
}

function leadValueNumber(lead: CrmLead) {
  return lead.type === 'buyer'
    ? parseCurrency(lead.budgetMax)
    : parseCurrency(lead.expectedListingPrice);
}

function crmLeadHoverProfile(lead: CrmLead): LeadHoverProfile {
  const baseDetails = [
    { label: 'Type', value: lead.type },
    { label: 'Status', value: lead.status },
    { label: 'Area', value: lead.area },
    { label: 'Agent', value: lead.assignedAgent },
    { label: 'Source', value: lead.source },
    { label: 'Contact', value: lead.preferredContactMethod },
    { label: 'Phone', value: lead.phone },
    { label: 'Email', value: lead.email },
    { label: 'Follow-up', value: lead.nextFollowUp }
  ];

  if (lead.type === 'buyer') {
    return {
      name: lead.name,
      eyebrow: 'Buyer Lead',
      status: lead.status,
      summary: `${formatBudgetRange(lead)} in ${lead.preferredAreas.join(', ')}`,
      details: [
        ...baseDetails,
        { label: 'Beds', value: lead.bedrooms },
        { label: 'Baths', value: lead.bathrooms },
        { label: 'Property', value: formatDisplayKey(lead.propertyType) },
        { label: 'Timeline', value: lead.timeline },
        { label: 'Preapproved', value: lead.preapproved }
      ],
      notes: [
        formatDisplayList(lead.mustHaves),
        formatDisplayList(lead.niceToHaves),
        formatDisplayList(lead.dealBreakers),
        lead.motivation,
        lead.notes
      ].filter((item) => Boolean(item && item !== '—'))
    };
  }

  return {
    name: lead.name,
    eyebrow: 'Seller Lead',
    status: lead.status,
    summary: `${lead.expectedListingPrice || lead.agentEstimatedValue} target in ${lead.area}`,
    details: [
      ...baseDetails,
      { label: 'Timeline', value: lead.targetSaleTimeline },
      { label: 'Reason', value: lead.reasonForSelling },
      { label: 'Estimate', value: lead.agentEstimatedValue },
      { label: 'Occupancy', value: lead.occupancyStatus },
      { label: 'Urgency', value: lead.sellerUrgency }
    ],
    notes: [lead.needsToBuyAfterSelling, lead.listingAppointmentDate, lead.notes].filter(Boolean)
  };
}

function statusClass(status: string) {
  if (status === 'Active') return 'border-green-500 bg-green-500 text-white';
  if (status === 'Hot') return 'border-red-500 bg-red-500 text-white';
  if (status === 'Prospect') return 'border-orange-500 bg-orange-500 text-white';
  if (status === 'Stale') return 'border-yellow-400 bg-yellow-400 text-black';
  if (status === 'Inactive') return 'border-muted-foreground/45 bg-muted text-muted-foreground';
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

function parseWorkspaceEnvelope(value: string | null | undefined): WorkspaceNotesEnvelope | null {
  if (!value?.trim()) return null;
  try {
    const parsed = JSON.parse(value) as WorkspaceNotesEnvelope;
    return parsed.kind === 'brokeros.lead.workspace.v1' ? parsed : null;
  } catch {
    return null;
  }
}

function cleanDash(value: string | null | undefined) {
  if (!value || value === '—') return '';
  return value;
}

function formatDisplayKey(value: string | null | undefined) {
  const cleaned = cleanDash(value);
  return cleaned ? humanizeKey(cleaned) || '—' : '—';
}

function formatDisplayList(value: string | null | undefined) {
  const cleaned = cleanDash(value);
  if (!cleaned) return '—';

  const displayValue = humanizeList(splitList(cleaned)).join(', ');
  return displayValue || '—';
}

function numberOrNull(value: string) {
  const parsed = parseCurrency(value);
  return parsed > 0 ? Math.round(parsed) : null;
}

function decimalOrNull(value: string) {
  const match = value.match(/\d+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function statusToDb(value: LeadStatus) {
  if (value === 'Prospect') return 'new';
  return value.toLowerCase();
}

function temperatureToDb(value: LeadStatus) {
  if (value === 'Hot') return 'hot';
  if (value === 'Stale' || value === 'Inactive') return 'cold';
  return 'warm';
}

function workspaceEnvelopeForLead(lead: CrmLead): WorkspaceNotesEnvelope {
  const base = {
    kind: 'brokeros.lead.workspace.v1' as const,
    notes: lead.notes,
    preferredContactMethod: lead.preferredContactMethod,
    source: lead.source,
    assignedAgent: lead.assignedAgent,
    area: lead.area,
    lastContact: lead.lastContact,
    nextFollowUp: lead.nextFollowUp,
    documents: lead.documents,
    activity: lead.activity
  };

  if (lead.type === 'buyer') {
    return {
      ...base,
      buyer: {
        budgetMin: lead.budgetMin,
        squareFootageRange: lead.squareFootageRange,
        timeline: lead.timeline,
        firstTimeBuyer: lead.firstTimeBuyer,
        preapproved: lead.preapproved,
        preapprovalAmount: lead.preapprovalAmount,
        lender: lead.lender,
        currentHousingSituation: lead.currentHousingSituation,
        motivation: lead.motivation
      }
    };
  }

  return {
    ...base,
    seller: {
      targetSaleTimeline: lead.targetSaleTimeline,
      reasonForSelling: lead.reasonForSelling,
      expectedListingPrice: lead.expectedListingPrice,
      agentEstimatedValue: lead.agentEstimatedValue,
      occupancyStatus: lead.occupancyStatus,
      hasMortgage: lead.hasMortgage,
      needsToBuyAfterSelling: lead.needsToBuyAfterSelling,
      listingAppointmentDate: lead.listingAppointmentDate,
      sellerUrgency: lead.sellerUrgency
    }
  };
}

function leadPayload(lead: CrmLead) {
  return {
    lead: {
      name: cleanDash(lead.name) || 'Unnamed lead',
      email: cleanDash(lead.email) || null,
      phone: cleanDash(lead.phone) || null,
      lead_type: lead.type,
      status: statusToDb(lead.status),
      temperature: temperatureToDb(lead.status),
      notes_md: JSON.stringify(workspaceEnvelopeForLead(lead))
    },
    buyerProfile:
      lead.type === 'buyer'
        ? {
            budget_max: numberOrNull(lead.budgetMax),
            bedrooms_min: decimalOrNull(lead.bedrooms),
            bathrooms_min: decimalOrNull(lead.bathrooms),
            property_type: cleanDash(lead.propertyType) || null,
            location_primary: lead.preferredAreas[0] ?? cleanDash(lead.area) ?? null,
            must_haves: splitList(cleanDash(lead.mustHaves)),
            nice_to_haves: splitList(cleanDash(lead.niceToHaves)),
            dealbreakers: splitList(cleanDash(lead.dealBreakers)),
            must_have_keys: [],
            nice_to_have_keys: [],
            dealbreaker_keys: [],
            property_type_key: null
          }
        : null,
    houseProfile:
      lead.type === 'seller' && lead.houseProfile
        ? {
            address: cleanDash(lead.houseProfile.address) || null,
            town: cleanDash(lead.houseProfile.city) || cleanDash(lead.area) || null,
            beds: decimalOrNull(lead.houseProfile.bedrooms),
            baths: decimalOrNull(lead.houseProfile.bathrooms),
            sqft: numberOrNull(lead.houseProfile.squareFeet),
            property_type: cleanDash(lead.houseProfile.propertyType) || null,
            features: [
              ...splitList(cleanDash(lead.houseProfile.keyFeatures)),
              ...splitList(cleanDash(lead.houseProfile.upgrades))
            ],
            feature_keys: [],
            property_type_key: null,
            list_price: numberOrNull(lead.houseProfile.estimatedListingPrice),
            status: statusToDb(lead.status)
          }
        : null
  };
}

function formatMoneyFromNumber(value: number | null | undefined) {
  if (!value) return '—';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 ? 1 : 0)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value}`;
}

function brokerHouseProfileToUi(profile: BrokerApiHouseProfile): HouseProfile {
  return {
    ...emptyHouseProfile,
    address: profile.raw.address ?? profile.address,
    city: profile.raw.town ?? profile.neighborhood,
    propertyType: profile.raw.property_type ?? '—',
    estimatedListingPrice: formatMoneyFromNumber(profile.raw.list_price),
    bedrooms: profile.raw.beds != null ? `${profile.raw.beds}` : '—',
    bathrooms: profile.raw.baths != null ? `${profile.raw.baths}` : '—',
    squareFeet: profile.raw.sqft != null ? `${profile.raw.sqft}` : '—',
    keyFeatures: (profile.raw.features ?? profile.features).join(', ')
  };
}

function brokerApiLeadToCrmLead(
  lead: BrokerApiLead,
  rank: number,
  houseProfile?: BrokerApiHouseProfile
): CrmLead {
  const envelope = parseWorkspaceEnvelope(lead.raw.notes_md);
  const status = normalizeLeadStatus(lead.raw.status ?? lead.stage);
  const base = {
    id: lead.id,
    type: lead.leadType,
    name: lead.name,
    status,
    phone: lead.phone || '—',
    email: lead.email || '—',
    preferredContactMethod: envelope?.preferredContactMethod ?? '—',
    source: envelope?.source ?? 'Supabase',
    assignedAgent: envelope?.assignedAgent ?? lead.assignedAgent ?? 'Unassigned',
    area: envelope?.area ?? lead.buyerProfile?.location_primary ?? lead.desiredArea ?? '—',
    lastContact: envelope?.lastContact ?? lead.lastContact,
    nextFollowUp: envelope?.nextFollowUp ?? '—',
    documents: envelope?.documents ?? [],
    activity: envelope?.activity ?? [],
    notes: envelope?.notes ?? lead.notes.join('\n'),
    contactRank: rank
  };

  if (lead.leadType === 'buyer') {
    const profile = lead.buyerProfile;
    const buyer = envelope?.buyer;
    return {
      ...base,
      type: 'buyer',
      budgetMin: buyer?.budgetMin ?? '—',
      budgetMax: formatMoneyFromNumber(profile?.budget_max) || buyer?.budgetMin || '—',
      preferredAreas: profile?.location_primary ? [profile.location_primary] : splitList(base.area),
      bedrooms: profile?.bedrooms_min != null ? `${profile.bedrooms_min}+` : '—',
      bathrooms: profile?.bathrooms_min != null ? `${profile.bathrooms_min}+` : '—',
      propertyType: profile?.property_type ?? '—',
      squareFootageRange: buyer?.squareFootageRange ?? '—',
      mustHaves: (profile?.must_haves ?? []).join(', ') || '—',
      niceToHaves: (profile?.nice_to_haves ?? []).join(', ') || '—',
      dealBreakers: (profile?.dealbreakers ?? []).join(', ') || '—',
      timeline: buyer?.timeline ?? '—',
      firstTimeBuyer: buyer?.firstTimeBuyer ?? '—',
      preapproved: buyer?.preapproved ?? '—',
      preapprovalAmount: buyer?.preapprovalAmount ?? '—',
      lender: buyer?.lender ?? '—',
      currentHousingSituation: buyer?.currentHousingSituation ?? '—',
      motivation: buyer?.motivation ?? '—'
    };
  }

  const seller = envelope?.seller;
  return {
    ...base,
    type: 'seller',
    targetSaleTimeline: seller?.targetSaleTimeline ?? '—',
    reasonForSelling: seller?.reasonForSelling ?? '—',
    expectedListingPrice: seller?.expectedListingPrice ?? '—',
    agentEstimatedValue: seller?.agentEstimatedValue ?? '—',
    occupancyStatus: seller?.occupancyStatus ?? '—',
    hasMortgage: seller?.hasMortgage ?? '—',
    needsToBuyAfterSelling: seller?.needsToBuyAfterSelling ?? '—',
    listingAppointmentDate: seller?.listingAppointmentDate ?? '—',
    sellerUrgency: seller?.sellerUrgency ?? '—',
    houseProfile: houseProfile ? brokerHouseProfileToUi(houseProfile) : undefined
  };
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
    status: normalizeLeadStatus(fieldValue(formData, 'status')),
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
    status: normalizeLeadStatus(fieldValue(formData, 'status')),
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
    status: normalizeLeadStatus(fieldValue(formData, 'status') || lead.status),
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
  const status = normalizeLeadStatus(row.status || 'Prospect');
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

function StatusBadge({
  status,
  onStatusChange
}: {
  status: LeadStatus;
  onStatusChange?: (status: LeadStatus) => void;
}) {
  if (!onStatusChange) {
    return (
      <Badge
        variant='outline'
        className={cn('font-mono text-[0.62rem] uppercase', statusClass(status))}
      >
        {status}
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge
          asChild
          variant='outline'
          className={cn(
            'font-mono text-[0.62rem] uppercase hover:brightness-95 focus-visible:ring-ring/50',
            statusClass(status)
          )}
        >
          <button
            type='button'
            aria-label={`Change lead status from ${status}`}
            onClick={(event) => event.stopPropagation()}
          >
            {status}
            <Icons.chevronDown className='size-3' />
          </button>
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-36'>
        <DropdownMenuRadioGroup
          value={status}
          onValueChange={(value) => onStatusChange(normalizeLeadStatus(value))}
        >
          {statusOptions.map((option) => (
            <DropdownMenuRadioItem key={option} value={option} className='text-xs'>
              {option}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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

function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='border-b px-4 py-3'>
      <h3 className='mb-2 text-xs font-semibold tracking-wide uppercase'>{title}</h3>
      <dl>{children}</dl>
    </section>
  );
}

function CollapsiblePanelSection({ title, items }: { title: string; items: string[] }) {
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
  onStatusChange: (lead: T, status: LeadStatus) => void;
}

function LeadColumn<T extends CrmLead>({
  title,
  leads,
  sort,
  selectedLeadId,
  onSortChange,
  onSelectLead,
  onStatusChange
}: LeadColumnProps<T>) {
  return (
    <section className='bg-background min-w-0 border-y md:border-x md:first:border-r-0'>
      <div className='flex h-full min-h-[520px] flex-col'>
        <div className='flex items-center justify-between border-b px-3 py-2'>
          <h2 className='text-sm font-semibold'>{title}</h2>
          <span className='text-muted-foreground font-mono text-xs'>{leads.length}</span>
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
              <div
                key={lead.id}
                role='button'
                tabIndex={0}
                onClick={() => onSelectLead(lead)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  onSelectLead(lead);
                }}
                className={cn(
                  'grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-b px-3 py-2.5 text-left text-sm transition-colors',
                  'hover:bg-muted/50 focus-visible:ring-ring/35 focus-visible:ring-2 focus-visible:outline-none',
                  isSelected && 'bg-muted/70 shadow-[inset_3px_0_0_var(--primary)]'
                )}
              >
                <span className='min-w-0'>
                  <LeadNameHoverCard profile={crmLeadHoverProfile(lead)}>
                    <span className='block truncate font-medium underline-offset-4 hover:text-primary hover:underline'>
                      {lead.name}
                    </span>
                  </LeadNameHoverCard>
                  <span className='text-muted-foreground mt-0.5 block truncate text-xs'>
                    {lead.area}
                  </span>
                </span>
                <span className='font-mono text-xs whitespace-nowrap'>{leadValue(lead)}</span>
                <StatusBadge
                  status={lead.status}
                  onStatusChange={(status) => onStatusChange(lead, status)}
                />
              </div>
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
            <h3 className='text-xs font-semibold tracking-wide uppercase'>Home Profile</h3>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              Seller property details and showing notes.
            </p>
          </div>
          <Button variant='outline' size='sm' type='button' onClick={() => onEdit(lead)}>
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
            <DetailRow label='Property type' value={formatDisplayKey(profile.propertyType)} />
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
            <DetailRow label='Showing instructions' value={profile.showingInstructions} />
            <DetailRow label='Key features' value={formatDisplayList(profile.keyFeatures)} />
            <DetailRow label='Upgrades' value={profile.upgrades} />
            <DetailRow label='Seller description' value={profile.sellerDescription} />
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
      <DialogContent className='grid max-h-[88vh] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-lg p-0 sm:max-w-5xl'>
        <DialogHeader className='border-b px-4 py-3'>
          <DialogTitle className='text-base'>Edit Lead</DialogTitle>
          <DialogDescription className='text-xs'>
            Update contact details, profile fields, documents, activity, and notes.
          </DialogDescription>
        </DialogHeader>

        {lead && (
          <form onSubmit={handleSubmit} className='flex min-h-0 flex-col overflow-hidden'>
            <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain p-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <section className='rounded-lg border p-3 md:col-span-2'>
                  <h3 className='mb-3 text-xs font-semibold tracking-wide uppercase'>Basics</h3>
                  <div className='grid gap-3 md:grid-cols-2'>
                    <Field label='Full name' name='name' defaultValue={lead.name} />
                    <SelectField
                      label='Status'
                      name='status'
                      defaultValue={lead.status}
                      options={statusOptions}
                    />
                    <Field label='Phone' name='phone' defaultValue={lead.phone} />
                    <Field label='Email' name='email' defaultValue={lead.email} />
                    <Field
                      label='Preferred contact'
                      name='preferredContactMethod'
                      defaultValue={lead.preferredContactMethod}
                    />
                    <Field label='Source' name='source' defaultValue={lead.source} />
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
                        <Field label='Budget min' name='budgetMin' defaultValue={lead.budgetMin} />
                        <Field label='Budget max' name='budgetMax' defaultValue={lead.budgetMax} />
                        <Field
                          label='Preferred areas'
                          name='preferredAreas'
                          defaultValue={lead.preferredAreas.join(', ')}
                        />
                        <Field label='Bedrooms' name='bedrooms' defaultValue={lead.bedrooms} />
                        <Field label='Bathrooms' name='bathrooms' defaultValue={lead.bathrooms} />
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
                        <Field label='Timeline' name='timeline' defaultValue={lead.timeline} />
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
                        <Field label='Lender' name='lender' defaultValue={lead.lender} />
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
                    <TextareaField label='Notes' name='notes' defaultValue={lead.notes} />
                  </div>
                </section>
              </div>
            </div>

            <DialogFooter className='shrink-0 border-t bg-background p-4'>
              <Button variant='outline' type='button' onClick={() => onOpenChange(false)}>
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
  onEditHouseProfile,
  onStatusChange
}: {
  lead: CrmLead;
  onClose: () => void;
  onNoteChange: (leadId: string, value: string) => void;
  onEditLead: (lead: CrmLead) => void;
  onEditHouseProfile: (lead: SellerLead) => void;
  onStatusChange: (lead: CrmLead, status: LeadStatus) => void;
}) {
  return (
    <aside className='bg-background fixed inset-y-0 right-0 z-50 flex w-[min(100vw,410px)] flex-col border-l lg:static lg:z-auto lg:w-[380px] xl:w-[410px]'>
      <div className='border-b px-4 py-3'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <LeadNameHoverCard profile={crmLeadHoverProfile(lead)}>
                <h2 className='truncate text-base font-semibold underline-offset-4 hover:text-primary hover:underline'>
                  {lead.name}
                </h2>
              </LeadNameHoverCard>
              <StatusBadge
                status={lead.status}
                onStatusChange={(status) => onStatusChange(lead, status)}
              />
            </div>
            <p className='text-muted-foreground mt-1 text-xs uppercase'>{lead.type}</p>
          </div>
          <div className='flex shrink-0 items-center gap-1'>
            <Button variant='outline' size='sm' type='button' onClick={() => onEditLead(lead)}>
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
          <DetailRow label='Preferred contact' value={lead.preferredContactMethod} />
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
              <DetailRow label='Preferred areas' value={lead.preferredAreas.join(', ')} />
              <DetailRow label='Bedrooms' value={lead.bedrooms} />
              <DetailRow label='Bathrooms' value={lead.bathrooms} />
              <DetailRow label='Property type' value={formatDisplayKey(lead.propertyType)} />
              <DetailRow label='Square footage' value={lead.squareFootageRange} />
              <DetailRow label='Must-haves' value={formatDisplayList(lead.mustHaves)} />
              <DetailRow label='Nice-to-haves' value={formatDisplayList(lead.niceToHaves)} />
              <DetailRow label='Deal breakers' value={formatDisplayList(lead.dealBreakers)} />
            </PanelSection>
            <PanelSection title='Buying Situation'>
              <DetailRow label='Timeline' value={lead.timeline} />
              <DetailRow label='First-time buyer' value={lead.firstTimeBuyer} />
              <DetailRow label='Preapproved' value={lead.preapproved} />
              <DetailRow label='Preapproval amount' value={lead.preapprovalAmount} />
              <DetailRow label='Lender' value={lead.lender} />
              <DetailRow label='Housing situation' value={lead.currentHousingSituation} />
              <DetailRow label='Motivation' value={lead.motivation} />
            </PanelSection>
            <CollapsiblePanelSection title='Documents' items={lead.documents} />
            <CollapsiblePanelSection title='Activity' items={lead.activity} />
          </>
        ) : (
          <>
            <PanelSection title='Seller Situation'>
              <DetailRow label='Sale timeline' value={lead.targetSaleTimeline} />
              <DetailRow label='Reason' value={lead.reasonForSelling} />
              <DetailRow label='Expected price' value={lead.expectedListingPrice} />
              <DetailRow label='Agent estimate' value={lead.agentEstimatedValue} />
              <DetailRow label='Occupancy' value={lead.occupancyStatus} />
              <DetailRow label='Has mortgage' value={lead.hasMortgage} />
              <DetailRow label='Buy after selling' value={lead.needsToBuyAfterSelling} />
              <DetailRow label='Listing appointment' value={lead.listingAppointmentDate} />
              <DetailRow label='Urgency' value={lead.sellerUrgency} />
            </PanelSection>
            <HouseProfileBlock lead={lead} onEdit={onEditHouseProfile} />
            <CollapsiblePanelSection title='Seller Documents' items={lead.documents} />
            <CollapsiblePanelSection title='Seller Activity' items={lead.activity} />
          </>
        )}

        <section className='px-4 py-3'>
          <h3 className='mb-2 text-xs font-semibold tracking-wide uppercase'>Notes</h3>
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
      type === 'buyer' ? toBuyerLead(formData, -Date.now()) : toSellerLead(formData, -Date.now());
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
            Create a buyer or seller lead in BrokerOS.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col overflow-hidden'>
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
            <Field label='Preferred contact method' name='preferredContactMethod' />
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
                <Field label='Current housing situation' name='currentHousingSituation' />
                <Field label='Motivation' name='motivation' />
                <TextareaField label='Must-haves' name='mustHaves' />
                <TextareaField label='Nice-to-haves' name='niceToHaves' />
                <TextareaField label='Deal breakers' name='dealBreakers' />
              </>
            ) : (
              <>
                <Field label='Target sale timeline' name='targetSaleTimeline' />
                <Field label='Reason/motivation for selling' name='reasonForSelling' />
                <Field label='Expected listing price' name='expectedListingPrice' />
                <Field label='Agent estimated value' name='agentEstimatedValue' />
                <Field label='Occupancy status' name='occupancyStatus' />
                <Field label='Has mortgage' name='hasMortgage' />
                <Field label='Needs to buy after selling' name='needsToBuyAfterSelling' />
                <Field label='Listing appointment date' name='listingAppointmentDate' />
                <Field label='Seller urgency' name='sellerUrgency' />
              </>
            )}
            <TextareaField label='Notes' name='notes' />
          </div>
          <DialogFooter className='bg-background shrink-0 border-t p-4'>
            <Button variant='outline' type='button' onClick={() => onOpenChange(false)}>
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
    const leads = parsedRows.map((row, index) => csvRowToLead(row, -Date.now() - index));
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
            Upload or paste CSV columns: type, fullName, phone, email, status, source, area,
            budgetMin, budgetMax, listingValue, bedrooms, bathrooms, timeline, notes.
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
                    <td colSpan={5} className='text-muted-foreground px-2 py-6 text-center'>
                      No CSV rows ready to preview.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <DialogFooter className='border-t p-4'>
          <Button variant='outline' type='button' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='button' disabled={parsedRows.length === 0} onClick={handleImport}>
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
            <Field label='Property address' name='address' defaultValue={profile.address} />
            <Field label='City' name='city' defaultValue={profile.city} />
            <Field label='State' name='state' defaultValue={profile.state} />
            <Field label='ZIP' name='zip' defaultValue={profile.zip} />
            <Field label='Property type' name='propertyType' defaultValue={profile.propertyType} />
            <Field
              label='Estimated/listing price'
              name='estimatedListingPrice'
              defaultValue={profile.estimatedListingPrice}
            />
            <Field label='Bedrooms' name='bedrooms' defaultValue={profile.bedrooms} />
            <Field label='Bathrooms' name='bathrooms' defaultValue={profile.bathrooms} />
            <Field label='Square footage' name='squareFeet' defaultValue={profile.squareFeet} />
            <Field label='Lot size' name='lotSize' defaultValue={profile.lotSize} />
            <Field label='Year built' name='yearBuilt' defaultValue={profile.yearBuilt} />
            <Field label='Garage/parking' name='parking' defaultValue={profile.parking} />
            <Field label='Basement' name='basement' defaultValue={profile.basement} />
            <Field label='Heating' name='heating' defaultValue={profile.heating} />
            <Field label='Cooling' name='cooling' defaultValue={profile.cooling} />
            <Field label='HOA' name='hoa' defaultValue={profile.hoa} />
            <Field label='Property condition' name='condition' defaultValue={profile.condition} />
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
            <Button variant='outline' type='button' onClick={() => onOpenChange(false)}>
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
  const [buyerLeads, setBuyerLeads] = useState<BuyerLead[]>([]);
  const [sellerLeads, setSellerLeads] = useState<SellerLead[]>([]);
  const [buyerSort, setBuyerSort] = useState<SortKey>('recent');
  const [sellerSort, setSellerSort] = useState<SortKey>('recent');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<CrmLead | null>(null);
  const [houseProfileLead, setHouseProfileLead] = useState<SellerLead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const allLeads = useMemo(() => [...buyerLeads, ...sellerLeads], [buyerLeads, sellerLeads]);
  const selectedLead = allLeads.find((lead) => lead.id === selectedLeadId) ?? null;
  const filteredBuyers = useMemo(
    () => filterAndSortLeads(buyerLeads, buyerSort),
    [buyerLeads, buyerSort]
  );
  const filteredSellers = useMemo(
    () => filterAndSortLeads(sellerLeads, sellerSort),
    [sellerLeads, sellerSort]
  );

  async function loadLeads(preferredSelectedId?: string) {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch('/api/brokeros/leads');
      if (!response.ok) throw new Error('Unable to load leads');
      const data = (await response.json()) as BrokerLeadsResponse;
      const houseBySellerLeadId = new Map(
        data.houseProfiles.map((profile) => [profile.sellerLeadId, profile])
      );
      const crmLeads = data.leads.map((lead, index) =>
        brokerApiLeadToCrmLead(lead, index, houseBySellerLeadId.get(lead.id))
      );
      const buyers = crmLeads.filter((lead): lead is BuyerLead => lead.type === 'buyer');
      const sellers = crmLeads.filter((lead): lead is SellerLead => lead.type === 'seller');

      setBuyerLeads(buyers);
      setSellerLeads(sellers);
      publishLocalSearchLeads(crmLeads);
      setSelectedLeadId((current) => {
        if (preferredSelectedId && crmLeads.some((lead) => lead.id === preferredSelectedId)) {
          return preferredSelectedId;
        }
        if (current && crmLeads.some((lead) => lead.id === current)) return current;
        return crmLeads[0]?.id ?? '';
      });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load leads');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadLeads();
  }, []);

  function selectLead(lead: CrmLead) {
    setSelectedLeadId(lead.id);
  }

  async function postLead(lead: CrmLead) {
    setIsSaving(true);
    try {
      const response = await fetch('/api/brokeros/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload(lead))
      });
      if (!response.ok) throw new Error('Unable to create lead');
      const data = (await response.json()) as BrokerLeadResponse;
      await loadLeads(data.lead.id);
    } finally {
      setIsSaving(false);
    }
  }

  async function patchLead(lead: CrmLead) {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/brokeros/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload(lead))
      });
      if (!response.ok) throw new Error('Unable to update lead');
      const data = (await response.json()) as BrokerLeadResponse;
      await loadLeads(data.lead.id);
    } finally {
      setIsSaving(false);
    }
  }

  function addLead(lead: CrmLead) {
    void postLead(lead).catch((error) => {
      setLoadError(error instanceof Error ? error.message : 'Unable to create lead');
    });
  }

  function importLeads(leads: CrmLead[]) {
    void Promise.all(leads.map((lead) => postLead(lead)))
      .then(() => loadLeads())
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : 'Unable to import leads');
      });
  }

  function updateNote(leadId: string, value: string) {
    const leadToSave = allLeads.find((lead) => lead.id === leadId);
    setBuyerLeads((current) =>
      current.map((lead) => (lead.id === leadId ? { ...lead, notes: value } : lead))
    );
    setSellerLeads((current) =>
      current.map((lead) => (lead.id === leadId ? { ...lead, notes: value } : lead))
    );
    if (leadToSave) {
      void patchLead({ ...leadToSave, notes: value }).catch((error) => {
        setLoadError(error instanceof Error ? error.message : 'Unable to update notes');
      });
    }
  }

  function saveLead(lead: CrmLead) {
    void patchLead(lead).catch((error) => {
      setLoadError(error instanceof Error ? error.message : 'Unable to save lead');
    });
  }

  function updateLeadStatus(lead: CrmLead, status: LeadStatus) {
    const updatedLead = { ...lead, status };
    saveLead(updatedLead);
  }

  function saveHouseProfile(leadId: string, profile: HouseProfile) {
    const leadToSave = sellerLeads.find((lead) => lead.id === leadId);
    setSellerLeads((current) =>
      current.map((lead) => (lead.id === leadId ? { ...lead, houseProfile: profile } : lead))
    );
    setSelectedLeadId(leadId);
    if (leadToSave) {
      void patchLead({ ...leadToSave, houseProfile: profile }).catch((error) => {
        setLoadError(error instanceof Error ? error.message : 'Unable to save house profile');
      });
    }
  }

  return (
    <>
      <div className='mb-3 flex justify-end border-b pb-3'>
        {loadError && (
          <p className='mr-auto self-center text-xs font-medium text-destructive'>{loadError}</p>
        )}
        <div className='flex shrink-0 items-center gap-2'>
          <Button variant='outline' size='sm' type='button'>
            <Icons.adjustments />
            Filter
          </Button>
          <Button variant='outline' size='sm' type='button' onClick={() => setImportOpen(true)}>
            <Icons.upload />
            Import Leads
          </Button>
          <Button size='sm' type='button' disabled={isSaving} onClick={() => setAddOpen(true)}>
            <Icons.add />
            Add Lead
          </Button>
        </div>
      </div>

      <div className='flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row'>
        {isLoading ? (
          <div className='grid min-w-0 flex-1 place-items-center border-y text-sm text-muted-foreground'>
            Loading leads...
          </div>
        ) : allLeads.length === 0 ? (
          <div className='grid min-w-0 flex-1 place-items-center border-y text-center'>
            <div>
              <p className='text-sm font-semibold'>No leads yet</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                Add or import leads to start filling the workspace.
              </p>
            </div>
          </div>
        ) : (
          <div className='grid min-w-0 flex-1 gap-3 md:grid-cols-2 lg:gap-0'>
            <LeadColumn
              title='Buyers'
              leads={filteredBuyers}
              sort={buyerSort}
              selectedLeadId={selectedLead?.id}
              onSortChange={setBuyerSort}
              onSelectLead={selectLead}
              onStatusChange={updateLeadStatus}
            />
            <LeadColumn
              title='Sellers'
              leads={filteredSellers}
              sort={sellerSort}
              selectedLeadId={selectedLead?.id}
              onSortChange={setSellerSort}
              onSelectLead={selectLead}
              onStatusChange={updateLeadStatus}
            />
          </div>
        )}
        {selectedLead && (
          <LeadProfilePanel
            lead={selectedLead}
            onNoteChange={updateNote}
            onEditLead={(lead) => setLeadToEdit(lead)}
            onEditHouseProfile={(lead) => setHouseProfileLead(lead)}
            onStatusChange={updateLeadStatus}
            onClose={() => setSelectedLeadId('')}
          />
        )}
      </div>

      <AddLeadDialog open={addOpen} onOpenChange={setAddOpen} onSubmit={addLead} />
      <ImportLeadsDialog open={importOpen} onOpenChange={setImportOpen} onImport={importLeads} />
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

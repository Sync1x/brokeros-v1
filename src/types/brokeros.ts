export type LeadStage = 'New' | 'Nurture' | 'Touring' | 'Offer' | 'Under Contract' | 'Closed';

export type LeadTemperature = 'Hot' | 'Warm' | 'Cool';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: LeadStage;
  temperature: LeadTemperature;
  budget: string;
  desiredArea: string;
  intent: string;
  lastContact: string;
  assignedAgent: string;
  notes: string[];
  preferences: string[];
}

export type ListingStatus = 'Private' | 'Coming Soon' | 'Active' | 'Under Review' | 'Closed';

export interface Listing {
  id: string;
  address: string;
  neighborhood: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  status: ListingStatus;
  owner: string;
  agent: string;
  signal: string;
  source?: string | null;
  primaryPhotoUrl?: string | null;
  mlsListingKey?: string | null;
  mlsListingId?: string | null;
  mlsStatus?: string | null;
}

export interface Match {
  id: string;
  leadId: string;
  listingId: string;
  score: number;
  rationale: string;
  status: 'Ready' | 'Review' | 'Sent';
  nextStep: string;
}

export interface BrokerDocument {
  id: string;
  title: string;
  client: string;
  type: 'Offer' | 'Disclosure' | 'Agreement' | 'Checklist' | 'Report';
  status: 'Draft' | 'Ready' | 'Signed' | 'Needs Review';
  updatedAt: string;
}

export interface BrokerTemplate {
  id: string;
  title: string;
  category: 'Email' | 'SMS' | 'Document' | 'Workflow';
  description: string;
  usageCount: number;
}

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  subject: string;
  time: string;
  tone: 'neutral' | 'positive' | 'warning';
}

export interface AgentOversight {
  id: string;
  name: string;
  activeLeads: number;
  listings: number;
  openTasks: number;
  responseTime: string;
  pipeline: string;
}

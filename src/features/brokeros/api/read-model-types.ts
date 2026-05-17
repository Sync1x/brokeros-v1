import type { Lead, Listing, Match } from '@/types/brokeros';

export interface BrokerSearchLead extends Lead {
  leadType?: 'buyer' | 'seller';
}

export interface BrokerSearchListing extends Listing {
  sellerLeadId?: string;
}

export interface BrokerSearchMatch extends Match {
  buyerLead?: BrokerSearchLead | null;
  houseProfile?: BrokerSearchListing | null;
}

export interface BrokerReadModel {
  leads: BrokerSearchLead[];
  listings: BrokerSearchListing[];
  matches: BrokerSearchMatch[];
}

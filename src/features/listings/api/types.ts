export type ListingStatus = 'Private' | 'Coming Soon' | 'Active' | 'Under Review';

export interface BrokerLeadApiData {
  id: string;
  name: string;
  desiredArea?: string;
  assignedAgent?: string;
}

export interface BrokerListingApiData {
  id: string;
  address: string;
  neighborhood: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  status: string;
  owner: string;
  sellerLeadId: string;
  sellerLead: BrokerLeadApiData | null;
  createdAt: string | null;
  features: string[];
  source: string | null;
  primaryPhotoUrl: string | null;
  mlsListingKey: string | null;
  mlsListingId: string | null;
  mlsStatus: string | null;
  raw: {
    address: string | null;
    town: string | null;
    state: string | null;
    zip: string | null;
    beds: number | string | null;
    baths: number | string | null;
    sqft: number | null;
    property_type: string | null;
    property_sub_type: string | null;
    features: string[] | null;
    list_price: number | null;
    status: string | null;
    created_at: string | null;
    source: string | null;
    mls_listing_key: string | null;
    mls_listing_id: string | null;
    mls_status: string | null;
    primary_photo_url: string | null;
    lot_size_acres: number | string | null;
    garage_spaces: number | string | null;
    garage_yn: boolean | null;
    waterfront_yn: boolean | null;
    remarks: string | null;
  };
}

export interface HouseProfilesResponse {
  houseProfiles: BrokerListingApiData[];
  sellerLeads: BrokerLeadApiData[];
}

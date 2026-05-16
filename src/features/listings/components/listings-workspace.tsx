'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { humanizeKey, humanizeList } from '@/lib/vocabulary/display';

type ListingStatus = 'Private' | 'Coming Soon' | 'Active' | 'Under Review';

interface HomeProfile {
  id: string;
  createdAt: string;
  sellerLeadId: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  neighborhood: string;
  propertyType: string;
  listingPrice: string;
  beds: string;
  baths: string;
  sqft: string;
  lotSize: string;
  yearBuilt: string;
  parking: string;
  basement: string;
  heating: string;
  cooling: string;
  hoa: string;
  condition: string;
  occupancyStatus: string;
  listingStatus: ListingStatus;
  sellerLead: string;
  showingInstructions: string;
  keyFeatures: string;
  upgrades: string;
  sellerDescription: string;
  agentNotes: string;
}

interface SellerLeadOption {
  id: string;
  name: string;
  detail: string;
}

interface BrokerLeadApiData {
  id: string;
  name: string;
  desiredArea?: string;
  assignedAgent?: string;
}

interface BrokerListingApiData {
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
    created_at: string | null;
  };
}

interface HouseProfilesResponse {
  houseProfiles: BrokerListingApiData[];
  sellerLeads: BrokerLeadApiData[];
}

const listingStatuses: ListingStatus[] = ['Private', 'Coming Soon', 'Active', 'Under Review'];

function readField(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function parseNumber(value: string) {
  const parsed = Number(value.replace(/[$,\s]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function splitFeatureList(value: string) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toListingStatus(value: string | null | undefined): ListingStatus {
  if (value === 'Private' || value === 'Coming Soon' || value === 'Under Review') return value;
  return 'Active';
}

function makeHouseProfilePayload(formData: FormData) {
  return {
    seller_lead_id: readField(formData, 'sellerLeadId'),
    address: readField(formData, 'address') || null,
    town: readField(formData, 'city') || null,
    beds: parseNumber(readField(formData, 'beds')),
    baths: parseNumber(readField(formData, 'baths')),
    sqft: parseNumber(readField(formData, 'sqft')),
    property_type: readField(formData, 'propertyType') || null,
    features: splitFeatureList(readField(formData, 'keyFeatures')),
    list_price: parseNumber(readField(formData, 'listingPrice')),
    status: readField(formData, 'listingStatus') || 'Active'
  };
}

function formatNumber(value: number | string | null | undefined) {
  if (value == null) return '';
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : '';
}

function formatDisplayKey(value: string | null | undefined) {
  return humanizeKey(value) || '';
}

function formatDisplayList(value: string | null | undefined) {
  return humanizeList(splitFeatureList(value ?? '')).join(', ');
}

function mapListingToHomeProfile(listing: BrokerListingApiData): HomeProfile {
  const town = listing.raw.town ?? '';
  const features = listing.features.length ? listing.features : (listing.raw.features ?? []);

  return {
    id: listing.id,
    createdAt: listing.createdAt ?? listing.raw.created_at ?? new Date().toISOString(),
    sellerLeadId: listing.sellerLeadId,
    address: listing.raw.address ?? listing.address,
    city: town === 'Not set' ? '' : town,
    state: '',
    zip: '',
    neighborhood: '',
    propertyType: listing.raw.property_type ?? '',
    listingPrice: listing.price === 'Not set' ? '' : listing.price,
    beds: formatNumber(listing.raw.beds ?? listing.beds),
    baths: formatNumber(listing.raw.baths ?? listing.baths),
    sqft: formatNumber(listing.raw.sqft),
    lotSize: '',
    yearBuilt: '',
    parking: '',
    basement: '',
    heating: '',
    cooling: '',
    hoa: '',
    condition: '',
    occupancyStatus: '',
    listingStatus: toListingStatus(listing.status ?? listing.raw.status),
    sellerLead: listing.sellerLead?.name ?? listing.owner,
    showingInstructions: '',
    keyFeatures: features.join(', '),
    upgrades: '',
    sellerDescription: '',
    agentNotes: ''
  };
}

function mapSellerLeadOptions(leads: BrokerLeadApiData[]): SellerLeadOption[] {
  return leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    detail: `${lead.desiredArea ?? 'Seller lead'} / ${lead.assignedAgent ?? 'Unassigned'}`
  }));
}

function Field({
  label,
  name,
  placeholder,
  required,
  type = 'text'
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className='space-y-2'>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} required={required} />
    </div>
  );
}

function TextareaField({
  label,
  name,
  placeholder
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <div className='space-y-2 md:col-span-2'>
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} placeholder={placeholder} className='min-h-24' />
    </div>
  );
}

function SellerLeadField({ options }: { options: SellerLeadOption[] }) {
  const [value, setValue] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState('');

  const query = value.includes('@') ? value.slice(value.lastIndexOf('@') + 1).trim() : '';
  const showSuggestions = value.includes('@');
  const filteredLeads = options.filter((lead) =>
    lead.name.toLowerCase().includes(query.toLowerCase())
  );
  const selectedLead = options.find((lead) => lead.id === selectedLeadId);
  const hiddenLeadId = selectedLead && value === `@${selectedLead.name}` ? selectedLead.id : '';

  function selectLead(lead: SellerLeadOption) {
    setValue(`@${lead.name}`);
    setSelectedLeadId(lead.id);
  }

  return (
    <div className='relative space-y-2 md:col-span-2'>
      <Label htmlFor='sellerLead'>Add seller lead</Label>
      <input type='hidden' name='sellerLeadId' value={hiddenLeadId} />
      <Input
        id='sellerLead'
        name='sellerLead'
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setSelectedLeadId('');
        }}
        placeholder='Type @ to search lead names'
        autoComplete='off'
        required
      />
      {showSuggestions && (
        <div className='bg-popover absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-md border shadow-md'>
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead) => (
              <button
                key={lead.id}
                type='button'
                onClick={() => selectLead(lead)}
                className='hover:bg-accent focus:bg-accent flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm outline-hidden'
              >
                <span className='font-medium'>{lead.name}</span>
                <span className='text-muted-foreground truncate text-xs'>{lead.detail}</span>
              </button>
            ))
          ) : (
            <div className='text-muted-foreground px-3 py-3 text-sm'>No leads found.</div>
          )}
        </div>
      )}
    </div>
  );
}

function AddHomeProfileDialog({
  open,
  onOpenChange,
  onAddHome,
  sellerLeadOptions,
  isSubmitting
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddHome: (formData: FormData) => Promise<void>;
  sellerLeadOptions: SellerLeadOption[];
  isSubmitting: boolean;
}) {
  const [primeMlsUrl, setPrimeMlsUrl] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!readField(formData, 'sellerLeadId')) {
      setSubmitError('Select a seller lead from the suggestions before submitting.');
      return;
    }

    setSubmitError(null);

    try {
      await onAddHome(formData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to save home profile.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl'>
        <DialogHeader className='border-b px-5 py-4'>
          <DialogTitle>Add Home Profile</DialogTitle>
          <DialogDescription>
            Add the listing details needed for matching, seller context, and agent follow-up.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col'>
          <div className='border-b px-5 py-4'>
            <div className='flex flex-col gap-3 lg:flex-row lg:items-end'>
              <div className='min-w-0 flex-1 space-y-2'>
                <Label htmlFor='primeMlsUrl'>Paste PrimeMLS URL Here:</Label>
                <Input
                  id='primeMlsUrl'
                  name='primeMlsUrl'
                  value={primeMlsUrl}
                  onChange={(event) => setPrimeMlsUrl(event.target.value)}
                  placeholder='https://...'
                  autoComplete='off'
                />
              </div>
              <Button type='button' variant='outline' className='shrink-0'>
                Confirm
              </Button>
            </div>
          </div>
          <ScrollArea className='min-h-0 flex-1 px-5 py-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <SellerLeadField key={open ? 'open' : 'closed'} options={sellerLeadOptions} />
              <Field label='Address' name='address' placeholder='123 Main Street' required />
              <Field label='Neighborhood' name='neighborhood' placeholder='West Village' />
              <Field label='City' name='city' placeholder='New York' required />
              <Field label='State' name='state' placeholder='NY' required />
              <Field label='ZIP' name='zip' placeholder='10014' />
              <Field label='Property type' name='propertyType' placeholder='Condo, townhouse...' />
              <Field label='Listing price' name='listingPrice' placeholder='$1,250,000' required />
              <Field label='Bedrooms' name='beds' placeholder='3' />
              <Field label='Bathrooms' name='baths' placeholder='2.5' />
              <Field label='Square feet' name='sqft' placeholder='1,850' />
              <Field label='Lot size' name='lotSize' placeholder='2,100 sqft' />
              <Field label='Year built' name='yearBuilt' placeholder='1928' />
              <Field label='Parking' name='parking' placeholder='Garage, deeded spot...' />
              <Field label='Basement' name='basement' placeholder='Finished, partial, none...' />
              <Field label='Heating' name='heating' placeholder='Gas forced air' />
              <Field label='Cooling' name='cooling' placeholder='Central air' />
              <Field label='HOA / monthlies' name='hoa' placeholder='$850/mo or none' />
              <Field label='Condition' name='condition' placeholder='Updated, needs work...' />
              <Field label='Occupancy status' name='occupancyStatus' placeholder='Owner occupied' />
              <div className='space-y-2'>
                <Label htmlFor='listingStatus'>Listing status</Label>
                <select
                  id='listingStatus'
                  name='listingStatus'
                  className='border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden'
                  defaultValue='Active'
                >
                  {listingStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <TextareaField
                label='Showing instructions'
                name='showingInstructions'
                placeholder='Preferred windows, access notes, restrictions...'
              />
              <TextareaField
                label='Key features'
                name='keyFeatures'
                placeholder='Private terrace, renovated kitchen, quiet block...'
              />
              <TextareaField
                label='Upgrades / renovations'
                name='upgrades'
                placeholder='Roof 2024, kitchen 2022, HVAC 2021...'
              />
              <TextareaField
                label='Seller description'
                name='sellerDescription'
                placeholder='Seller goals, timing, motivation, pricing expectations...'
              />
              <TextareaField
                label='Agent notes'
                name='agentNotes'
                placeholder='Prep items, pricing strategy, matching notes...'
              />
            </div>
          </ScrollArea>
          <DialogFooter className='border-t px-5 py-4'>
            {submitError && (
              <p className='text-destructive mr-auto text-sm font-medium'>{submitError}</p>
            )}
            <Button variant='outline' type='button' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' isLoading={isSubmitting}>
              Submit Home Profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;

  return (
    <div className='rounded-md border px-3 py-2'>
      <dt className='text-muted-foreground text-[0.65rem] font-medium tracking-wide uppercase'>
        {label}
      </dt>
      <dd className='mt-1 text-sm'>{value}</dd>
    </div>
  );
}

function getListingStatusTone(status: ListingStatus) {
  switch (status) {
    case 'Active':
      return 'border-brokeros-success/20 bg-brokeros-success/10 text-brokeros-success';
    case 'Private':
      return 'border-slate-200 bg-slate-100 text-slate-700';
    case 'Coming Soon':
      return 'border-brokeros-warning/20 bg-brokeros-warning/10 text-brokeros-warning';
    case 'Under Review':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    default:
      return 'border-border bg-muted text-muted-foreground';
  }
}

function formatListingLocation(home: HomeProfile) {
  return [home.neighborhood, home.city, home.state].filter(Boolean).join(', ');
}

function formatListingStats(home: HomeProfile) {
  return [home.beds ? `${home.beds} bd` : '', home.baths ? `${home.baths} ba` : '', home.sqft ? `${home.sqft} sqft` : '']
    .filter(Boolean)
    .join(' · ');
}

function formatFeaturePreview(home: HomeProfile) {
  return [formatDisplayList(home.keyFeatures), home.upgrades]
    .map((item) => item.trim())
    .filter(Boolean)
    .join(' · ');
}

function HomeDetailsDialog({
  home,
  onOpenChange
}: {
  home: HomeProfile | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={Boolean(home)} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-hidden p-0 sm:max-w-3xl'>
        {home && (
          <>
            <DialogHeader className='border-b px-5 py-4'>
              <div className='flex flex-wrap items-start justify-between gap-3 pr-8'>
                <div>
                  <DialogTitle>{home.address}</DialogTitle>
                  <DialogDescription>
                    {[home.neighborhood, home.city, home.state, home.zip]
                      .filter(Boolean)
                      .join(', ')}
                  </DialogDescription>
                </div>
                <Badge variant='outline' className='font-mono text-[0.65rem] uppercase'>
                  {home.listingStatus}
                </Badge>
              </div>
            </DialogHeader>
            <ScrollArea className='max-h-[70vh] px-5 py-4'>
              <dl className='grid gap-3 md:grid-cols-2'>
                <DetailRow label='Seller lead' value={home.sellerLead} />
                <DetailRow label='Listing price' value={home.listingPrice} />
                <DetailRow label='Property type' value={formatDisplayKey(home.propertyType)} />
                <DetailRow
                  label='Profile'
                  value={`${home.beds || '—'} bd / ${home.baths || '—'} ba / ${home.sqft || '—'} sqft`}
                />
                <DetailRow label='Lot size' value={home.lotSize} />
                <DetailRow label='Year built' value={home.yearBuilt} />
                <DetailRow label='Parking' value={home.parking} />
                <DetailRow label='Basement' value={home.basement} />
                <DetailRow label='Heating' value={home.heating} />
                <DetailRow label='Cooling' value={home.cooling} />
                <DetailRow label='HOA / monthlies' value={home.hoa} />
                <DetailRow label='Condition' value={home.condition} />
                <DetailRow label='Occupancy' value={home.occupancyStatus} />
                <DetailRow label='Showing instructions' value={home.showingInstructions} />
                <DetailRow label='Key features' value={formatDisplayList(home.keyFeatures)} />
                <DetailRow label='Upgrades' value={home.upgrades} />
                <DetailRow label='Seller description' value={home.sellerDescription} />
                <DetailRow label='Agent notes' value={home.agentNotes} />
              </dl>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function HomeProfileCard({
  home,
  onSelect
}: {
  home: HomeProfile;
  onSelect: (home: HomeProfile) => void;
}) {
  const location = formatListingLocation(home);
  const stats = formatListingStats(home);
  const features = formatFeaturePreview(home);

  return (
    <button
      type='button'
      onClick={() => onSelect(home)}
      className='group bg-card hover:bg-muted/20 flex min-h-[16rem] w-full max-w-[22.5rem] flex-col overflow-hidden rounded-xl border text-left shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-border/80 hover:shadow-md'
    >
      <div className='border-b px-4 py-4'>
        <div className='mb-3 flex items-start justify-between gap-3'>
          <Badge
            variant='outline'
            className={cn(
              'rounded-full px-3 py-1 text-[0.65rem] font-semibold tracking-wide uppercase',
              getListingStatusTone(home.listingStatus)
            )}
          >
            {home.listingStatus}
          </Badge>
          <span className='text-base font-bold tabular-nums text-foreground'>
            {home.listingPrice || '—'}
          </span>
        </div>

        <div className='space-y-1'>
          <h3 className='group-hover:text-primary line-clamp-2 text-lg font-bold leading-tight text-foreground'>
            {home.address}
          </h3>
          <p className='text-sm text-muted-foreground'>{location || 'No location set'}</p>
        </div>
      </div>

      <div className='flex flex-1 flex-col gap-3 px-4 py-4'>
        <div className='space-y-2'>
          <p className='text-sm font-medium text-foreground/90'>{stats || 'No home stats yet'}</p>
          {features ? <p className='line-clamp-2 text-sm text-muted-foreground'>{features}</p> : null}
        </div>

        <div className='mt-auto grid gap-3 text-sm'>
          <div>
            <p className='text-muted-foreground text-[0.65rem] uppercase tracking-wide'>
              Seller lead
            </p>
            <p className='truncate font-medium'>{home.sellerLead || '—'}</p>
          </div>
          <div>
            <p className='text-muted-foreground text-[0.65rem] uppercase tracking-wide'>
              Key features
            </p>
            <p className='line-clamp-2 text-muted-foreground'>
              {formatDisplayList(home.keyFeatures) || home.upgrades || home.sellerDescription || 'No notes yet'}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

function RecentHomesRail({
  homes,
  onSelect
}: {
  homes: HomeProfile[];
  onSelect: (home: HomeProfile) => void;
}) {
  const recentHomes = homes.slice(0, 5);

  return (
    <aside className='bg-card h-fit overflow-hidden rounded-xl border shadow-sm lg:sticky lg:top-4'>
      <div className='border-b px-4 py-3'>
        <h2 className='text-sm font-semibold'>Most Recent Homes</h2>
      </div>
      {recentHomes.length > 0 ? (
        <div className='divide-y'>
          {recentHomes.map((home) => (
            <button
              key={home.id}
              type='button'
              onClick={() => onSelect(home)}
              className='hover:bg-muted/30 w-full px-4 py-3 text-left transition-colors'
            >
              <p className='truncate text-sm font-medium'>{home.address}</p>
              <p className='text-muted-foreground mt-1 truncate text-[0.7rem]'>
                {home.listingPrice || 'No price'} · {home.neighborhood || home.city || 'No area'}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <p className='text-muted-foreground px-4 py-4 text-xs'>No home profiles added yet.</p>
      )}
    </aside>
  );
}

export function ListingsWorkspace() {
  const [homes, setHomes] = useState<HomeProfile[]>([]);
  const [sellerLeadOptions, setSellerLeadOptions] = useState<SellerLeadOption[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedHome, setSelectedHome] = useState<HomeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedHomes = useMemo(
    () =>
      homes.toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [homes]
  );

  const loadHouseProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/brokeros/house-profiles', {
        cache: 'no-store'
      });
      const data = (await response.json()) as Partial<HouseProfilesResponse> & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to load house profiles.');
      }

      setHomes((data.houseProfiles ?? []).map(mapListingToHomeProfile));
      setSellerLeadOptions(mapSellerLeadOptions(data.sellerLeads ?? []));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load house profiles.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHouseProfiles();
  }, [loadHouseProfiles]);

  async function addHome(formData: FormData) {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/brokeros/house-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(makeHouseProfilePayload(formData))
      });
      const data = (await response.json()) as {
        houseProfile?: BrokerListingApiData;
        error?: string;
      };

      if (!response.ok || !data.houseProfile) {
        throw new Error(data.error ?? 'Unable to save home profile.');
      }

      const houseProfile = data.houseProfile;
      setHomes((current) => [mapListingToHomeProfile(houseProfile), ...current]);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageContainer
      pageTitle={`Active Listings: ${homes.length}`}
      pageHeaderAction={
        <Button onClick={() => setAddOpen(true)}>
          <Icons.add className='mr-2 size-4' />
          Add Home Profile
        </Button>
      }
    >
      <div className='grid min-h-[calc(100vh-9rem)] gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]'>
        <main className='bg-background overflow-hidden rounded-xl border shadow-sm'>
          <div className='flex items-center justify-between gap-3 border-b px-4 py-3'>
            <div>
              <h2 className='text-sm font-semibold'>Home Profiles</h2>
              <p className='text-muted-foreground text-xs'>
                Active home listings added by the agent.
              </p>
            </div>
            <Badge variant='secondary' className='font-mono text-[0.65rem] uppercase'>
              {homes.length} total
            </Badge>
          </div>
          {isLoading ? (
            <div className='flex min-h-80 flex-col items-center justify-center px-4 text-center'>
              <div className='bg-muted mb-4 flex size-12 items-center justify-center rounded-md'>
                <Icons.spinner className='text-muted-foreground size-6 animate-spin' />
              </div>
              <h2 className='text-base font-semibold'>Loading home profiles</h2>
              <p className='text-muted-foreground mt-1 max-w-sm text-sm'>
                Pulling active listings from Supabase.
              </p>
            </div>
          ) : error ? (
            <div className='flex min-h-80 flex-col items-center justify-center px-4 text-center'>
              <div className='bg-muted mb-4 flex size-12 items-center justify-center rounded-md'>
                <Icons.warning className='text-muted-foreground size-6' />
              </div>
              <h2 className='text-base font-semibold'>Listings unavailable</h2>
              <p className='text-muted-foreground mt-1 max-w-sm text-sm'>{error}</p>
              <Button className='mt-4' onClick={() => void loadHouseProfiles()}>
                Retry
              </Button>
            </div>
          ) : sortedHomes.length > 0 ? (
            <div className='grid grid-cols-1 gap-4 p-4 justify-items-start sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
              {sortedHomes.map((home) => (
                <HomeProfileCard key={home.id} home={home} onSelect={setSelectedHome} />
              ))}
            </div>
          ) : (
            <div className='flex min-h-80 flex-col items-center justify-center px-4 text-center'>
              <div className='bg-muted mb-4 flex size-12 items-center justify-center rounded-md'>
                <Icons.home className='text-muted-foreground size-6' />
              </div>
              <h2 className='text-base font-semibold'>No home profiles yet</h2>
              <p className='text-muted-foreground mt-1 max-w-sm text-sm'>
                Add a home profile to create the first active listing on this page.
              </p>
              <Button className='mt-4' onClick={() => setAddOpen(true)}>
                <Icons.add className='mr-2 size-4' />
                Add Home Profile
              </Button>
            </div>
          )}
        </main>
        <RecentHomesRail homes={sortedHomes} onSelect={setSelectedHome} />
      </div>
      <AddHomeProfileDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAddHome={addHome}
        sellerLeadOptions={sellerLeadOptions}
        isSubmitting={isSubmitting}
      />
      <HomeDetailsDialog home={selectedHome} onOpenChange={() => setSelectedHome(null)} />
    </PageContainer>
  );
}

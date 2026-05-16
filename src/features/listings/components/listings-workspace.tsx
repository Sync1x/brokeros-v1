'use client';

import { useMemo, useState, type FormEvent } from 'react';
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
import { brokerLeads } from '@/constants/brokeros-mock-data';

type ListingStatus = 'Private' | 'Coming Soon' | 'Active' | 'Under Review';

interface HomeProfile {
  id: string;
  createdAt: string;
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

const listingStatuses: ListingStatus[] = ['Private', 'Coming Soon', 'Active', 'Under Review'];

const sellerLeadOptions = brokerLeads.map((lead) => ({
  id: lead.id,
  name: lead.name,
  detail: `${lead.desiredArea} / ${lead.assignedAgent}`
}));

function readField(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function makeHomeProfile(formData: FormData): HomeProfile {
  return {
    id: `home-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    address: readField(formData, 'address'),
    city: readField(formData, 'city'),
    state: readField(formData, 'state'),
    zip: readField(formData, 'zip'),
    neighborhood: readField(formData, 'neighborhood'),
    propertyType: readField(formData, 'propertyType'),
    listingPrice: readField(formData, 'listingPrice'),
    beds: readField(formData, 'beds'),
    baths: readField(formData, 'baths'),
    sqft: readField(formData, 'sqft'),
    lotSize: readField(formData, 'lotSize'),
    yearBuilt: readField(formData, 'yearBuilt'),
    parking: readField(formData, 'parking'),
    basement: readField(formData, 'basement'),
    heating: readField(formData, 'heating'),
    cooling: readField(formData, 'cooling'),
    hoa: readField(formData, 'hoa'),
    condition: readField(formData, 'condition'),
    occupancyStatus: readField(formData, 'occupancyStatus'),
    listingStatus: (readField(formData, 'listingStatus') || 'Active') as ListingStatus,
    sellerLead: readField(formData, 'sellerLead').replace(/^@/, ''),
    showingInstructions: readField(formData, 'showingInstructions'),
    keyFeatures: readField(formData, 'keyFeatures'),
    upgrades: readField(formData, 'upgrades'),
    sellerDescription: readField(formData, 'sellerDescription'),
    agentNotes: readField(formData, 'agentNotes')
  };
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

function SellerLeadField() {
  const [value, setValue] = useState('');

  const query = value.includes('@') ? value.slice(value.lastIndexOf('@') + 1).trim() : '';
  const showSuggestions = value.includes('@');
  const filteredLeads = sellerLeadOptions.filter((lead) =>
    lead.name.toLowerCase().includes(query.toLowerCase())
  );

  function selectLead(name: string) {
    setValue(`@${name}`);
  }

  return (
    <div className='relative space-y-2 md:col-span-2'>
      <Label htmlFor='sellerLead'>Add seller lead</Label>
      <Input
        id='sellerLead'
        name='sellerLead'
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder='Type @ to search lead names'
        autoComplete='off'
      />
      {showSuggestions && (
        <div className='bg-popover absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-md border shadow-md'>
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead) => (
              <button
                key={lead.id}
                type='button'
                onClick={() => selectLead(lead.name)}
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
  onAddHome
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddHome: (home: HomeProfile) => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const home = makeHomeProfile(new FormData(event.currentTarget));
    onAddHome(home);
    event.currentTarget.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-3xl'>
        <DialogHeader className='border-b px-5 py-4'>
          <DialogTitle>Add Home Profile</DialogTitle>
          <DialogDescription>
            Add the listing details needed for matching, seller context, and agent follow-up.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col'>
          <ScrollArea className='max-h-[68vh] px-5 py-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <SellerLeadField />
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
            <Button variant='outline' type='button' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit'>Submit Home Profile</Button>
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
                <DetailRow label='Property type' value={home.propertyType} />
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
                <DetailRow label='Key features' value={home.keyFeatures} />
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
  return (
    <button
      type='button'
      onClick={() => onSelect(home)}
      className='group bg-background hover:bg-muted/35 flex w-full flex-col gap-3 border-b px-4 py-4 text-left transition-colors'
    >
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h3 className='group-hover:text-primary truncate text-sm font-semibold'>
            {home.address}
          </h3>
          <p className='text-muted-foreground mt-1 text-xs'>
            {[home.neighborhood, home.city, home.state].filter(Boolean).join(', ')}
          </p>
        </div>
        <Badge variant='outline' className='font-mono text-[0.62rem] uppercase'>
          {home.listingStatus}
        </Badge>
      </div>
      <div className='grid gap-3 text-xs sm:grid-cols-4'>
        <div>
          <p className='text-muted-foreground'>Price</p>
          <p className='font-mono'>{home.listingPrice || '—'}</p>
        </div>
        <div>
          <p className='text-muted-foreground'>Profile</p>
          <p>
            {home.beds || '—'} bd / {home.baths || '—'} ba
          </p>
        </div>
        <div>
          <p className='text-muted-foreground'>Size</p>
          <p>{home.sqft ? `${home.sqft} sqft` : '—'}</p>
        </div>
        <div>
          <p className='text-muted-foreground'>Seller lead</p>
          <p className='truncate'>{home.sellerLead || '—'}</p>
        </div>
      </div>
      {(home.keyFeatures || home.agentNotes) && (
        <p className='text-muted-foreground line-clamp-2 text-xs'>
          {home.keyFeatures || home.agentNotes}
        </p>
      )}
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
    <aside className='bg-background h-fit border lg:sticky lg:top-4'>
      <div className='border-b px-3 py-3'>
        <h2 className='text-sm font-semibold'>Most Recent Homes</h2>
      </div>
      {recentHomes.length > 0 ? (
        <div className='divide-y'>
          {recentHomes.map((home) => (
            <button
              key={home.id}
              type='button'
              onClick={() => onSelect(home)}
              className='hover:bg-muted/35 w-full px-3 py-3 text-left transition-colors'
            >
              <p className='truncate text-xs font-medium'>{home.address}</p>
              <p className='text-muted-foreground mt-1 truncate text-[0.7rem]'>
                {home.listingPrice || 'No price'} · {home.neighborhood || home.city || 'No area'}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <p className='text-muted-foreground px-3 py-4 text-xs'>No home profiles added yet.</p>
      )}
    </aside>
  );
}

export function ListingsWorkspace() {
  const [homes, setHomes] = useState<HomeProfile[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedHome, setSelectedHome] = useState<HomeProfile | null>(null);

  const sortedHomes = useMemo(
    () =>
      homes.toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [homes]
  );

  function addHome(home: HomeProfile) {
    setHomes((current) => [home, ...current]);
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
      <div className='grid min-h-[calc(100vh-9rem)] gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]'>
        <main className='bg-background overflow-hidden border'>
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
          {sortedHomes.length > 0 ? (
            <div className='divide-y'>
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
      <AddHomeProfileDialog open={addOpen} onOpenChange={setAddOpen} onAddHome={addHome} />
      <HomeDetailsDialog home={selectedHome} onOpenChange={() => setSelectedHome(null)} />
    </PageContainer>
  );
}

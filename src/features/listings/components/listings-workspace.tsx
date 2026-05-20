'use client';

import { useMemo, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/brokeros/status-pill';
import { houseProfilesKeys, houseProfilesQueryOptions } from '@/features/listings/api/queries';
import type { BrokerListingApiData, ListingStatus } from '@/features/listings/api/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { humanizeKey, humanizeList } from '@/lib/vocabulary/display';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface HomeProfile {
  id: string;
  createdAt: string;
  sellerLeadId: string;
  source: string | null;
  primaryPhotoUrl: string | null;
  mlsListingKey: string | null;
  mlsListingId: string | null;
  mlsStatus: string | null;
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
  showingInstructions: string;
  keyFeatures: string;
  upgrades: string;
  sellerDescription: string;
  agentNotes: string;
}

interface ParagonSyncResult {
  fetched: number;
  mapped: number;
  upserted: number;
  error?: string;
}

function numberResult(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

async function parseSyncResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();

  if (!contentType.includes('application/json')) {
    throw new Error(`Sync returned ${response.status}: ${text.replace(/\s+/g, ' ').slice(0, 160)}`);
  }

  const data = JSON.parse(text) as {
    fetched?: unknown;
    mapped?: unknown;
    upserted?: unknown;
    error?: unknown;
  };

  if (!response.ok) {
    throw new Error(
      typeof data.error === 'string' ? data.error : 'Unable to sync Paragon listings.'
    );
  }

  return {
    fetched: numberResult(data.fetched),
    mapped: numberResult(data.mapped),
    upserted: numberResult(data.upserted)
  };
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
    source: listing.source,
    primaryPhotoUrl: listing.primaryPhotoUrl,
    mlsListingKey: listing.mlsListingKey,
    mlsListingId: listing.mlsListingId,
    mlsStatus: listing.mlsStatus,
    address: listing.raw.address ?? listing.address,
    city: town === 'Not set' ? '' : town,
    state: listing.raw.state ?? '',
    zip: listing.raw.zip ?? '',
    neighborhood: '',
    propertyType: listing.raw.property_type ?? '',
    listingPrice: listing.price === 'Not set' ? '' : listing.price,
    beds: formatNumber(listing.raw.beds ?? listing.beds),
    baths: formatNumber(listing.raw.baths ?? listing.baths),
    sqft: formatNumber(listing.raw.sqft),
    lotSize: formatNumber(listing.raw.lot_size_acres)
      ? `${formatNumber(listing.raw.lot_size_acres)} acres`
      : '',
    yearBuilt: '',
    parking:
      listing.raw.garage_yn || listing.raw.garage_spaces
        ? `${formatNumber(listing.raw.garage_spaces) || 'Garage'} spaces`
        : '',
    basement: '',
    heating: '',
    cooling: '',
    hoa: '',
    condition: '',
    occupancyStatus: '',
    listingStatus: toListingStatus(listing.status ?? listing.raw.status),
    showingInstructions: '',
    keyFeatures: features.join(', '),
    upgrades: '',
    sellerDescription: listing.raw.remarks ?? '',
    agentNotes: ''
  };
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

function listingStatusVariant(status: ListingStatus) {
  if (status === 'Active') return 'active';
  if (status === 'Coming Soon') return 'warning';
  if (status === 'Under Review') return 'info';
  return 'neutral';
}

function formatListingLocation(home: HomeProfile) {
  return [home.neighborhood, home.city, home.state].filter(Boolean).join(', ');
}

type ListingStat = {
  icon: (typeof Icons)[keyof typeof Icons];
  label: string;
  value: string;
};

function getListingStats(home: Pick<HomeProfile, 'beds' | 'baths' | 'sqft'>): ListingStat[] {
  return [
    { icon: Icons.bed, label: 'Beds', value: home.beds },
    { icon: Icons.bath, label: 'Baths', value: home.baths },
    { icon: Icons.sqft, label: 'Sqft', value: home.sqft }
  ].filter((stat) => Boolean(stat.value));
}

function ListingStatsRow({
  home,
  className
}: {
  home: Pick<HomeProfile, 'beds' | 'baths' | 'sqft'>;
  className?: string;
}) {
  const stats = getListingStats(home);

  if (stats.length === 0) {
    return <p className={cn('text-sm text-muted-foreground', className)}>No home stats yet</p>;
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {stats.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className='inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-sm font-medium text-foreground'
        >
          <Icon className='text-muted-foreground size-3.5' />
          <span className='tabular-nums'>{value}</span>
        </div>
      ))}
    </div>
  );
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
                <div className='flex flex-wrap justify-end gap-2'>
                  {home.source === 'paragon_test' ? (
                    <Badge variant='secondary' className='font-mono text-[0.65rem] uppercase'>
                      API TEST DATA
                    </Badge>
                  ) : null}
                  <StatusPill variant={listingStatusVariant(home.listingStatus)} dot>
                    {home.listingStatus}
                  </StatusPill>
                </div>
              </div>
            </DialogHeader>
            <ScrollArea className='max-h-[70vh] px-5 py-4'>
              <dl className='grid gap-3 md:grid-cols-2'>
                <DetailRow label='Listing price' value={home.listingPrice} />
                <DetailRow label='Property type' value={formatDisplayKey(home.propertyType)} />
                <div className='rounded-md border px-3 py-2 md:col-span-2'>
                  <dt className='text-muted-foreground text-[0.65rem] font-medium tracking-wide uppercase'>
                    Profile
                  </dt>
                  <dd className='mt-2'>
                    <ListingStatsRow home={home} />
                  </dd>
                </div>
                <DetailRow label='Lot size' value={home.lotSize} />
                <DetailRow label='Year built' value={home.yearBuilt} />
                <DetailRow label='Parking' value={home.parking} />
                <DetailRow label='Basement' value={home.basement} />
                <DetailRow label='Heating' value={home.heating} />
                <DetailRow label='Cooling' value={home.cooling} />
                <DetailRow label='HOA / monthlies' value={home.hoa} />
                <DetailRow label='Condition' value={home.condition} />
                <DetailRow label='Occupancy' value={home.occupancyStatus} />
                <DetailRow label='MLS Listing ID' value={home.mlsListingId ?? ''} />
                <DetailRow label='MLS Status' value={home.mlsStatus ?? ''} />
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
  const features = formatFeaturePreview(home);

  return (
    <button
      type='button'
      onClick={() => onSelect(home)}
      className='group bg-card hover:bg-muted/20 flex min-h-[16rem] w-full max-w-[22.5rem] flex-col overflow-hidden rounded-lg border text-left shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-border/80 hover:shadow-md'
    >
      <div className='border-b px-4 py-4'>
        <div className='mb-3 flex items-start justify-between gap-3'>
          <div className='flex flex-wrap gap-2'>
            <StatusPill variant={listingStatusVariant(home.listingStatus)} dot>
              {home.listingStatus}
            </StatusPill>
            {home.source === 'paragon_test' ? (
              <Badge variant='secondary' className='font-mono text-[0.65rem] uppercase'>
                API TEST DATA
              </Badge>
            ) : null}
          </div>
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
          <ListingStatsRow home={home} />
          {features ? (
            <p className='line-clamp-2 text-sm text-muted-foreground'>{features}</p>
          ) : null}
        </div>

        <div className='mt-auto grid gap-3 text-sm'>
          <div>
            <p className='text-muted-foreground text-[0.65rem] uppercase tracking-wide'>
              Key features
            </p>
            <p className='line-clamp-2 text-muted-foreground'>
              {formatDisplayList(home.keyFeatures) ||
                home.upgrades ||
                home.sellerDescription ||
                'No notes yet'}
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
    <aside className='bg-card h-fit overflow-hidden rounded-none border shadow-sm lg:sticky lg:top-4'>
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
              {home.source === 'paragon_test' ? (
                <Badge variant='secondary' className='mt-2 font-mono text-[0.6rem] uppercase'>
                  API TEST DATA
                </Badge>
              ) : null}
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
  const queryClient = useQueryClient();
  const houseProfilesQuery = useQuery(houseProfilesQueryOptions());
  const [selectedHome, setSelectedHome] = useState<HomeProfile | null>(null);
  const [syncResult, setSyncResult] = useState<ParagonSyncResult | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const homes = useMemo(
    () => (houseProfilesQuery.data?.houseProfiles ?? []).map(mapListingToHomeProfile),
    [houseProfilesQuery.data?.houseProfiles]
  );
  const sortedHomes = useMemo(
    () =>
      homes.toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [homes]
  );
  const error =
    houseProfilesQuery.error instanceof Error
      ? houseProfilesQuery.error.message
      : 'Unable to load house profiles.';

  async function syncParagonListings() {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const response = await fetch('/api/mls/paragon/sync', {
        method: 'POST',
        credentials: 'same-origin'
      });
      const result = await parseSyncResponse(response);
      setSyncResult(result);
      await queryClient.invalidateQueries({ queryKey: houseProfilesKeys.all });
      await houseProfilesQuery.refetch();
    } catch (syncError) {
      setSyncResult({
        fetched: 0,
        mapped: 0,
        upserted: 0,
        error: syncError instanceof Error ? syncError.message : 'Unable to sync Paragon listings.'
      });
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <PageContainer pageTitle={`Active Listings: ${homes.length}`}>
      <div className='grid min-h-[calc(100vh-9rem)] gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]'>
        <main className='bg-background overflow-hidden rounded-none border shadow-sm'>
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
          {syncResult ? (
            <div className='border-b px-4 py-3 text-sm'>
              {syncResult.error ? (
                <p className='text-destructive font-medium'>{syncResult.error}</p>
              ) : (
                <p className='text-muted-foreground'>
                  Paragon sync complete: fetched{' '}
                  <span className='font-medium text-foreground tabular-nums'>
                    {syncResult.fetched}
                  </span>
                  , mapped{' '}
                  <span className='font-medium text-foreground tabular-nums'>
                    {syncResult.mapped}
                  </span>
                  , upserted{' '}
                  <span className='font-medium text-foreground tabular-nums'>
                    {syncResult.upserted}
                  </span>
                  .
                </p>
              )}
            </div>
          ) : null}
          {houseProfilesQuery.isPending ? (
            <div className='flex min-h-80 flex-col items-center justify-center px-4 text-center'>
              <div className='bg-muted mb-4 flex size-12 items-center justify-center rounded-md'>
                <Icons.spinner className='text-muted-foreground size-6 animate-spin' />
              </div>
              <h2 className='text-base font-semibold'>Loading home profiles</h2>
              <p className='text-muted-foreground mt-1 max-w-sm text-sm'>
                Pulling active listings from Supabase.
              </p>
            </div>
          ) : houseProfilesQuery.isError ? (
            <div className='flex min-h-80 flex-col items-center justify-center px-4 text-center'>
              <div className='bg-muted mb-4 flex size-12 items-center justify-center rounded-md'>
                <Icons.warning className='text-muted-foreground size-6' />
              </div>
              <h2 className='text-base font-semibold'>Listings unavailable</h2>
              <p className='text-muted-foreground mt-1 max-w-sm text-sm'>{error}</p>
              <Button className='mt-4' onClick={() => void houseProfilesQuery.refetch()}>
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
                No Paragon test listings synced yet.
              </p>
              {/* Temporary testing control. Move this to an admin/settings data sync surface later. */}
              <Button
                className='mt-4'
                size='sm'
                onClick={() => void syncParagonListings()}
                isLoading={isSyncing}
              >
                Sync Paragon Test Listings
              </Button>
            </div>
          )}
        </main>
        <RecentHomesRail homes={sortedHomes} onSelect={setSelectedHome} />
      </div>
      <HomeDetailsDialog home={selectedHome} onOpenChange={() => setSelectedHome(null)} />
    </PageContainer>
  );
}

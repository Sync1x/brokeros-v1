import Link from 'next/link';
import { StatusPill } from '@/components/brokeros/status-pill';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { Listing, Match } from '@/types/brokeros';

function listingStatusVariant(status: Listing['status']) {
  if (status === 'Active') return 'active';
  if (status === 'Coming Soon') return 'warning';
  if (status === 'Under Review') return 'info';
  if (status === 'Private') return 'neutral';
  return 'neutral';
}

interface ListingTableProps {
  listings: Listing[];
  matches: Match[];
}

export function ListingTable({ listings, matches }: ListingTableProps) {
  return (
    <div className='bg-background overflow-hidden border-y'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Profile</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='text-right'>Matched Leads</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((listing) => {
            const matchedLeads = matches.filter((match) => match.listingId === listing.id).length;

            return (
              <TableRow key={listing.id}>
                <TableCell>
                  <Link href={`/listings/${listing.id}`} className='font-medium hover:text-primary'>
                    {listing.address}
                  </Link>
                  <p className='text-muted-foreground mt-1 font-mono text-[0.68rem] uppercase'>
                    {listing.neighborhood}
                  </p>
                </TableCell>
                <TableCell className='font-mono text-xs'>{listing.price}</TableCell>
                <TableCell className='text-xs'>
                  {listing.beds} bd / {listing.baths} ba / {listing.sqft} sqft
                </TableCell>
                <TableCell>
                  <StatusPill variant={listingStatusVariant(listing.status)}>
                    {listing.status}
                  </StatusPill>
                </TableCell>
                <TableCell className='text-right font-mono text-xs'>{matchedLeads}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

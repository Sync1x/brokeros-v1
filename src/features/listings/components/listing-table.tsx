import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { Listing } from '@/types/brokeros';

interface ListingTableProps {
  listings: Listing[];
}

export function ListingTable({ listings }: ListingTableProps) {
  return (
    <div className='bg-card/80 overflow-hidden rounded-2xl border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Profile</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Agent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.map((listing) => (
            <TableRow key={listing.id}>
              <TableCell>
                <Link href={`/listings/${listing.id}`} className='font-medium hover:text-primary'>
                  {listing.address}
                </Link>
                <p className='text-muted-foreground mt-1 text-xs'>{listing.neighborhood}</p>
              </TableCell>
              <TableCell>{listing.price}</TableCell>
              <TableCell>
                {listing.beds} bd / {listing.baths} ba / {listing.sqft} sqft
              </TableCell>
              <TableCell>
                <Badge variant='outline'>{listing.status}</Badge>
              </TableCell>
              <TableCell>{listing.agent}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

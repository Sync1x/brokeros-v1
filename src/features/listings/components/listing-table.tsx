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
    <div className='bg-card/90 overflow-hidden border'>
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
                <Link
                  href={`/listings/${listing.id}`}
                  className='font-mono text-xs font-medium uppercase hover:text-primary'
                >
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
                <Badge variant='outline' className='font-mono text-[0.65rem] uppercase'>
                  {listing.status}
                </Badge>
              </TableCell>
              <TableCell className='text-xs'>{listing.agent}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

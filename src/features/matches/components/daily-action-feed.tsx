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

const dailyActions = [
  {
    id: 'action-001',
    type: 'New match found',
    happened: 'Amelia Hart matches 42 Lispenard Street, PH',
    why: 'Tribeca, budget fit, private inventory, office-ready bedroom.',
    next: 'Send private preview with two showing windows',
    href: '/matches/match-9001',
    intent: 'strong'
  },
  {
    id: 'action-002',
    type: 'Price drop created match',
    happened: '91 Columbia Heights now fits Sofia Bennett’s ceiling',
    why: 'Adjusted price brings the listing into range for an investment buyer.',
    next: 'Add to monthly digest and note rental history',
    href: '/matches/match-9003',
    intent: 'strong'
  },
  {
    id: 'action-003',
    type: 'Review before sending',
    happened: 'Julian Mercer matches 18 Grove Street',
    why: 'High fit, but seller disclosure package is not confirmed.',
    next: 'Review disclosure packet, then send brief',
    href: '/matches/match-9002',
    intent: 'warning'
  },
  {
    id: 'action-004',
    type: 'Follow-up due',
    happened: 'Sofia Bennett has a warm match in Brooklyn Heights',
    why: 'Digest match was sent; investment buyer has not responded.',
    next: 'Send one-line follow-up and ask for timing',
    href: '/matches/match-9003',
    intent: 'warning'
  },
  {
    id: 'action-005',
    type: 'Multiple lead fit',
    happened: '42 Lispenard Street is likely relevant to more than one buyer',
    why: 'Private inventory with broad appeal should be checked against warm leads.',
    next: 'Review lead queue before sending another preview',
    href: '/listings/listing-101',
    intent: 'warning'
  },
  {
    id: 'action-006',
    type: 'Inventory gap',
    happened: 'Marcus Lee has no qualified match',
    why: 'Budget and financing constraints narrow Long Island City inventory.',
    next: 'Broaden search radius or confirm financing ceiling',
    href: '/leads/lead-004',
    intent: 'alert'
  }
];

function intentClass(intent: string) {
  if (intent === 'strong') return 'border-brokeros-success/60 text-brokeros-success';
  if (intent === 'warning') return 'border-brokeros-warning/60 text-brokeros-warning';
  return 'border-brokeros-danger/60 text-brokeros-danger';
}

export function DailyActionFeed() {
  return (
    <div className='bg-background overflow-hidden border-y'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>What Changed</TableHead>
            <TableHead>Why It Matters</TableHead>
            <TableHead>Next Action</TableHead>
            <TableHead className='text-right'>Open</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dailyActions.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className={`font-mono ${intentClass(item.intent)}`}>
                    {item.type}
                  </Badge>
                </div>
                <p className='mt-1 text-sm font-medium'>{item.happened}</p>
              </TableCell>
              <TableCell className='max-w-[360px] text-sm text-muted-foreground'>
                {item.why}
              </TableCell>
              <TableCell className='max-w-[340px] text-sm'>{item.next}</TableCell>
              <TableCell className='text-right font-mono text-xs uppercase'>
                <Link href={item.href} className='text-primary hover:underline'>
                  Open
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

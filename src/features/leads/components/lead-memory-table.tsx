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
import type { Lead } from '@/types/brokeros';

interface LeadMemoryTableProps {
  leads: Lead[];
}

export function LeadMemoryTable({ leads }: LeadMemoryTableProps) {
  return (
    <div className='bg-card/80 overflow-hidden rounded-2xl border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Intent</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead className='text-right'>Last Contact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <Link href={`/leads/${lead.id}`} className='font-medium hover:text-primary'>
                  {lead.name}
                </Link>
                <p className='text-muted-foreground mt-1 text-xs'>{lead.desiredArea}</p>
              </TableCell>
              <TableCell className='max-w-[260px] text-sm'>{lead.intent}</TableCell>
              <TableCell>{lead.budget}</TableCell>
              <TableCell>
                <Badge variant='outline'>{lead.stage}</Badge>
              </TableCell>
              <TableCell>{lead.assignedAgent}</TableCell>
              <TableCell className='text-muted-foreground text-right'>
                {lead.lastContact}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

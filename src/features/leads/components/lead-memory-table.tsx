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
    <div className='bg-background overflow-hidden border-y'>
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
                <Link
                  href={`/leads/${lead.id}`}
                  className='font-mono text-xs font-medium uppercase hover:text-primary'
                >
                  {lead.name}
                </Link>
                <p className='text-muted-foreground mt-1 font-mono text-[0.68rem] uppercase'>
                  {lead.desiredArea}
                </p>
              </TableCell>
              <TableCell className='max-w-[260px] text-xs'>{lead.intent}</TableCell>
              <TableCell className='font-mono text-xs'>{lead.budget}</TableCell>
              <TableCell>
                <Badge variant='outline' className='font-mono text-[0.65rem] uppercase'>
                  {lead.stage}
                </Badge>
              </TableCell>
              <TableCell className='text-xs'>{lead.assignedAgent}</TableCell>
              <TableCell className='text-muted-foreground text-right font-mono text-xs'>
                {lead.lastContact}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

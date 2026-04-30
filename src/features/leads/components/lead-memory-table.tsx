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
import type { Lead, Match } from '@/types/brokeros';

interface LeadMemoryTableProps {
  leads: Lead[];
  matches: Match[];
}

export function LeadMemoryTable({ leads, matches }: LeadMemoryTableProps) {
  return (
    <div className='bg-background overflow-hidden border-y'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Intent</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Neighborhood</TableHead>
            <TableHead className='text-right'>Last Contact</TableHead>
            <TableHead className='text-right'>Matches</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const matchCount = matches.filter((match) => match.leadId === lead.id).length;

            return (
              <TableRow key={lead.id}>
                <TableCell>
                  <Link href={`/leads/${lead.id}`} className='font-medium hover:text-primary'>
                    {lead.name}
                  </Link>
                  <p className='text-muted-foreground mt-1 font-mono text-[0.68rem] uppercase'>
                    {lead.id}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant='outline' className='font-mono text-[0.65rem] uppercase'>
                    {lead.stage}
                  </Badge>
                  <p className='mt-1 text-xs text-muted-foreground'>{lead.intent}</p>
                </TableCell>
                <TableCell className='font-mono text-xs'>{lead.budget}</TableCell>
                <TableCell className='text-xs'>{lead.desiredArea}</TableCell>
                <TableCell className='text-muted-foreground text-right font-mono text-xs'>
                  {lead.lastContact}
                </TableCell>
                <TableCell className='text-right font-mono text-xs'>{matchCount}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

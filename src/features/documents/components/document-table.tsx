import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { BrokerDocument } from '@/types/brokeros';

interface DocumentTableProps {
  documents: BrokerDocument[];
}

export function DocumentTable({ documents }: DocumentTableProps) {
  return (
    <div className='bg-background overflow-hidden border-y'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='text-right'>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell className='font-mono text-xs font-medium uppercase'>
                {document.title}
              </TableCell>
              <TableCell className='text-xs'>{document.client}</TableCell>
              <TableCell className='text-xs'>{document.type}</TableCell>
              <TableCell>
                <Badge variant='outline' className='font-mono text-[0.65rem] uppercase'>
                  {document.status}
                </Badge>
              </TableCell>
              <TableCell className='text-muted-foreground text-right font-mono text-xs'>
                {document.updatedAt}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

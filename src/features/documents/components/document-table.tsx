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
    <div className='bg-card/80 overflow-hidden rounded-2xl border'>
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
              <TableCell className='font-medium'>{document.title}</TableCell>
              <TableCell>{document.client}</TableCell>
              <TableCell>{document.type}</TableCell>
              <TableCell>
                <Badge variant='outline'>{document.status}</Badge>
              </TableCell>
              <TableCell className='text-muted-foreground text-right'>
                {document.updatedAt}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

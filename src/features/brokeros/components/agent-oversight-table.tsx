import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { AgentOversight } from '@/types/brokeros';

interface AgentOversightTableProps {
  agents: AgentOversight[];
}

export function AgentOversightTable({ agents }: AgentOversightTableProps) {
  return (
    <div className='bg-card/80 overflow-hidden rounded-2xl border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent</TableHead>
            <TableHead>Leads</TableHead>
            <TableHead>Listings</TableHead>
            <TableHead>Tasks</TableHead>
            <TableHead>Response</TableHead>
            <TableHead className='text-right'>Pipeline</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell className='font-medium'>{agent.name}</TableCell>
              <TableCell>{agent.activeLeads}</TableCell>
              <TableCell>{agent.listings}</TableCell>
              <TableCell>{agent.openTasks}</TableCell>
              <TableCell>{agent.responseTime}</TableCell>
              <TableCell className='text-right'>{agent.pipeline}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

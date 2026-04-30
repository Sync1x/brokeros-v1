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
    <div className='bg-card/90 overflow-hidden border'>
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
              <TableCell className='font-mono text-xs font-medium uppercase'>
                {agent.name}
              </TableCell>
              <TableCell className='font-mono text-xs tabular-nums'>{agent.activeLeads}</TableCell>
              <TableCell className='font-mono text-xs tabular-nums'>{agent.listings}</TableCell>
              <TableCell className='font-mono text-xs tabular-nums'>{agent.openTasks}</TableCell>
              <TableCell className='font-mono text-xs'>{agent.responseTime}</TableCell>
              <TableCell className='text-right font-mono text-xs'>{agent.pipeline}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

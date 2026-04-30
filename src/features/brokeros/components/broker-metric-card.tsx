import { Icons, type Icon } from '@/components/icons';
import { cn } from '@/lib/utils';

interface BrokerMetricCardProps {
  label: string;
  value: string;
  delta?: string;
  icon?: Icon;
  accent?: boolean;
}

export function BrokerMetricCard({
  label,
  value,
  delta,
  icon: Icon = Icons.trendingUp,
  accent = false
}: BrokerMetricCardProps) {
  return (
    <div
      className={cn(
        'bg-card/90 border p-3 shadow-none',
        accent && 'border-primary/50 bg-primary/10'
      )}
    >
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='text-muted-foreground font-mono text-[0.65rem] font-medium tracking-[0.18em] uppercase'>
            {label}
          </p>
          <p className='mt-2 font-mono text-2xl font-semibold tabular-nums'>{value}</p>
        </div>
        <div className='border-primary/30 text-primary flex size-7 items-center justify-center border bg-transparent'>
          <Icon className='size-3.5' />
        </div>
      </div>
      {delta && <p className='text-muted-foreground mt-3 text-xs leading-5'>{delta}</p>}
    </div>
  );
}

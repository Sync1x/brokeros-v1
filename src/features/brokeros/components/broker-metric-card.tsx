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
        'bg-card/80 rounded-2xl border p-5 shadow-none',
        accent && 'border-primary/35 bg-primary/5'
      )}
    >
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase'>
            {label}
          </p>
          <p className='mt-4 text-3xl font-semibold'>{value}</p>
        </div>
        <div className='border-primary/20 text-primary flex size-9 items-center justify-center rounded-xl border bg-transparent'>
          <Icon className='size-4' />
        </div>
      </div>
      {delta && <p className='text-muted-foreground mt-5 text-sm'>{delta}</p>}
    </div>
  );
}

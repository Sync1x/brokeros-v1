import { cn } from '@/lib/utils';
import type { ActivityItem } from '@/types/brokeros';

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className='bg-card/90 border p-4'>
      <div className='flex flex-col gap-4'>
        {items.map((item) => (
          <div key={item.id} className='flex gap-4'>
            <div
              className={cn(
                'mt-1 size-2 bg-muted-foreground',
                item.tone === 'positive' && 'bg-primary',
                item.tone === 'warning' && 'bg-brokeros-warning'
              )}
            />
            <div className='min-w-0 flex-1'>
              <p className='text-sm'>
                <span className='font-medium'>{item.actor}</span> {item.action}{' '}
                <span className='font-medium'>{item.subject}</span>
              </p>
              <p className='text-muted-foreground mt-1 font-mono text-[0.68rem] uppercase'>
                {item.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

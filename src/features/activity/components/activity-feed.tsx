import { cn } from '@/lib/utils';
import type { ActivityItem } from '@/types/brokeros';

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className='bg-background border-y'>
      <div className='divide-y'>
        {items.map((item) => (
          <div key={item.id} className='flex gap-3 px-2.5 py-2 transition-colors hover:bg-muted/20'>
            <div
              className={cn(
                'mt-1 size-2 bg-muted-foreground',
                item.tone === 'positive' && 'bg-primary',
                item.tone === 'warning' && 'bg-brokeros-warning'
              )}
            />
            <div className='min-w-0 flex-1'>
              <p className='text-xs'>
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

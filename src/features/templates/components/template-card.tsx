import { Badge } from '@/components/ui/badge';
import type { BrokerTemplate } from '@/types/brokeros';

interface TemplateCardProps {
  template: BrokerTemplate;
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <div className='bg-card/80 rounded-2xl border p-5'>
      <div className='flex items-start justify-between gap-4'>
        <h3 className='font-medium'>{template.title}</h3>
        <Badge variant='outline'>{template.category}</Badge>
      </div>
      <p className='text-muted-foreground mt-4 text-sm leading-6'>{template.description}</p>
      <p className='text-muted-foreground mt-5 border-t pt-4 text-xs'>
        Used {template.usageCount} times
      </p>
    </div>
  );
}

import { Badge } from '@/components/ui/badge';
import type { BrokerTemplate } from '@/types/brokeros';

interface TemplateCardProps {
  template: BrokerTemplate;
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <div className='bg-background border-r border-b p-2.5 transition-colors hover:bg-muted/20'>
      <div className='flex items-start justify-between gap-3'>
        <h3 className='font-mono text-xs font-medium uppercase'>{template.title}</h3>
        <Badge variant='outline' className='font-mono text-[0.65rem] uppercase'>
          {template.category}
        </Badge>
      </div>
      <p className='text-muted-foreground mt-2 text-xs leading-5'>{template.description}</p>
      <p className='text-muted-foreground mt-2 border-t pt-2 font-mono text-[0.68rem] uppercase'>
        Used {template.usageCount} times
      </p>
    </div>
  );
}

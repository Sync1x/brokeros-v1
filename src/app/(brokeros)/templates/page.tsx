import PageContainer from '@/components/layout/page-container';
import { brokerTemplates } from '@/constants/brokeros-mock-data';
import { TemplateCard } from '@/features/templates/components/template-card';

export default function TemplatesPage() {
  return (
    <PageContainer
      pageTitle='Templates'
      pageDescription='Reusable language and workflows for high-trust brokerage moments.'
    >
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {brokerTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </PageContainer>
  );
}

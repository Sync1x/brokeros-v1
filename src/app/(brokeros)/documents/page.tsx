import PageContainer from '@/components/layout/page-container';
import { brokerDocuments } from '@/constants/brokeros-mock-data';
import { DocumentTable } from '@/features/documents/components/document-table';

export default function DocumentsPage() {
  return (
    <PageContainer
      pageTitle='Documents'
      pageDescription='Offers, agreements, disclosures, checklists, and deal reports.'
    >
      <DocumentTable documents={brokerDocuments} />
    </PageContainer>
  );
}

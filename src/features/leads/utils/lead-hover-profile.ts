import type { Lead } from '@/types/brokeros';
import type { LeadHoverProfile } from '../components/lead-name-hover-card';

export function brokerLeadHoverProfile(lead: Lead): LeadHoverProfile {
  return {
    name: lead.name,
    eyebrow: 'BrokerOS Lead',
    status: lead.temperature,
    summary: lead.intent,
    details: [
      { label: 'Stage', value: lead.stage },
      { label: 'Budget', value: lead.budget },
      { label: 'Area', value: lead.desiredArea },
      { label: 'Agent', value: lead.assignedAgent },
      { label: 'Contact', value: lead.lastContact },
      { label: 'Email', value: lead.email },
      { label: 'Phone', value: lead.phone }
    ],
    notes: [...lead.preferences, ...lead.notes]
  };
}

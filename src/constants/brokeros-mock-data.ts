import type {
  ActivityItem,
  AgentOversight,
  BrokerDocument,
  BrokerTemplate,
  Lead,
  Listing,
  Match
} from '@/types/brokeros';

export const brokerLeads: Lead[] = [
  {
    id: 'lead-001',
    name: 'Amelia Hart',
    email: 'amelia.hart@example.com',
    phone: '(212) 555-0188',
    stage: 'Touring',
    temperature: 'Hot',
    budget: '$2.4M - $3.1M',
    desiredArea: 'Tribeca, Soho',
    intent: 'Primary residence before summer',
    lastContact: 'Today, 9:20 AM',
    assignedAgent: 'Mara Chen',
    notes: ['Prefers discreet elevator buildings', 'Avoids heavy amenities', 'Needs home office'],
    preferences: ['3+ bedrooms', 'Doorman', 'Loft character', 'Private parking']
  },
  {
    id: 'lead-002',
    name: 'Julian Mercer',
    email: 'julian.mercer@example.com',
    phone: '(917) 555-0142',
    stage: 'Offer',
    temperature: 'Hot',
    budget: '$4.8M ceiling',
    desiredArea: 'West Village',
    intent: 'Relocation from London',
    lastContact: 'Yesterday, 5:44 PM',
    assignedAgent: 'Noah Vale',
    notes: ['Attorney is responsive', 'Cash proof on file', 'Sensitive to board timelines'],
    preferences: ['Townhouse', 'Garden', 'Quiet block', 'Move-in ready']
  },
  {
    id: 'lead-003',
    name: 'Sofia Bennett',
    email: 'sofia.bennett@example.com',
    phone: '(646) 555-0171',
    stage: 'Nurture',
    temperature: 'Warm',
    budget: '$1.6M - $1.9M',
    desiredArea: 'Brooklyn Heights',
    intent: 'Investment pied-a-terre',
    lastContact: 'Apr 27, 2026',
    assignedAgent: 'Mara Chen',
    notes: ['Wants monthly digest only', 'Prefers pre-war inventory'],
    preferences: ['Low monthlies', 'Views', 'Elevator', 'Strong rental history']
  },
  {
    id: 'lead-004',
    name: 'Marcus Lee',
    email: 'marcus.lee@example.com',
    phone: '(310) 555-0126',
    stage: 'New',
    temperature: 'Cool',
    budget: '$900K - $1.2M',
    desiredArea: 'Long Island City',
    intent: 'First-time buyer',
    lastContact: 'Apr 25, 2026',
    assignedAgent: 'Elena Ruiz',
    notes: ['Needs financing education', 'Available weekends'],
    preferences: ['New development', 'Water view', 'Gym', 'Transit access']
  }
];

export const brokerListings: Listing[] = [
  {
    id: 'listing-101',
    address: '42 Lispenard Street, PH',
    neighborhood: 'Tribeca',
    price: '$2,875,000',
    beds: 3,
    baths: 2.5,
    sqft: '2,140',
    status: 'Private',
    owner: 'Vesper Holdings',
    agent: 'Mara Chen',
    signal: 'Quiet pre-market opportunity'
  },
  {
    id: 'listing-102',
    address: '18 Grove Street',
    neighborhood: 'West Village',
    price: '$4,650,000',
    beds: 4,
    baths: 3,
    sqft: '2,820',
    status: 'Coming Soon',
    owner: 'L. Fairchild',
    agent: 'Noah Vale',
    signal: 'Seller wants qualified private showings'
  },
  {
    id: 'listing-103',
    address: '91 Columbia Heights, 7B',
    neighborhood: 'Brooklyn Heights',
    price: '$1,725,000',
    beds: 2,
    baths: 2,
    sqft: '1,320',
    status: 'Active',
    owner: 'Aster Group',
    agent: 'Elena Ruiz',
    signal: 'Price aligned with lead digest criteria'
  },
  {
    id: 'listing-104',
    address: '5-19 Borden Avenue, 12C',
    neighborhood: 'Long Island City',
    price: '$1,095,000',
    beds: 2,
    baths: 2,
    sqft: '1,080',
    status: 'Under Review',
    owner: 'Northline Partners',
    agent: 'Elena Ruiz',
    signal: 'Financing terms under review'
  }
];

export const brokerMatches: Match[] = [
  {
    id: 'match-9001',
    leadId: 'lead-001',
    listingId: 'listing-101',
    score: 94,
    rationale: 'Tribeca loft, discreet building profile, office-ready third bedroom.',
    status: 'Ready',
    nextStep: 'Send private preview with two showing windows'
  },
  {
    id: 'match-9002',
    leadId: 'lead-002',
    listingId: 'listing-102',
    score: 91,
    rationale: 'Townhouse scale, garden, quiet West Village block, below stated ceiling.',
    status: 'Review',
    nextStep: 'Confirm seller disclosure package before sending'
  },
  {
    id: 'match-9003',
    leadId: 'lead-003',
    listingId: 'listing-103',
    score: 86,
    rationale: 'Pre-war feel, view corridor, and rental history fit investment thesis.',
    status: 'Sent',
    nextStep: 'Follow up after monthly digest'
  }
];

export const brokerDocuments: BrokerDocument[] = [
  {
    id: 'doc-701',
    title: 'Private Showing Agreement',
    client: 'Amelia Hart',
    type: 'Agreement',
    status: 'Ready',
    updatedAt: 'Today, 8:12 AM'
  },
  {
    id: 'doc-702',
    title: 'West Village Offer Summary',
    client: 'Julian Mercer',
    type: 'Offer',
    status: 'Needs Review',
    updatedAt: 'Yesterday, 6:03 PM'
  },
  {
    id: 'doc-703',
    title: 'Brooklyn Heights Rental Analysis',
    client: 'Sofia Bennett',
    type: 'Report',
    status: 'Draft',
    updatedAt: 'Apr 27, 2026'
  }
];

export const brokerTemplates: BrokerTemplate[] = [
  {
    id: 'template-01',
    title: 'Private Preview Email',
    category: 'Email',
    description: 'A restrained introduction for off-market inventory and qualified clients.',
    usageCount: 38
  },
  {
    id: 'template-02',
    title: 'Post-Tour Memory Note',
    category: 'Workflow',
    description: 'Captures objections, emotional cues, decision makers, and next action.',
    usageCount: 24
  },
  {
    id: 'template-03',
    title: 'Offer Readiness Checklist',
    category: 'Document',
    description: 'Proof of funds, attorney details, contingencies, and board timing.',
    usageCount: 19
  }
];

export const brokerActivity: ActivityItem[] = [
  {
    id: 'act-001',
    actor: 'Mara Chen',
    action: 'logged tour feedback for',
    subject: 'Amelia Hart',
    time: '12 minutes ago',
    tone: 'positive'
  },
  {
    id: 'act-002',
    actor: 'Noah Vale',
    action: 'flagged disclosure review on',
    subject: '18 Grove Street',
    time: '48 minutes ago',
    tone: 'warning'
  },
  {
    id: 'act-003',
    actor: 'BrokerOS',
    action: 'prepared a match brief for',
    subject: '42 Lispenard Street, PH',
    time: '1 hour ago',
    tone: 'neutral'
  },
  {
    id: 'act-004',
    actor: 'Elena Ruiz',
    action: 'updated financing status for',
    subject: 'Marcus Lee',
    time: 'Yesterday',
    tone: 'neutral'
  }
];

export const agentOversight: AgentOversight[] = [
  {
    id: 'agent-1',
    name: 'Mara Chen',
    activeLeads: 18,
    listings: 7,
    openTasks: 5,
    responseTime: '14m',
    pipeline: '$18.4M'
  },
  {
    id: 'agent-2',
    name: 'Noah Vale',
    activeLeads: 11,
    listings: 5,
    openTasks: 3,
    responseTime: '21m',
    pipeline: '$26.1M'
  },
  {
    id: 'agent-3',
    name: 'Elena Ruiz',
    activeLeads: 23,
    listings: 9,
    openTasks: 8,
    responseTime: '31m',
    pipeline: '$12.7M'
  }
];

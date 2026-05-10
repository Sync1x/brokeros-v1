export type CommandActionType =
  | 'new_lead'
  | 'follow_up'
  | 'match_ready'
  | 'showing_prep'
  | 'deal_blocker'
  | 'seller_launch'
  | 'offer_task';

export type CommandActionPriority = 'critical' | 'high' | 'normal';

export type CommandActionState = 'active' | 'done' | 'snoozed';

export interface CommandAction {
  id: string;
  type: CommandActionType;
  priority: CommandActionPriority;
  title: string;
  personName: string;
  leadId?: string;
  listingId?: string;
  matchId?: string;
  dueAt?: string;
  whyNow: string;
  nextAction: string;
  primaryCtaLabel: string;
  primaryHref: string;
  secondaryCtaLabel?: string;
  secondaryHref?: string;
  valueScore: number;
  decayScore: number;
  createdAt: string;
  sourceFacts: string[];
  state: CommandActionState;
  snoozedUntil?: string;
  dismissReason?: string;
}

export interface CommandPace {
  contactsToday: number;
  contactsThisWeek: number;
  label: string;
}

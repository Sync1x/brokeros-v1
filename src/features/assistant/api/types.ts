export type AssistantActionIntent =
  | 'search'
  | 'create_lead'
  | 'update_record'
  | 'draft'
  | 'general';

export type AssistantRequest = {
  prompt: string;
  route?: string;
};

export type AssistantResponse = {
  message: string;
  intent: AssistantActionIntent;
  actions: string[];
};

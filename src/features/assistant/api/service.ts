import type { AssistantRequest, AssistantResponse } from './types';

export async function runAssistantPrompt(request: AssistantRequest): Promise<AssistantResponse> {
  const prompt = request.prompt.toLowerCase();
  const intent = prompt.includes('lead') ? 'create_lead' : 'general';

  return {
    intent,
    actions: intent === 'create_lead' ? ['prepare_lead_creation'] : [],
    message:
      'I am ready for the AI API connection. When it is wired in, this assistant can search BrokerOS, draft updates, and execute actions like adding leads from this same surface.'
  };
}

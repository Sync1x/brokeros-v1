import { create } from 'zustand';
import { runAssistantPrompt } from '../api/service';

export type AssistantMessageRole = 'user' | 'assistant';
export type AssistantStatus = 'idle' | 'thinking' | 'responding';

export type AssistantMessage = {
  id: string;
  role: AssistantMessageRole;
  content: string;
};

type AssistantState = {
  isPanelOpen: boolean;
  isMinimized: boolean;
  status: AssistantStatus;
  messages: AssistantMessage[];
  openPanel: () => void;
  minimizePanel: () => void;
  closePanel: () => void;
  submitPrompt: (prompt: string) => Promise<void>;
};

const createMessageId = () => `assistant-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const useAssistantStore = create<AssistantState>()((set) => ({
  isPanelOpen: false,
  isMinimized: false,
  status: 'idle',
  messages: [],

  openPanel: () =>
    set({
      isPanelOpen: true,
      isMinimized: false
    }),

  minimizePanel: () =>
    set({
      isPanelOpen: false,
      isMinimized: true
    }),

  closePanel: () =>
    set({
      isPanelOpen: false,
      isMinimized: false,
      status: 'idle',
      messages: []
    }),

  submitPrompt: async (prompt) => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      return;
    }

    set((state) => ({
      isPanelOpen: true,
      isMinimized: false,
      status: 'thinking',
      messages: [
        ...state.messages,
        {
          id: createMessageId(),
          role: 'user',
          content: trimmedPrompt
        }
      ]
    }));

    const response = await runAssistantPrompt({ prompt: trimmedPrompt });

    set((state) => ({
      status: 'responding',
      messages: [
        ...state.messages,
        {
          id: createMessageId(),
          role: 'assistant',
          content: response.message
        }
      ]
    }));
  }
}));

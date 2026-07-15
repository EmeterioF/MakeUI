import { create } from 'zustand';
import { ComponentNode } from './componentNodeTypes';
import { useComponentNodeStore } from './componentNodeStore';
import { generateLayoutSuggestion } from '@/services/aiLayoutService';

interface AiSuggestionState {
  aiSuggestions: ComponentNode[] | null;
  aiOriginalTree: ComponentNode[] | null;
  aiLoading: boolean;
  aiError: string | null;
  showAiPreview: boolean;

  fetchSuggestions: () => Promise<void>;
  applySuggestions: () => void;
  discardSuggestions: () => void;
  togglePreview: () => void;
}

export const useAiSuggestionStore = create<AiSuggestionState>((set, get) => ({
  aiSuggestions: null,
  aiOriginalTree: null,
  aiLoading: false,
  aiError: null,
  showAiPreview: false,

  fetchSuggestions: async () => {
    const { componentTree, canvasConfig } = useComponentNodeStore.getState();

    if (!componentTree || componentTree.length === 0) {
      set({ aiError: 'No components to enhance. Add some components first.' });
      return;
    }

    set({ aiLoading: true, aiError: null });

    try {
      const result = await generateLayoutSuggestion(componentTree, canvasConfig);

      set({
        aiSuggestions: result.componentTree,
        aiOriginalTree: componentTree,
        showAiPreview: true,
        aiLoading: false,
      });
    } catch (error) {
      set({
        aiError: error instanceof Error ? error.message : 'AI enhancement failed',
        aiLoading: false,
      });
    }
  },

  applySuggestions: () => {
    const { aiSuggestions } = get();
    if (!aiSuggestions) return;

    useComponentNodeStore.getState().replaceTree(aiSuggestions);

    set({
      aiSuggestions: null,
      aiOriginalTree: null,
      showAiPreview: false,
      aiError: null,
    });
  },

  discardSuggestions: () => {
    set({
      aiSuggestions: null,
      aiOriginalTree: null,
      showAiPreview: false,
      aiError: null,
    });
  },

  togglePreview: () => {
    set((state) => ({ showAiPreview: !state.showAiPreview }));
  },
}));

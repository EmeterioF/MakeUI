import { create } from 'zustand';
import { ComponentNode } from './componentNodeTypes';
import { useComponentNodeStore } from './componentNodeStore';
import { generateLayoutSuggestions } from '@/services/aiLayoutService';

interface AiSuggestion {
  componentTree: ComponentNode[];
  improvements: string[];
  label: string;
}

interface AiSuggestionState {
  aiSuggestions: AiSuggestion[] | null;
  aiOriginalTree: ComponentNode[] | null;
  selectedIndex: number;
  aiLoading: boolean;
  aiError: string | null;
  showAiPreview: boolean;

  fetchSuggestions: () => Promise<void>;
  selectSuggestion: (index: number) => void;
  applySuggestions: () => void;
  discardSuggestions: () => void;
  togglePreview: () => void;
}

export const useAiSuggestionStore = create<AiSuggestionState>((set, get) => ({
  aiSuggestions: null,
  aiOriginalTree: null,
  selectedIndex: 0,
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
      const result = await generateLayoutSuggestions(componentTree, canvasConfig);

      set({
        aiSuggestions: result.suggestions,
        aiOriginalTree: componentTree,
        selectedIndex: 0,
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

  selectSuggestion: (index: number) => {
    set({ selectedIndex: index });
  },

  applySuggestions: () => {
    const { aiSuggestions, selectedIndex } = get();
    if (!aiSuggestions || selectedIndex < 1 || !aiSuggestions[selectedIndex - 1]) return;

    useComponentNodeStore.getState().replaceTree(aiSuggestions[selectedIndex - 1].componentTree);

    set({
      aiSuggestions: null,
      aiOriginalTree: null,
      selectedIndex: 0,
      showAiPreview: false,
      aiError: null,
    });
  },

  discardSuggestions: () => {
    set({
      aiSuggestions: null,
      aiOriginalTree: null,
      selectedIndex: 0,
      showAiPreview: false,
      aiError: null,
    });
  },

  togglePreview: () => {
    set((state) => ({ showAiPreview: !state.showAiPreview }));
  },
}));

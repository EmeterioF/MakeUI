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
  /** True right after an apply, while a one-level undo is still available. */
  undoAvailable: boolean;

  fetchSuggestions: () => Promise<void>;
  selectSuggestion: (index: number) => void;
  applySuggestions: () => void;
  discardSuggestions: () => void;
  togglePreview: () => void;
  /** Restores the tree from before the last apply. Session-only, single level. */
  undoApply: () => void;
  dismissUndo: () => void;
}

export const useAiSuggestionStore = create<AiSuggestionState>((set, get) => ({
  aiSuggestions: null,
  aiOriginalTree: null,
  selectedIndex: 0,
  aiLoading: false,
  aiError: null,
  showAiPreview: false,
  undoAvailable: false,

  fetchSuggestions: async () => {
    const { componentTree, canvasConfig } = useComponentNodeStore.getState();
    console.log("hit")
    if (!componentTree || componentTree.length === 0) {
      set({ aiError: 'No components to enhance. Add some components first.' });
      return;
    }

    set({ aiLoading: true, aiError: null, undoAvailable: false });

    try {
      const result = await generateLayoutSuggestions(componentTree, canvasConfig);
      console.log('[AiStore] result keys:', Object.keys(result), 'suggestions count:', result.suggestions?.length)

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
      // Keep aiOriginalTree so the apply can be undone below.
      selectedIndex: 0,
      showAiPreview: false,
      aiError: null,
      undoAvailable: true,
    });
  },

  undoApply: () => {
    const { aiOriginalTree } = get();
    if (!aiOriginalTree) return;

    useComponentNodeStore.getState().replaceTree(aiOriginalTree);

    set({
      aiOriginalTree: null,
      undoAvailable: false,
    });
  },

  dismissUndo: () => {
    set({ undoAvailable: false, aiOriginalTree: null });
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

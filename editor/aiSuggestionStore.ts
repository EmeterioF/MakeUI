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

function restoreOriginalColors(
  originalTree: ComponentNode[],
  suggestedTree: ComponentNode[],
  label: string,
): ComponentNode[] {
  if (label === 'Visual Polish' || label === 'Balanced') {
    return suggestedTree;
  }

  const idMap = new Map<string, ComponentNode>();
  const buildIdMap = (nodes: ComponentNode[]) => {
    for (const node of nodes) {
      idMap.set(node.id, node);
      if (node.children) buildIdMap(node.children);
    }
  };
  buildIdMap(originalTree);

  const restore = (nodes: ComponentNode[]): ComponentNode[] =>
    nodes.map((node) => {
      const original = idMap.get(node.id);
      if (!original) return node;
      return {
        ...node,
        style: {
          ...node.style,
          backgroundColor: original.style.backgroundColor,
          color: original.style.color,
          borderColor: original.style.borderColor,
        },
        children: node.children ? restore(node.children) : undefined,
      };
    });

  return restore(suggestedTree);
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
    console.log("hit")
    if (!componentTree || componentTree.length === 0) {
      set({ aiError: 'No components to enhance. Add some components first.' });
      return;
    }

    set({ aiLoading: true, aiError: null });

    try {
      const result = await generateLayoutSuggestions(componentTree, canvasConfig);
      console.log('[AiStore] result keys:', Object.keys(result), 'suggestions count:', result.suggestions?.length)

      const processedSuggestions = result.suggestions.map((s: AiSuggestion) => ({
        ...s,
        componentTree: restoreOriginalColors(componentTree, s.componentTree, s.label),
      }));

      set({
        aiSuggestions: processedSuggestions,
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

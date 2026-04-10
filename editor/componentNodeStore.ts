import { create } from 'zustand'

export type ComponentType = 'View' | 'Text' | 'Button' | 'Image';

export interface ComponentNode {
    id: string;
    type: ComponentType;
    x: number;
    y: number;
    style: {
        width?: number | string;
        height?: number | string;
        flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
        padding?: number;
        borderRadius?: number;
        borderWidth?: number;
        borderColor?: string;
        backgroundColor?: string;
        resizeMode?: 'center' | 'contain' | 'stretch' | 'repeat' | 'cover'
        fontSize?: number;
        fontWeight?: 'normal' | 'bold';
        color?: string;
        textAlign?: 'left' | 'center' | 'right';
    };
    content?: string;
    children?: ComponentNode[];
}

interface CanvasState {
    componentTree: ComponentNode[];
    selectedID: string | null;

    selectNode: (id: string) => void;
    addNode: (node: Omit<ComponentNode, 'id'>) => void;
    deleteNode: (id: string| null) => void;
    editNode: (id: string, updates: Partial<Omit<ComponentNode, 'id'>>) => void;
}

const generateId = () => Math.random().toString(36).slice(2, 9);

// ─── Simple recursive helper for all operations ────────────────────────────────
const traverseTree = (
    nodes: ComponentNode[], // the component tree to be passed
    callback: (node: ComponentNode) => ComponentNode | null //crud operations that acts as a recursive function to read child
): ComponentNode[] => {
    const result: ComponentNode[] = [];

    for (const node of nodes) {
        const updated = callback(node);

        if (updated === null) continue; // Skip deleted nodes

        const processed: ComponentNode = {
            ...updated,
            children: updated.children ? traverseTree(updated.children, callback) : updated.children,
        };

        result.push(processed);
    }

    return result;
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useComponentNodeStore = create<CanvasState>((set, get) => ({
    componentTree: [],
    selectedID: null,

    selectNode: (id) => {
        set({ selectedID: id });
    },

    addNode: (node) => {
        const { selectedID, componentTree } = get();
        const newNode: ComponentNode = { ...node, id: generateId() };

        if (!selectedID) {
            // Add to root
            set({ componentTree: [...componentTree, newNode] });
            return;
        }

        // Add as child to selected node
        set({
            componentTree: traverseTree(componentTree, (n) => {
                if (n.id === selectedID) {
                    return {
                        ...n,
                        children: [...(n.children || []), newNode],
                    };
                }
                return n;
            }),
        });
    },

    deleteNode: (id) => {
        set(state => ({
            componentTree: traverseTree(state.componentTree, (node) =>
                node.id === id ? null : node // Return null to delete
            ),
            selectedID: state.selectedID === id ? null : state.selectedID,
        }));
    },

    editNode: (id, updates) => {
        set(state => ({
            componentTree: traverseTree(state.componentTree, (node) =>
                node.id === id ? { ...node, ...updates } : node
            ),
        }));
    },
}));
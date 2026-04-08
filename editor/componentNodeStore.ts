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
    selectedNode : ComponentNode | null

    addNode: (componentNode: Omit<ComponentNode, 'id'>) => void;
    deleteNode: (id: string | null) => void;
    editNode: (id: string | null, edits: Partial<Omit<ComponentNode, 'id'>>) => void;
}

const generateId = () => Math.random().toString(36).slice(2, 9);

// ─── Recursive helpers ────────────────────────────────────────────────────────

const addChildRecursive = (
    nodes: ComponentNode[],
    parentId: string,
    newNode: ComponentNode
): ComponentNode[] =>
    nodes.map(node => {
        if (node.id === parentId) {
            return {
                ...node,
                children: [...(node.children ?? []), newNode],
            };
        }
        if (node.children?.length) {
            return {
                ...node,
                children: addChildRecursive(node.children, parentId, newNode),
            };
        }
        return node;
    });

const deleteNodeRecursive = (
    nodes: ComponentNode[],
    id: string
): ComponentNode[] =>
    nodes
        .filter(node => node.id !== id)
        .map(node => ({
            ...node,
            children: node.children
                ? deleteNodeRecursive(node.children, id)
                : undefined,
        }));

const editNodeRecursive = (
    nodes: ComponentNode[],
    id: string,
    edits: Partial<Omit<ComponentNode, 'id'>>
): ComponentNode[] =>
    nodes.map(node => {
        if (node.id === id) {
            return {
                ...node,
                ...edits,
                // Deep-merge style so callers can patch a single style prop
                style: edits.style
                    ? { ...node.style, ...edits.style }
                    : node.style,
                // Keep children untouched unless explicitly passed in edits
                children: edits.children ?? node.children,
            };
        }
        if (node.children?.length) {
            return {
                ...node,
                children: editNodeRecursive(node.children, id, edits),
            };
        }
        return node;
    });

// ─── Store ────────────────────────────────────────────────────────────────────

export const useComponentNodeStore = create<CanvasState>((set, get) => ({
    componentTree: [],
    selectedID: null,
    selectedNode: null,

    selectNode: (id) => {
        set(state => ({
            selectedID: state.selectedID === id ? null : id,
        }))

        const { selectedID, componentTree} = get();
        const selectedNode:any = componentTree.filter( (component) => component.id === selectedID)

        set({ selectedNode: selectedNode })
    },



    addNode: (componentNode) => {
        const { selectedID } = get();
        const newNode: ComponentNode = { ...componentNode, id: generateId() };

        if (selectedID) {
            // Attach as a child of the selected node
            set(state => ({
                componentTree: addChildRecursive(
                    state.componentTree,
                    selectedID,
                    newNode
                ),
            }));
        } else {
            // No selection → add to the root level
            set(state => ({
                componentTree: [...state.componentTree, newNode],
            }));
        }
    },

    deleteNode: (id) => {
        if (!id) return;

        set(state => ({
            componentTree: deleteNodeRecursive(state.componentTree, id),
            // Deselect if the deleted node was selected
            selectedID: state.selectedID === id ? null : state.selectedID,
        }));
    },

    editNode: (id, edits) => {
        if (!id) return;

        set(state => ({
            componentTree: editNodeRecursive(state.componentTree, id, edits),
        }));
    },
}));
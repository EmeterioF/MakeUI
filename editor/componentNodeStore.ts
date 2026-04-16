import { create } from 'zustand';

export type ComponentType = 'View' | 'Text' | 'Button' | 'Image';
export type PositionMode = 'absolute' | 'flow';
export type LayoutMode = 'absolute' | 'flex';

export interface ComponentNode {
    id: string;
    type: ComponentType;
    x: number;
    y: number;
    positionMode: PositionMode;
    layoutMode?: LayoutMode;
    style: {
        width?: number | string;
        height?: number | string;
        justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
        alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
        alignSelf?: 'auto' | 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
        alignContent?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'space-between' | 'space-around';
        flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
        flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
        flex?: number;
        flexGrow?: number;
        flexShrink?: number;
        flexBasis?: number | string;
        gap?: number;
        rowGap?: number;
        columnGap?: number;
        padding?: number;
        borderRadius?: number;
        borderWidth?: number;
        borderColor?: string;
        backgroundColor?: string;
        resizeMode?: 'center' | 'contain' | 'stretch' | 'repeat' | 'cover';
        fontSize?: number;
        fontWeight?: 'normal' | 'bold';
        color?: string;
        textAlign?: 'left' | 'center' | 'right';
    };
    content?: string;
    children?: ComponentNode[];
}

interface LayoutRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface CanvasState {
    componentTree: ComponentNode[];
    selectedID: string | null;
    canvasPositionMode: PositionMode;
    canvasFlexStyle: {
        flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
        justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
        alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
        alignContent?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'space-between' | 'space-around';
        flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
        gap?: number;
        rowGap?: number;
        columnGap?: number;
    };
    dropTargets: Record<string, LayoutRect>;
    activeDropTargetID: string | null;
    selectNode: (id: string | null) => void;
    setCanvasPositionMode: (mode: PositionMode) => void;
    setCanvasFlexStyle: (updates: Partial<CanvasState['canvasFlexStyle']>) => void;
    addNode: (node: Omit<ComponentNode, 'id'>) => void;
    deleteNode: (id: string | null) => void;
    editNode: (id: string, updates: Partial<Omit<ComponentNode, 'id'>>) => void;
    updateNodePosition: (id: string, x: number, y: number) => void;
    registerDropTarget: (id: string, rect: LayoutRect) => void;
    unregisterDropTarget: (id: string) => void;
    setActiveDropTarget: (id: string | null) => void;
    moveNodeToParent: (
        id: string,
        parentID: string | null,
        x: number,
        y: number,
        positionMode?: PositionMode
    ) => void;
}

const generateId = () => Math.random().toString(36).slice(2, 9);

export const findNode = (nodes: ComponentNode[], id: string | null): ComponentNode | null => {
    if (!id) return null;

    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children?.length) {
            const found = findNode(node.children, id);
            if (found) return found;
        }
    }
    return null;
};

export const findParentId = (
    nodes: ComponentNode[],
    childID: string,
    parentID: string | null = null
): string | null => {
    for (const node of nodes) {
        if (node.id === childID) return parentID;
        if (node.children?.length) {
            const found = findParentId(node.children, childID, node.id);
            if (found !== null || !!findNode(node.children, childID)) return found;
        }
    }
    return null;
};

export const isDescendant = (
    nodes: ComponentNode[],
    ancestorID: string,
    possibleDescendantID: string
): boolean => {
    const ancestor = findNode(nodes, ancestorID);
    if (!ancestor?.children?.length) return false;
    return !!findNode(ancestor.children, possibleDescendantID);
};

const traverseTree = (
    nodes: ComponentNode[],
    callback: (node: ComponentNode) => ComponentNode | null
): ComponentNode[] => {
    const result: ComponentNode[] = [];

    for (const node of nodes) {
        const updated = callback(node);
        if (updated === null) continue;

        result.push({
            ...updated,
            children: updated.children ? traverseTree(updated.children, callback) : updated.children,
        });
    }

    return result;
};

const extractNode = (
    nodes: ComponentNode[],
    id: string,
    parentId: string | null = null
): { tree: ComponentNode[]; extracted: ComponentNode | null; sourceParentId: string | null } => {
    const result: ComponentNode[] = [];
    let extracted: ComponentNode | null = null;
    let sourceParentId: string | null = null;

    for (const node of nodes) {
        if (node.id === id) {
            extracted = node;
            sourceParentId = parentId;
            continue;
        }

        if (node.children?.length) {
            const childResult = extractNode(node.children, id, node.id);
            if (childResult.extracted) {
                extracted = childResult.extracted;
                sourceParentId = childResult.sourceParentId;
                result.push({
                    ...node,
                    children: childResult.tree,
                });
                continue;
            }
        }

        result.push(node);
    }

    return { tree: result, extracted, sourceParentId };
};

const insertNodeAsChild = (
    nodes: ComponentNode[],
    parentID: string,
    child: ComponentNode
): ComponentNode[] =>
    traverseTree(nodes, (node) => {
        if (node.id !== parentID) return node;
        return {
            ...node,
            children: [...(node.children || []), child],
        };
    });

export const useComponentNodeStore = create<CanvasState>((set, get) => ({
    componentTree: [],
    selectedID: null,
    canvasPositionMode: 'absolute',
    canvasFlexStyle: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexWrap: 'nowrap',
    },
    dropTargets: {},
    activeDropTargetID: null,

    selectNode: (id) => {
        set({ selectedID: id });
    },

    setCanvasPositionMode: (mode) => {
        set({ canvasPositionMode: mode });
    },

    setCanvasFlexStyle: (updates) => {
        set((state) => ({
            canvasFlexStyle: {
                ...state.canvasFlexStyle,
                ...updates,
            },
        }));
    },

    addNode: (node) => {
        const { selectedID, componentTree } = get();
        const newNode: ComponentNode = { ...node, id: generateId() };

        if (!selectedID) {
            set({ componentTree: [...componentTree, newNode] });
            return;
        }

        set({
            componentTree: traverseTree(componentTree, (n) => {
                if (n.id !== selectedID) return n;
                if (n.type !== 'View') return n;
                const childNode: ComponentNode =
                    n.layoutMode === 'flex'
                        ? { ...newNode, positionMode: 'flow', x: 0, y: 0 }
                        : newNode;
                return {
                    ...n,
                    children: [...(n.children || []), childNode],
                };
            }),
        });
    },

    deleteNode: (id) => {
        set((state) => ({
            componentTree: traverseTree(state.componentTree, (node) => (node.id === id ? null : node)),
            selectedID: state.selectedID === id ? null : state.selectedID,
        }));
    },

    editNode: (id, updates) => {
        set((state) => ({
            componentTree: traverseTree(state.componentTree, (node) => {
                if (node.id !== id) return node;
                const nextLayoutMode = (updates as Partial<ComponentNode>).layoutMode;
                const shouldConvertChildrenToFlow = node.type === 'View' && nextLayoutMode === 'flex';

                const nextChildren = shouldConvertChildrenToFlow
                    ? (node.children || []).map((child) => ({
                          ...child,
                          positionMode: 'flow' as const,
                          x: 0,
                          y: 0,
                      }))
                    : node.children;

                return {
                    ...node,
                    ...updates,
                    children: nextChildren,
                    style: {
                        ...node.style,
                        ...(updates as any).style,
                    },
                };
            }),
        }));
    },

    updateNodePosition: (id, x, y) => {
        set((state) => ({
            componentTree: traverseTree(state.componentTree, (node) => {
                if (node.id !== id) return node;
                return {
                    ...node,
                    x,
                    y,
                };
            }),
        }));
    },

    registerDropTarget: (id, rect) => {
        set((state) => ({
            dropTargets: {
                ...state.dropTargets,
                [id]: rect,
            },
        }));
    },

    unregisterDropTarget: (id) => {
        set((state) => {
            const next = { ...state.dropTargets };
            delete next[id];

            return {
                dropTargets: next,
                activeDropTargetID: state.activeDropTargetID === id ? null : state.activeDropTargetID,
            };
        });
    },

    setActiveDropTarget: (id) => {
        set({ activeDropTargetID: id });
    },

    moveNodeToParent: (id, parentID, x, y, positionMode) => {
        set((state) => {
            if (id === parentID) return {};

            const movingNode = findNode(state.componentTree, id);
            if (!movingNode) return {};

            if (parentID) {
                const parentNode = findNode(state.componentTree, parentID);
                if (!parentNode || parentNode.type !== 'View') return {};
                if (isDescendant(state.componentTree, id, parentID)) return {};
            }

            const { tree, extracted } = extractNode(state.componentTree, id);
            if (!extracted) return {};

            const movedNode: ComponentNode = {
                ...extracted,
                x,
                y,
                positionMode: positionMode ?? extracted.positionMode,
            };

            const nextTree = parentID
                ? insertNodeAsChild(tree, parentID, movedNode)
                : [...tree, movedNode];

            return {
                componentTree: nextTree,
                selectedID: id,
                activeDropTargetID: null,
            };
        });
    },
}));

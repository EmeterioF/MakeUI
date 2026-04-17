import { create } from 'zustand';

export type ComponentType = 'View' | 'Text' | 'Button' | 'Image';
export type LayoutMode = 'absolute' | 'flex';

export interface ComponentStyle {
    width?: number | string;
    height?: number | string;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    flex?: number;
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: number | string;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    flexWrap?: 'wrap' | 'nowrap';
    gap?: number;
    rowGap?: number;
    columnGap?: number;
    margin?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    padding?: number;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    backgroundColor?: string;
    resizeMode?: 'center' | 'contain' | 'stretch' | 'repeat' | 'cover';
    fontSize?: number;
    fontWeight?: 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    color?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    layoutMode?: LayoutMode;
}

export interface ComponentNode {
    id: string;
    type: ComponentType;
    x: number;
    y: number;
    style: ComponentStyle;
    content?: string;
    children?: ComponentNode[];
}

export interface CanvasConfig {
    layoutMode: LayoutMode;
    style: {
        flexDirection: 'row' | 'column';
        justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
        alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch';
        flexWrap: 'nowrap' | 'wrap';
        gap?: number;
        padding?: number;
        backgroundColor: string;
    };
}

interface CanvasState {
    componentTree: ComponentNode[];
    selectedID: string | null;
    hoveredParentID: string | null;
    layoutBounds: Record<string, Rect>;
    canvasConfig: CanvasConfig;

    selectNode: (id: string | null) => void;
    selectParentNode: (id: string) => void;
    addNode: (node: Omit<ComponentNode, 'id'>) => void;
    deleteNode: (id: string | null) => void;
    editNode: (id: string, updates: Partial<Omit<ComponentNode, 'id'>>) => void;
    moveNode: (id: string, x: number, y: number) => void;
    reorderNode: (id: string, delta: -1 | 1) => boolean;
    updateNodeLayout: (id: string, rect: Rect) => void;
    previewDropTarget: (id: string, pageX: number, pageY: number) => string | null;
    clearDropTarget: () => void;
    dropNodeIntoParent: (id: string, parentId: string, dx: number, dy: number) => boolean;
    updateCanvasConfig: (updates: { layoutMode?: LayoutMode; style?: Partial<CanvasConfig['style']> }) => void;
}

const generateId = () => Math.random().toString(36).slice(2, 9);

type Rect = { x: number; y: number; width: number; height: number };

const defaultCanvasConfig: CanvasConfig = {
    layoutMode: 'flex',
    style: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        flexWrap: 'nowrap',
        backgroundColor: '#ffffff',
    },
};

const getNumericDimension = (value: number | string | undefined, fallback: number): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    return fallback;
};

const getNodeRect = (node: ComponentNode, offsetX = 0, offsetY = 0): Rect => ({
    x: offsetX + node.x,
    y: offsetY + node.y,
    width: getNumericDimension(node.style.width, node.type === 'Text' ? 100 : 120),
    height: getNumericDimension(node.style.height, 80),
});

const intersects = (a: Rect, b: Rect): boolean =>
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;

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

const updateTreeById = (
    nodes: ComponentNode[],
    id: string,
    updater: (node: ComponentNode) => ComponentNode
): [ComponentNode[], boolean] => {
    let changed = false;

    const nextNodes = nodes.map((node) => {
        if (node.id === id) {
            const updatedNode = updater(node);
            if (updatedNode !== node) changed = true;
            return updatedNode;
        }

        if (!node.children?.length) return node;

        const [nextChildren, childChanged] = updateTreeById(node.children, id, updater);
        if (!childChanged) return node;

        changed = true;
        return { ...node, children: nextChildren };
    });

    return [changed ? nextNodes : nodes, changed];
};

const deleteTreeById = (nodes: ComponentNode[], id: string): [ComponentNode[], boolean] => {
    let changed = false;
    const keptNodes: ComponentNode[] = [];

    for (const node of nodes) {
        if (node.id === id) {
            changed = true;
            continue;
        }

        if (!node.children?.length) {
            keptNodes.push(node);
            continue;
        }

        const [nextChildren, childChanged] = deleteTreeById(node.children, id);
        if (!childChanged) {
            keptNodes.push(node);
            continue;
        }

        changed = true;
        keptNodes.push({ ...node, children: nextChildren });
    }

    return [changed ? keptNodes : nodes, changed];
};

const appendChildToView = (nodes: ComponentNode[], parentId: string, child: ComponentNode): [ComponentNode[], boolean] =>
    updateTreeById(nodes, parentId, (node) => {
        if (node.type !== 'View') return node;
        return {
            ...node,
            style: {
                ...node.style,
                padding: node.style.padding ?? 12,
                gap: node.style.gap ?? 8,
            },
            children: [...(node.children ?? []), child],
        };
    });

const extractNodeById = (nodes: ComponentNode[], id: string): [ComponentNode[], ComponentNode | null, boolean] => {
    let changed = false;
    let extracted: ComponentNode | null = null;
    const nextNodes: ComponentNode[] = [];

    for (const node of nodes) {
        if (node.id === id) {
            changed = true;
            extracted = node;
            continue;
        }

        if (!node.children?.length) {
            nextNodes.push(node);
            continue;
        }

        const [nextChildren, childExtracted, childChanged] = extractNodeById(node.children, id);
        if (childExtracted) extracted = childExtracted;
        if (childChanged) {
            changed = true;
            nextNodes.push({ ...node, children: nextChildren });
            continue;
        }

        nextNodes.push(node);
    }

    return [changed ? nextNodes : nodes, extracted, changed];
};

const collectDescendantIds = (node: ComponentNode, ids = new Set<string>()): Set<string> => {
    ids.add(node.id);
    node.children?.forEach((child) => collectDescendantIds(child, ids));
    return ids;
};

const reorderArray = <T,>(arr: T[], from: number, to: number): T[] => {
    const next = [...arr];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
};

const findParentAndIndex = (
    nodes: ComponentNode[],
    id: string,
    parentId: string | null = null
): { parentId: string | null; index: number; siblings: ComponentNode[] } | null => {
    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (node.id === id) {
            return { parentId, index: i, siblings: nodes };
        }
        if (node.children?.length) {
            const found = findParentAndIndex(node.children, id, node.id);
            if (found) return found;
        }
    }
    return null;
};

const findParentId = (nodes: ComponentNode[], id: string): string | null => {
    const found = findParentAndIndex(nodes, id);
    return found?.parentId ?? null;
};

const normalizeNodeForParentLayout = (node: ComponentNode, parentLayoutMode: LayoutMode): ComponentNode => {
    if (node.type !== 'View') return node;

    if (parentLayoutMode === 'absolute') {
        return {
            ...node,
            style: {
                ...node.style,
                width: typeof node.style.width === 'number' ? node.style.width : 200,
                height: typeof node.style.height === 'number' ? node.style.height : 120,
                flex: undefined,
            },
        };
    }

    return {
        ...node,
        style: {
            ...node.style,
            flex: node.style.flex ?? 1,
        },
    };
};

const pointInRect = (x: number, y: number, rect: Rect): boolean =>
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height;

const findViewTargetAtPoint = (
    nodes: ComponentNode[],
    layoutBounds: Record<string, Rect>,
    pageX: number,
    pageY: number,
    excludedIds: Set<string>
): string | null => {
    let bestId: string | null = null;
    let bestDepth = -1;
    let bestArea = Number.POSITIVE_INFINITY;

    const walk = (list: ComponentNode[], depth: number) => {
        for (let i = list.length - 1; i >= 0; i -= 1) {
            const node = list[i];
            if (excludedIds.has(node.id)) continue;

            const bounds = layoutBounds[node.id];
            if (node.type === 'View' && bounds && pointInRect(pageX, pageY, bounds)) {
                const area = bounds.width * bounds.height;
                if (depth > bestDepth || (depth === bestDepth && area < bestArea)) {
                    bestId = node.id;
                    bestDepth = depth;
                    bestArea = area;
                }
            }

            if (node.children?.length) {
                walk(node.children, depth + 1);
            }
        }
    };

    walk(nodes, 0);
    return bestId;
};

const findOverlapViewTargetByRect = (
    nodes: ComponentNode[],
    probeRect: Rect,
    rootMode: LayoutMode,
    excludedIds: Set<string>
): string | null => {
    if (rootMode !== 'absolute') return null;

    let bestId: string | null = null;
    let bestDepth = -1;
    let bestArea = Number.POSITIVE_INFINITY;

    const walk = (list: ComponentNode[], depth: number, containerMode: LayoutMode, offsetX: number, offsetY: number) => {
        if (containerMode !== 'absolute') return;

        for (let i = list.length - 1; i >= 0; i -= 1) {
            const node = list[i];
            const rect = getNodeRect(node, offsetX, offsetY);
            const isExcluded = excludedIds.has(node.id);

            if (!isExcluded && node.type === 'View' && intersects(probeRect, rect)) {
                const area = rect.width * rect.height;
                if (depth > bestDepth || (depth === bestDepth && area < bestArea)) {
                    bestId = node.id;
                    bestDepth = depth;
                    bestArea = area;
                }
            }

            const childMode = node.type === 'View' ? node.style.layoutMode ?? 'flex' : containerMode;
            const childOffsetX = containerMode === 'absolute' ? rect.x : offsetX;
            const childOffsetY = containerMode === 'absolute' ? rect.y : offsetY;
            if (node.children?.length) {
                walk(node.children, depth + 1, childMode, childOffsetX, childOffsetY);
            }
        }
    };

    walk(nodes, 0, rootMode, 0, 0);
    return bestId;
};

const findOverlapViewTarget = (
    nodes: ComponentNode[],
    newNode: ComponentNode,
    canvasMode: LayoutMode
): string | null => {
    if (canvasMode !== 'absolute') return null;
    return findOverlapViewTargetByRect(nodes, getNodeRect(newNode), canvasMode, new Set());
};

export const useComponentNodeStore = create<CanvasState>((set, get) => ({
    componentTree: [],
    selectedID: null,
    hoveredParentID: null,
    layoutBounds: {},
    canvasConfig: defaultCanvasConfig,

    selectNode: (id) => {
        set({ selectedID: id && id.length > 0 ? id : null });
    },

    selectParentNode: (id) => {
        set({ selectedID: findParentId(get().componentTree, id) });
    },

    addNode: (node) => {
        const { selectedID, componentTree, canvasConfig } = get();
        const baseNode: ComponentNode = { ...node, id: generateId() };

        if (selectedID) {
            const selectedNode = findNode(componentTree, selectedID);
            if (selectedNode?.type === 'View') {
                const parentLayoutMode = selectedNode.style.layoutMode ?? 'flex';
                const newNode = normalizeNodeForParentLayout(baseNode, parentLayoutMode);
                const [nextTree] = appendChildToView(componentTree, selectedID, newNode);
                set({ componentTree: nextTree, selectedID: newNode.id });
                return;
            }
        }

        const newNode = normalizeNodeForParentLayout(baseNode, canvasConfig.layoutMode);

        if (newNode.type === 'View') {
            const overlapViewId = findOverlapViewTarget(componentTree, newNode, canvasConfig.layoutMode);
            if (overlapViewId) {
                const [nextTree] = appendChildToView(componentTree, overlapViewId, newNode);
                set({ componentTree: nextTree, selectedID: newNode.id });
                return;
            }
        }

        set({ componentTree: [...componentTree, newNode], selectedID: newNode.id });
    },

    deleteNode: (id) => {
        if (!id) return;
        set((state) => {
            const [nextTree] = deleteTreeById(state.componentTree, id);
            return {
                componentTree: nextTree,
                selectedID: state.selectedID === id ? null : state.selectedID,
            };
        });
    },

    editNode: (id, updates) => {
        set((state) => {
            const [nextTree, changed] = updateTreeById(state.componentTree, id, (node) => {
                const nextStyle = updates.style ? { ...node.style, ...updates.style } : node.style;
                return {
                    ...node,
                    ...updates,
                    style: nextStyle,
                };
            });

            if (!changed) return state;
            return { componentTree: nextTree };
        });
    },

    moveNode: (id, x, y) => {
        set((state) => {
            const [nextTree, changed] = updateTreeById(state.componentTree, id, (node) => {
                if (node.x === x && node.y === y) return node;
                return { ...node, x, y };
            });
            if (!changed) return state;
            return { componentTree: nextTree };
        });
    },

    reorderNode: (id, delta) => {
        const { componentTree } = get();
        const found = findParentAndIndex(componentTree, id);
        if (!found) return false;

        const toIndex = found.index + delta;
        if (toIndex < 0 || toIndex >= found.siblings.length) return false;

        if (found.parentId === null) {
            const nextTree = reorderArray(componentTree, found.index, toIndex);
            set({ componentTree: nextTree });
            return true;
        }

        const [nextTree, changed] = updateTreeById(componentTree, found.parentId, (parentNode) => {
            if (!parentNode.children) return parentNode;
            return {
                ...parentNode,
                children: reorderArray(parentNode.children, found.index, toIndex),
            };
        });

        if (!changed) return false;
        set({ componentTree: nextTree });
        return true;
    },

    updateNodeLayout: (id, rect) => {
        set((state) => {
            const prev = state.layoutBounds[id];
            const nextRect: Rect = {
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
            };
            if (
                prev &&
                prev.x === nextRect.x &&
                prev.y === nextRect.y &&
                prev.width === nextRect.width &&
                prev.height === nextRect.height
            ) {
                return state;
            }
            return {
                layoutBounds: {
                    ...state.layoutBounds,
                    [id]: nextRect,
                },
            };
        });
    },

    previewDropTarget: (id, pageX, pageY) => {
        const { componentTree, layoutBounds } = get();
        const movingNode = findNode(componentTree, id);
        if (!movingNode) return null;
        const excludedIds = collectDescendantIds(movingNode);
        const targetId = findViewTargetAtPoint(componentTree, layoutBounds, pageX, pageY, excludedIds);
        if (get().hoveredParentID !== targetId) {
            set({ hoveredParentID: targetId });
        }
        return targetId;
    },

    clearDropTarget: () => {
        if (get().hoveredParentID !== null) set({ hoveredParentID: null });
    },

    dropNodeIntoParent: (id, parentId, dx, dy) => {
        const { componentTree, layoutBounds } = get();

        const movingNode = findNode(componentTree, id);
        const parentNodeCandidate = findNode(componentTree, parentId);
        if (!movingNode || !parentNodeCandidate || parentNodeCandidate.type !== 'View') return false;
        if (findNode([movingNode], parentId)) return false;

        const currentParent = findParentAndIndex(componentTree, id)?.parentId;
        if (currentParent === parentId) return false;

        const [treeWithoutNode, extractedNode, changed] = extractNodeById(componentTree, id);
        if (!changed || !extractedNode) return false;

        const parentAfter = findNode(treeWithoutNode, parentId);
        if (!parentAfter || parentAfter.type !== 'View') return false;

        const parentLayoutMode = parentAfter.style.layoutMode ?? 'flex';
        const adjustedNode = normalizeNodeForParentLayout(extractedNode, parentLayoutMode);

        const nodeForParent =
            parentLayoutMode === 'absolute'
                ? (() => {
                      const movingBounds = layoutBounds[id];
                      const parentBounds = layoutBounds[parentId];
                      if (!movingBounds || !parentBounds) return adjustedNode;
                      const nextAbsX = movingBounds.x + dx;
                      const nextAbsY = movingBounds.y + dy;
                      return {
                          ...adjustedNode,
                          x: Math.round(nextAbsX - parentBounds.x),
                          y: Math.round(nextAbsY - parentBounds.y),
                      };
                  })()
                : adjustedNode;

        const [nextTree, appended] = appendChildToView(treeWithoutNode, parentId, nodeForParent);
        if (!appended) return false;

        set({
            componentTree: nextTree,
            selectedID: id,
            hoveredParentID: null,
        });
        return true;
    },

    updateCanvasConfig: (updates) => {
        set((state) => ({
            canvasConfig: {
                ...state.canvasConfig,
                ...updates,
                style: {
                    ...state.canvasConfig.style,
                    ...(updates.style ?? {}),
                },
            },
        }));
    },
}));

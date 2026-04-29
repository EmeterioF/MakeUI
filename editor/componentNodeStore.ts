import { create } from 'zustand';
import { findViewTargetAtPoint } from '@/editor/componentNodeDropUtils';
import {
    appendChildToView,
    collectDescendantIds,
    deleteTreeById,
    extractNodeById,
    findNode,
    findParentId,
    addNodeToCanvas,
    updateTreeById,
    generateId
} from '@/editor/componentNodeTreeUtils';
import { CanvasConfig, CanvasState, ComponentNode, Rect } from '@/editor/componentNodeTypes';

export type {
    CanvasConfig,
    CanvasState,
    ComponentNode,
    ComponentStyle,
    ComponentType,
    LayoutMode,
    Rect,
} from '@/editor/componentNodeTypes';
export { findNode } from '@/editor/componentNodeTreeUtils';


// Global canvas defaults used when app starts or when no custom settings are applied yet.
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

export const useComponentNodeStore = create<CanvasState>((set, get) => ({
    // === Core editor state ===
    // The live tree that represents what user is building in the editor.
    componentTree: [],
    // Currently selected node id (for edit panel / focus).
    selectedID: null,
    // Temporary "drop preview" highlight while dragging over a valid parent.
    hoveredParentID: null,
    // Measured screen rectangles per node, used to detect drag/drop targets.
    layoutBounds: {},
    // Canvas (root container) layout config.
    canvasConfig: defaultCanvasConfig,

    // Select a node by id. Empty/invalid ids are normalized to null.
    selectNode: (id) => {
        set({ selectedID: id && id.length > 0 ? id : null });
    },

    // Move selection to the parent of a node.
    // Useful when user taps selected node again and wants to "go up" one level.
    selectParentNode: (id) => {
        set({ selectedID: findParentId(get().componentTree, id) });
    },

    // Add a new node to the root canvas.
    // Nested insertion is handled separately by drag-drop reparenting.
    addNode: (node) => {
        const { componentTree, canvasConfig } = get();
        const baseNode: ComponentNode = { ...node, id: generateId() };
        const newNode = addNodeToCanvas(baseNode, canvasConfig.layoutMode);
        set({ componentTree: [...componentTree, newNode], selectedID: newNode.id });
    },

    // Delete node by id (including its subtree), then clear selection if deleted node was selected.
    deleteNode: (id) => {
        // Step 1) Guard invalid calls.
        if (!id) return;
        set((state) => {
            // Step 2) Remove target node recursively from tree.
            const [nextTree] = deleteTreeById(state.componentTree, id);
            return {
                // Step 3) Commit next tree.
                componentTree: nextTree,
                // Step 4) If deleted node was selected, clear selection.
                selectedID: state.selectedID === id ? null : state.selectedID,
            };
        });
    },

    // Edit one node by id.
    editNode: (id, updates) => {
        set((state) => {
            // Step 1) Traverse tree and update only the target node.
            const [nextTree, changed] = updateTreeById(state.componentTree, id, (node) => {
                // Step 2)  after finding the node by id, update that node and return the updated component Tree
                const nextStyle = updates.style ? { ...node.style, ...updates.style } : node.style;
                return {
                    // Step 3) Merge root-level fields (content, x, y, etc.)
                    ...node,
                    ...updates,
                    // Step 4) Write merged style explicitly to avoid accidental style replacement.
                    style: nextStyle,
                };
            });

            // Step 5) If no node matched id, keep previous state reference (no rerender noise).
            if (!changed) return state;
            // Step 6) Commit updated tree only.
            return { componentTree: nextTree };
        });
    },

    // Persist measured layout bounds for hit-testing (drag target detection).
    // We round values and skip state update if nothing changed to avoid extra re-renders.
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

    // During drag: find best View target under pointer and highlight it.
    // We exclude the moving node and its descendants to prevent invalid self-nesting.
    previewDropTarget: (id, pageX, pageY) => {
        const { componentTree, layoutBounds } = get();
        const movingNode = findNode(componentTree, id);
        if (!movingNode) return null;

        // Exclude the dragged node and everything under it.
        // Without this, a node could be dropped into itself or one of its children,
        // which would create a cycle in the tree.
        const excludedIds = collectDescendantIds(movingNode);

        // Hit-test the finger against the latest measured rectangles and choose
        // the deepest matching View so nested containers win over outer wrappers.
        const targetId = findViewTargetAtPoint(componentTree, layoutBounds, pageX, pageY, excludedIds);
        if (get().hoveredParentID !== targetId) {
            set({ hoveredParentID: targetId });
        }
        return targetId;
    },

    // Clear drag/drop highlight state.
    clearDropTarget: () => {
        if (get().hoveredParentID !== null) set({ hoveredParentID: null });
    },

    // Finalize drag-drop reparenting:
    // 1) validate move
    // 2) remove node from old location
    // 3) normalize style for new parent layout
    // 4) append into new parent
    dropNodeIntoParent: (id, parentId, _dx, _dy) => {
        const { componentTree } = get();

        // 1) Resolve both sides of the move from the current tree snapshot.
        const movingNode = findNode(componentTree, id);
        const parentNodeCandidate = findNode(componentTree, parentId);
        if (!movingNode || !parentNodeCandidate || parentNodeCandidate.type !== 'View') return false;

        //------------ FALLBACKS

        // 2) Extra safety: never allow a node to become a child of its own subtree.
        if (findNode([movingNode], parentId)) return false;

        // 3) No-op if the node is already inside this parent.
        const currentParent = findParentId(componentTree, id);
        if (currentParent === parentId) return false;

        //-------------TREE REPARENTING HAPPENS HERE

        // 4) Remove the node from its old branch first so we can reinsert it cleanly.
        const [treeWithoutNode, extractedNode, changed] = extractNodeById(componentTree, id);
        if (!changed || !extractedNode) return false;

        // 5) Re-read the target parent from the updated tree after extraction.
        const parentAfter = findNode(treeWithoutNode, parentId);
        if (!parentAfter || parentAfter.type !== 'View') return false;

        // 6) Normalize style defaults for the new container's layout rules. it is to ensure that view always is flex
        const parentLayoutMode = parentAfter.style.layoutMode ?? 'flex';
        const adjustedNode = addNodeToCanvas(extractedNode, parentLayoutMode);

        // 7) Append and commit the new tree in one store update.
        const [nextTree, appended] = appendChildToView(treeWithoutNode, parentId, adjustedNode);
        if (!appended) return false;

        set({
            componentTree: nextTree,
            selectedID: id,
            hoveredParentID: null,
        });
        return true;
    },

    // Update canvas settings.
    // Note: layoutMode is intentionally pinned to 'flex' in current editor version.
    updateCanvasConfig: (updates) => {
        set((state) => ({
            canvasConfig: {
                ...state.canvasConfig,
                ...updates,
                layoutMode: 'flex',
                style: {
                    ...state.canvasConfig.style,
                    ...(updates.style ?? {}),
                },
            },
        }));
    },
}));

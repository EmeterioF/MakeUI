import { ComponentNode, LayoutMode } from '@/editor/componentNodeTypes';

//------------------------ FIND UTILS ---------------------//

export const findNode = (nodes: ComponentNode[], id: string | null): ComponentNode | null => {
    // Step 1) Invalid id => no match.
    if (!id) return null;

    // Step 2) Depth-first search across current level.
    for (const node of nodes) {
        // Step 2a) Direct match at current level.
        if (node.id === id) return node;

        // Step 2b) Recurse into children when present.
        if (node.children?.length) {
            const found = findNode(node.children, id);
            if (found) return found;
        }
    }

    // Step 3) Exhausted all branches.
    return null;
};

export const findParentId = (nodes: ComponentNode[], id: string): string | null => {
    const found = findParentAndIndex(nodes, id);
    return found?.parentId ?? null;
};

export const findParentAndIndex = (
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



//------------------------ ADD NODE UTILS ---------------------//

export const addNodeToCanvas = (node: ComponentNode, parentLayoutMode: LayoutMode): ComponentNode => {
    // Only container nodes need layout normalization when they enter a canvas/View.
    // Leaf nodes (Text, Button, Image) can be reused as-is.
    if (node.type !== 'View') return node;

    return {
        ...node,
        style: {
            ...node.style,
            layoutMode: parentLayoutMode,
            flex: node.style.flex ?? 1,
        },
    };
};

export const appendChildToView = (nodes: ComponentNode[], parentId: string, child: ComponentNode): [ComponentNode[], boolean] =>
    updateTreeById(nodes, parentId, (node) => {
        // Step 1) Parent must be a View to accept children.
        if (node.type !== 'View') return node;
        return {
            ...node,
            style: {
                // Step 2) Ensure container defaults for visible spacing.
                ...node.style,
                padding: node.style.padding ?? 12,
                gap: node.style.gap ?? 8,
            },
            // Step 3) Immutable append.
            children: [...(node.children ?? []), child],
        };
    });



//------------------------ DELETE NODE UTILS ---------------------//

export const deleteTreeById = (nodes: ComponentNode[], id: string): [ComponentNode[], boolean] => {
    //uses depth first search algo to delete the child

    //changed means that the target id is now deleted
    let changed = false;
    const keptNodes: ComponentNode[] = [];

    for (const node of nodes) {
        // Step 1) Match => drop node (and its entire subtree).
        if (node.id === id) {
            changed = true;
            continue;
        }

        // Step 2) Leaf and not target => keep as-is.
        if (!node.children?.length) {
            keptNodes.push(node);
            continue;
        }

        // Step 3) Recurse children to delete target deeper in tree.
        const [nextChildren, childChanged] = deleteTreeById(node.children, id);
        if (!childChanged) {
            // No deletion happened in subtree.
            keptNodes.push(node);
            continue;
        }

        // Step 4) Subtree changed => clone parent with filtered children.
        changed = true;
        keptNodes.push({ ...node, children: nextChildren });
    }

    // Step 5) Preserve original array reference if unchanged.
    return [changed ? keptNodes : nodes, changed];
};



//------------------------ EDIT NODE UTILS ---------------------//

export const updateTreeById = (
    nodes: ComponentNode[],
    id: string,
    updater: (node: ComponentNode) => ComponentNode
): [ComponentNode[], boolean] => {
    // changed=true means we created at least one new node/object reference.
    let changed = false;

    const nextNodes = nodes.map((node) => {
        // Step 1) If this is the target id, run updater.
        if (node.id === id) {
            const updatedNode = updater(node);
            if (updatedNode !== node) changed = true;
            return updatedNode;
        }

        // Step 2) Leaf and not target => keep original reference.
        if (!node.children?.length) return node;

        // Step 3) Recurse into subtree.
        const [nextChildren, childChanged] = updateTreeById(node.children, id, updater);
        if (!childChanged) return node;

        // Step 4) Child changed => clone parent with replaced children.
        changed = true;
        return { ...node, children: nextChildren };
    });

    // Step 5) Return original top-level array when nothing changed.
    return [changed ? nextNodes : nodes, changed];
};



//------------------------ OTHER UTILS ---------------------//


export const collectDescendantIds = (node: ComponentNode, ids = new Set<string>()): Set<string> => {
    // The returned set includes the node itself on purpose.
    // Drag logic uses this to block dropping into the dragged node or any nested child.
    ids.add(node.id);
    node.children?.forEach((child) => collectDescendantIds(child, ids));
    return ids;
};

export const extractNodeById = (nodes: ComponentNode[], id: string): [ComponentNode[], ComponentNode | null, boolean] => {
    // This is the "move" companion to deleteTreeById:
    // it removes the target from the tree but also returns the removed node
    // so callers can insert it somewhere else.
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

export const generateId = () => Math.random().toString(36).slice(2, 9);

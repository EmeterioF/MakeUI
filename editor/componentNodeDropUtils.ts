import { ComponentNode, Rect } from '@/editor/componentNodeTypes';

const pointInRect = (x: number, y: number, rect: Rect): boolean =>
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height;

export const findViewTargetAtPoint = (
    nodes: ComponentNode[],
    layoutBounds: Record<string, Rect>,
    pageX: number,
    pageY: number,
    excludedIds: Set<string>
): string | null => {
    // We keep the "best" candidate instead of returning the first match because
    // several nested Views can overlap the same point.
    // Selection rule:
    // 1) prefer deeper nodes in the tree
    // 2) if depth ties, prefer the smaller area (usually the more specific container)
    let bestId: string | null = null;
    let bestDepth = -1;
    let bestArea = Number.POSITIVE_INFINITY;

    const walk = (list: ComponentNode[], depth: number) => {
        for (let i = list.length - 1; i >= 0; i -= 1) {
            const node = list[i];

            // Skip the dragged subtree entirely so we never suggest an impossible target.
            if (excludedIds.has(node.id)) continue;

            const bounds = layoutBounds[node.id];
            if ((node.type === 'View' || node.type === 'ScrollView') && bounds && pointInRect(pageX, pageY, bounds)) {
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

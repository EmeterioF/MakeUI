import React, { memo, useMemo, useRef, useState } from 'react';
import {
    findNodeHandle,
    GestureResponderEvent,
    Image,
    Text,
    View,
    ViewStyle,
} from 'react-native';
import { getNodeStyle } from '@/renderer/nodeStyles';
import { ComponentNode, LayoutMode, useComponentNodeStore } from '@/editor/componentNodeStore';

type Props = {
    node: ComponentNode;
    parentLayoutMode: LayoutMode;
};

function ComponentRendererBase({ node, parentLayoutMode }: Props) {
    const selectedID = useComponentNodeStore((s) => s.selectedID);
    const hoveredParentID = useComponentNodeStore((s) => s.hoveredParentID);
    const onSelect = useComponentNodeStore((s) => s.selectNode);
    const selectParentNode = useComponentNodeStore((s) => s.selectParentNode);
    const moveNode = useComponentNodeStore((s) => s.moveNode);
    const reorderNode = useComponentNodeStore((s) => s.reorderNode);
    const updateNodeLayout = useComponentNodeStore((s) => s.updateNodeLayout);
    const previewDropTarget = useComponentNodeStore((s) => s.previewDropTarget);
    const clearDropTarget = useComponentNodeStore((s) => s.clearDropTarget);
    const dropNodeIntoParent = useComponentNodeStore((s) => s.dropNodeIntoParent);

    const isSelected = selectedID === node.id;
    const isDropTarget = node.type === 'View' && hoveredParentID === node.id;
    const s = getNodeStyle(node, isSelected, isDropTarget, parentLayoutMode);
    const isButton = node.type === 'Button';

    const [dragDelta, setDragDelta] = useState({ dx: 0, dy: 0 });
    const rafRef = useRef<number | null>(null);
    const layoutRef = useRef<any>(null);
    const pendingRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
    const dropTargetRef = useRef<string | null>(null);
    const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressReadyRef = useRef(node.type !== 'Button');
    const startRef = useRef({ x: node.x, y: node.y, pageX: 0, pageY: 0, moved: false });

    const resetDrag = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        pendingRef.current = { dx: 0, dy: 0 };
        dropTargetRef.current = null;
        longPressReadyRef.current = !isButton;
        setDragDelta({ dx: 0, dy: 0 });
        startRef.current.moved = false;
    };

    const flushPreview = () => {
        rafRef.current = null;
        setDragDelta({ dx: pendingRef.current.dx, dy: pendingRef.current.dy });
    };

    const reportLayout = () => {
        const target = layoutRef.current;
        if (!target || typeof target.measureInWindow !== 'function') return;
        target.measureInWindow((x: number, y: number, width: number, height: number) => {
            updateNodeLayout(node.id, { x, y, width, height });
        });
    };

    const dragStyle = useMemo(() => {
        if (dragDelta.dx === 0 && dragDelta.dy === 0) return undefined;
        return { transform: [{ translateX: dragDelta.dx }, { translateY: dragDelta.dy }] };
    }, [dragDelta.dx, dragDelta.dy]);

    const isDirectTouchOnNode = (event: GestureResponderEvent) => {
        const nodeHandle = findNodeHandle(layoutRef.current);
        if (!nodeHandle) return false;
        return String(event.nativeEvent.target) === String(nodeHandle);
    };

    const handlers = {
        onStartShouldSetResponder: (event: GestureResponderEvent) => isDirectTouchOnNode(event),
        onMoveShouldSetResponder: (event: GestureResponderEvent) => isDirectTouchOnNode(event),
        onResponderGrant: (event: GestureResponderEvent) => {
            clearDropTarget();
            if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
            longPressReadyRef.current = !isButton;
            if (isButton) {
                longPressTimerRef.current = setTimeout(() => {
                    longPressReadyRef.current = true;
                }, 220);
            }
            startRef.current = {
                x: node.x,
                y: node.y,
                pageX: event.nativeEvent.pageX,
                pageY: event.nativeEvent.pageY,
                moved: false,
            };
        },
        onResponderMove: (event: GestureResponderEvent) => {
            if (!longPressReadyRef.current) return;
            const dx = event.nativeEvent.pageX - startRef.current.pageX;
            const dy = event.nativeEvent.pageY - startRef.current.pageY;
            pendingRef.current = { dx, dy };
            dropTargetRef.current = previewDropTarget(node.id, event.nativeEvent.pageX, event.nativeEvent.pageY);
            if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                startRef.current.moved = true;
            }
            if (rafRef.current === null) {
                rafRef.current = requestAnimationFrame(flushPreview);
            }
        },
        onResponderRelease: () => {
            if (!startRef.current.moved) {
                if (selectedID === node.id) {
                    selectParentNode(node.id);
                } else {
                    onSelect(node.id);
                }
            } else if (longPressReadyRef.current) {
                const targetId = dropTargetRef.current;
                const dropped =
                    targetId !== null
                        ? dropNodeIntoParent(node.id, targetId, pendingRef.current.dx, pendingRef.current.dy)
                        : false;

                if (!dropped && parentLayoutMode === 'absolute') {
                    const nextX = Math.round(startRef.current.x + pendingRef.current.dx);
                    const nextY = Math.round(startRef.current.y + pendingRef.current.dy);
                    moveNode(node.id, nextX, nextY);
                } else if (!dropped) {
                    // In flex containers, dragging is intent-based:
                    // try reorder by one slot; otherwise snap back (no persisted movement).
                    const threshold = 40;
                    const primaryAxis = Math.abs(pendingRef.current.dx) > Math.abs(pendingRef.current.dy)
                        ? pendingRef.current.dx
                        : pendingRef.current.dy;

                    if (Math.abs(primaryAxis) >= threshold) {
                        const delta: -1 | 1 = primaryAxis > 0 ? 1 : -1;
                        reorderNode(node.id, delta);
                    }
                }
            }
            clearDropTarget();
            resetDrag();
        },
        onResponderTerminate: () => {
            clearDropTarget();
            resetDrag();
        },
    };

    const childLayoutMode: LayoutMode = node.type === 'View' ? node.style.layoutMode ?? 'flex' : parentLayoutMode;

    switch (node.type) {
        case 'View':
            return (
                <View ref={layoutRef} onLayout={reportLayout} {...handlers} style={[s.view, dragStyle as ViewStyle]}>
                    {node.children?.map((child) => (
                        <ComponentRenderer key={child.id} node={child} parentLayoutMode={childLayoutMode} />
                    ))}
                </View>
            );

        case 'Text':
            return (
                <Text ref={layoutRef} onLayout={reportLayout} {...handlers} style={[s.text, dragStyle as any]}>
                    {node.content}
                </Text>
            );

        case 'Button':
            return (
                <View ref={layoutRef} onLayout={reportLayout} {...handlers} style={[s.button, dragStyle as ViewStyle]}>
                    <Text style={s.buttonLabel}>{node.content}</Text>
                </View>
            );

        case 'Image':
            return (
                <View ref={layoutRef} onLayout={reportLayout} {...handlers} style={[s.image, dragStyle as ViewStyle]}>
                    {node.content ? (
                        <View pointerEvents="none" style={s.imageFill}>
                            <Image source={{ uri: node.content }} style={s.imageFill} />
                        </View>
                    ) : (
                        <View pointerEvents="none" style={s.imagePlaceholder}>
                            <Text style={s.imagePlaceholderIcon}>IMG</Text>
                        </View>
                    )}
                </View>
            );
    }
}

const ComponentRenderer = memo(ComponentRendererBase);
export default ComponentRenderer;

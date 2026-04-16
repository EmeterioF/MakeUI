import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { getNodeStyle } from '@/renderer/nodeStyles';
import {
    useComponentNodeStore,
    ComponentNode,
    isDescendant,
    findNode,
    findParentId,
    PositionMode,
} from '@/editor/componentNodeStore';

type MeasureableView = View & {
    measureInWindow: (cb: (x: number, y: number, width: number, height: number) => void) => void;
};

function ComponentRenderer({ node }: { node: ComponentNode }) {
    const selectedID = useComponentNodeStore((s) => s.selectedID);
    const activeDropTargetID = useComponentNodeStore((s) => s.activeDropTargetID);
    const onSelect = useComponentNodeStore((s) => s.selectNode);
    const updateNodePosition = useComponentNodeStore((s) => s.updateNodePosition);
    const registerDropTarget = useComponentNodeStore((s) => s.registerDropTarget);
    const unregisterDropTarget = useComponentNodeStore((s) => s.unregisterDropTarget);
    const setActiveDropTarget = useComponentNodeStore((s) => s.setActiveDropTarget);
    const moveNodeToParent = useComponentNodeStore((s) => s.moveNodeToParent);

    const isSelected = selectedID === node.id;
    const isDropTarget = node.type === 'View' && activeDropTargetID === node.id;
    const s = getNodeStyle(node, isSelected);

    const x = useSharedValue(node.x);
    const y = useSharedValue(node.y);
    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);
    const startX = useSharedValue(node.x);
    const startY = useSharedValue(node.y);
    const isDragging = useSharedValue(0);

    const lastSynced = useRef({ x: node.x, y: node.y });
    const hoveredTargetRef = useRef<string | null>(null);
    const wrapperRef = useRef<MeasureableView | null>(null);
    const viewRef = useRef<MeasureableView | null>(null);

    useEffect(() => {
        x.value = node.x;
        y.value = node.y;
        dragX.value = 0;
        dragY.value = 0;
        isDragging.value = 0;
        lastSynced.current = { x: node.x, y: node.y };
    }, [dragX, dragY, isDragging, node.x, node.y, x, y]);

    const syncPosition = useCallback(
        (nextX: number, nextY: number) => {
            const prev = lastSynced.current;
            if (prev.x === nextX && prev.y === nextY) return;
            lastSynced.current = { x: nextX, y: nextY };
            updateNodePosition(node.id, nextX, nextY);
        },
        [node.id, updateNodePosition]
    );

    const toggleSelectNode = useCallback(() => {
        if (selectedID === node.id) {
            onSelect(null);
            return;
        }
        onSelect(node.id);
    }, [node.id, onSelect, selectedID]);

    const clearHoveredTarget = useCallback(() => {
        hoveredTargetRef.current = null;
        setActiveDropTarget(null);
    }, [setActiveDropTarget]);

    const measureAndRegisterDropTarget = useCallback(() => {
        if (node.type !== 'View' || !viewRef.current?.measureInWindow) return;
        viewRef.current.measureInWindow((mx, my, width, height) => {
            registerDropTarget(node.id, { x: mx, y: my, width, height });
        });
    }, [node.id, node.type, registerDropTarget]);

    useEffect(() => {
        if (node.type !== 'View') return;
        const timer = setTimeout(measureAndRegisterDropTarget, 0);
        return () => {
            clearTimeout(timer);
            unregisterDropTarget(node.id);
        };
    }, [measureAndRegisterDropTarget, node.id, node.type, unregisterDropTarget]);

    const updateHoveredTarget = useCallback(
        (absoluteX: number, absoluteY: number) => {
            const state = useComponentNodeStore.getState();
            let bestTargetID: string | null = null;
            let bestArea = Number.POSITIVE_INFINITY;

            for (const [targetID, rect] of Object.entries(state.dropTargets)) {
                if (targetID === node.id) continue;
                if (isDescendant(state.componentTree, node.id, targetID)) continue;

                const insideX = absoluteX >= rect.x && absoluteX <= rect.x + rect.width;
                const insideY = absoluteY >= rect.y && absoluteY <= rect.y + rect.height;
                if (!insideX || !insideY) continue;

                const area = rect.width * rect.height;
                if (area < bestArea) {
                    bestArea = area;
                    bestTargetID = targetID;
                }
            }

            if (hoveredTargetRef.current === bestTargetID) return;
            hoveredTargetRef.current = bestTargetID;
            setActiveDropTarget(bestTargetID);
        },
        [node.id, setActiveDropTarget]
    );

    const completeDrop = useCallback(
        (nodeAbsoluteX: number, nodeAbsoluteY: number) => {
            const state = useComponentNodeStore.getState();
            const targetID = hoveredTargetRef.current;
            const sourceParentID = findParentId(state.componentTree, node.id);

            if (targetID) {
                const targetRect = state.dropTargets[targetID];
                const targetNode = findNode(state.componentTree, targetID);
                const targetLayoutMode = targetNode?.layoutMode ?? 'absolute';

                if (targetRect) {
                    if (targetLayoutMode === 'flex') {
                        moveNodeToParent(node.id, targetID, 0, 0, 'flow');
                    } else {
                        const localX = Math.round(nodeAbsoluteX - targetRect.x);
                        const localY = Math.round(nodeAbsoluteY - targetRect.y);
                        moveNodeToParent(node.id, targetID, localX, localY, 'absolute');
                    }
                    clearHoveredTarget();
                    return;
                }
            }

            if (sourceParentID) {
                const rootMode: PositionMode = state.canvasPositionMode;
                if (rootMode === 'flow') {
                    moveNodeToParent(node.id, null, 0, 0, 'flow');
                } else {
                    moveNodeToParent(node.id, null, Math.round(nodeAbsoluteX), Math.round(nodeAbsoluteY), 'absolute');
                }
                clearHoveredTarget();
                return;
            }

            if (state.canvasPositionMode === 'flow') {
                moveNodeToParent(node.id, null, 0, 0, 'flow');
            } else if (node.positionMode === 'absolute') {
                syncPosition(Math.round(x.value), Math.round(y.value));
            } else {
                moveNodeToParent(node.id, null, Math.round(nodeAbsoluteX), Math.round(nodeAbsoluteY), 'absolute');
            }
            clearHoveredTarget();
        },
        [clearHoveredTarget, moveNodeToParent, node.id, node.positionMode, syncPosition, x, y]
    );

    const finalizeDrag = useCallback(() => {
        dragX.value = 0;
        dragY.value = 0;
        isDragging.value = 0;

        if (!wrapperRef.current?.measureInWindow) {
            completeDrop(Math.round(x.value), Math.round(y.value));
            return;
        }

        wrapperRef.current.measureInWindow((mx, my) => {
            completeDrop(mx, my);
        });
    }, [completeDrop, dragX, dragY, isDragging, x, y]);

    const pan = useMemo(
        () =>
            Gesture.Pan()
                .activateAfterLongPress(220)
                .onStart(() => {
                    isDragging.value = 1;
                    startX.value = x.value;
                    startY.value = y.value;
                    runOnJS(onSelect)(node.id);
                    runOnJS(clearHoveredTarget)();
                })
                .onUpdate((event) => {
                    if (node.positionMode === 'absolute') {
                        x.value = Math.round(startX.value + event.translationX);
                        y.value = Math.round(startY.value + event.translationY);
                    } else {
                        dragX.value = event.translationX;
                        dragY.value = event.translationY;
                    }

                    runOnJS(updateHoveredTarget)(event.absoluteX, event.absoluteY);
                })
                .onFinalize(() => {
                    runOnJS(finalizeDrag)();
                }),
        [clearHoveredTarget, dragX, dragY, finalizeDrag, isDragging, node.id, node.positionMode, onSelect, startX, startY, updateHoveredTarget, x, y]
    );

    const tap = useMemo(
        () =>
            Gesture.Tap()
                .maxDistance(8)
                .onEnd((_event, success) => {
                    if (success) {
                        runOnJS(toggleSelectNode)();
                    }
                })
                .requireExternalGestureToFail(pan),
        [pan, toggleSelectNode]
    );

    const gesture = useMemo(() => Gesture.Exclusive(pan, tap), [pan, tap]);

    const animatedPosition = useAnimatedStyle(() => {
        const baseStyle =
            node.positionMode === 'absolute'
                ? { position: 'absolute' as const, left: x.value, top: y.value }
                : { position: 'relative' as const };

        return {
            ...baseStyle,
            transform: [{ translateX: dragX.value }, { translateY: dragY.value }],
            zIndex: isDragging.value ? 1000 : 0,
        };
    });

    let content: React.ReactElement | null = null;

    switch (node.type) {
        case 'View':
            content = (
                <View
                    ref={viewRef}
                    onLayout={measureAndRegisterDropTarget}
                    style={[
                        s.view,
                        node.layoutMode === 'flex' ? styles.flexContainer : styles.absoluteContainer,
                        isDropTarget && styles.dropTargetIndicator,
                    ]}
                >
                    {node.children?.map((child) => (
                        <ComponentRenderer key={child.id} node={child} />
                    ))}
                </View>
            );
            break;
        case 'Text':
            content = <Text style={s.text}>{node.content}</Text>;
            break;
        case 'Button':
            content = (
                <TouchableOpacity activeOpacity={0.9} style={s.button}>
                    <Text style={s.buttonLabel}>{node.content}</Text>
                </TouchableOpacity>
            );
            break;
        case 'Image':
            content = (
                <View style={s.image}>
                    {node.content ? (
                        <Image source={{ uri: node.content }} style={s.imageFill} />
                    ) : (
                        <View style={s.imagePlaceholder}>
                            <Text style={s.imagePlaceholderIcon}>[img]</Text>
                        </View>
                    )}
                </View>
            );
            break;
    }

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View ref={wrapperRef as any} style={animatedPosition}>
                {content}
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    flexContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    absoluteContainer: {
        position: 'relative',
    },
    dropTargetIndicator: {
        borderColor: '#22C55E',
        borderWidth: 2,
        borderStyle: 'dashed',
        backgroundColor: 'rgba(34, 197, 94, 0.12)',
    },
});

export default ComponentRenderer;

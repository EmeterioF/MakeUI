/**
 * componentRenderer.tsx
 *
 * Renders a single ComponentNode and its children recursively.
 *
 * Gesture handling is fully delegated to useDragGesture — this file only
 * cares about WHAT to render, not HOW gestures work.
 *
 * Structure per node:
 *
 *   <GestureDetector gesture={gesture}>   ← RNGH v2: handles tap + drag race
 *     <Animated.View animatedStyle={...}> ← Reanimated: smooth drag offset
 *       <NativeView ref={layoutRef}>      ← measures bounds, applies styles
 *         {children}
 *       </NativeView>
 *     </Animated.View>
 *   </GestureDetector>
 */

import React, { memo } from 'react';
import { Image, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { getNodeStyle } from '@/renderer/nodeStyles';
import { ComponentNode, useComponentNodeStore } from '@/editor/componentNodeStore';
import { useDragGesture } from '@/renderer/useDragGesture';

type Props = {
    node: ComponentNode;
};

function ComponentRendererBase({ node }: Props) {
    // ── Selection / hover state from store ───────────────────────────────────
    const selectedID     = useComponentNodeStore(s => s.selectedID);
    const hoveredParentID = useComponentNodeStore(s => s.hoveredParentID);

    const isSelected   = selectedID === node.id;
    const isDropTarget = node.type === 'View' && hoveredParentID === node.id;

    // ── Styles ───────────────────────────────────────────────────────────────
    const s = getNodeStyle(node, isSelected, isDropTarget);

    // ── Gesture + animation (all logic lives in this hook) ───────────────────
    const { gesture, animatedStyle, layoutRef, reportLayout } = useDragGesture(node);

    // ── Render ───────────────────────────────────────────────────────────────
    //
    // Pattern: GestureDetector → Animated.View (drag offset) → native view (layout)
    //
    // The Animated.View wrapper must be separate from the native view that
    // receives the ref, because Reanimated's animated styles and ref forwarding
    // don't mix cleanly on all RN versions.

    switch (node.type) {
        case 'View':
            return (
                <GestureDetector gesture={gesture}>
                    {/* s.view is ViewStyle[] — spread it alongside animatedStyle */}
                    <Animated.View style={[...s.view, animatedStyle]}>
                        <View ref={layoutRef} onLayout={reportLayout} style={{ flex: 1 }}>
                            {node.children?.map(child => (
                                <ComponentRenderer key={child.id} node={child} />
                            ))}
                        </View>
                    </Animated.View>
                </GestureDetector>
            );

        case 'Text':
            return (
                <GestureDetector gesture={gesture}>
                    {/* Animated.View wraps the Text so the drag offset applies */}
                    <Animated.View style={animatedStyle}>
                        <Text ref={layoutRef} onLayout={reportLayout} style={s.text}>
                            {node.content}
                        </Text>
                    </Animated.View>
                </GestureDetector>
            );

        case 'Button':
            return (
                <GestureDetector gesture={gesture}>
                    <Animated.View style={[...s.button, animatedStyle]}>
                        <View ref={layoutRef} onLayout={reportLayout}
                              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={s.buttonLabel}>{node.content}</Text>
                        </View>
                    </Animated.View>
                </GestureDetector>
            );

        case 'Image':
            return (
                <GestureDetector gesture={gesture}>
                    <Animated.View style={[...s.image, animatedStyle]}>
                        <View ref={layoutRef} onLayout={reportLayout} style={{ flex: 1 }}>
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
                    </Animated.View>
                </GestureDetector>
            );
    }
}

const ComponentRenderer = memo(ComponentRendererBase);
export default ComponentRenderer;
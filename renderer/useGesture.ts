    /**
     * useGesture.ts
     *
     * Encapsulates ALL gesture logic for a single ComponentNode.
     *
     * Gestures used:
     *  - Gesture.Tap().runOnJS(true)
     *      Handles select / select-parent toggling on a quick tap.
     *      Fires immediately on finger lift — no waiting for the pan to decide.
     *
     *  - Gesture.Pan().activateAfterLongPress(250).runOnJS(true)
     *      Starts a drag only after the finger has been held still for 250 ms.
     *      Buttons get a slightly longer delay so quick taps don't accidentally drag.
     *      onStart fires the moment the threshold is crossed → haptic feedback here.
     *
     *  - Gesture.Exclusive(pan, tap)
     *      Pan is listed first so it has priority. If the pan activates (long press
     *      threshold met) it cancels the tap. If the finger lifts before the
     *      threshold, the pan never activates and the tap fires immediately —
     *      no artificial wait added to the tap unlike Gesture.Race.
     *
     * .runOnJS(true) on each gesture means all callbacks run on the JS thread,
     * so store calls and Haptics work as plain function calls with no bridging.
     */

    import { useRef } from 'react';
    import { Gesture } from 'react-native-gesture-handler';
    import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
    import * as Haptics from 'expo-haptics';
    import { useComponentNodeStore } from '@/editor/componentNodeStore';
    import { ComponentNode } from '@/editor/componentNodeTypes';

    // How long (ms) the finger must be held before a drag begins.
    const LONG_PRESS_TIME = 200;

export function useGesture(node: ComponentNode) {
    // This hook is the "runtime controller" for one rendered node:
    // 1) measure its screen bounds for hit-testing
    // 2) translate it visually while dragging
    // 3) ask the store for a preview target under the finger
    // 4) commit the drop when the gesture ends

    // ── Store actions ────────────────────────────────────────────────────────
        const selectedID         = useComponentNodeStore(s => s.selectedID);
        const selectNode         = useComponentNodeStore(s => s.selectNode);
        const selectParentNode   = useComponentNodeStore(s => s.selectParentNode);
        const previewDropTarget  = useComponentNodeStore(s => s.previewDropTarget);
        const clearDropTarget    = useComponentNodeStore(s => s.clearDropTarget);
        const dropNodeIntoParent = useComponentNodeStore(s => s.dropNodeIntoParent);
        const updateNodeLayout   = useComponentNodeStore(s => s.updateNodeLayout);

        // ── Drag offset (drives the visual translate during drag) ────────────────
        const translateX = useSharedValue(0);
        const translateY = useSharedValue(0);

        // Best drop-target found during the current drag. Plain ref is safe because
        // .runOnJS(true) guarantees callbacks run on the JS thread.
        const dropTargetRef = useRef<string | null>(null);

        // ── Layout measurement ───────────────────────────────────────────────────
        const layoutRef = useRef<any>(null);

        const reportLayout = () => {
            // measureInWindow gives absolute screen coordinates, which is important
            // because drag events also report absolute finger coordinates.
            layoutRef.current?.measureInWindow((x: number, y: number, w: number, h: number) => {
                updateNodeLayout(node.id, { x, y, width: w, height: h });
            });
        };


        const tapGesture = Gesture.Tap()
            .runOnJS(true)
            .maxDuration(LONG_PRESS_TIME - 50)
            .onEnd(() => {
                // Tapping an already-selected node walks selection up to its parent.
                if (selectedID === node.id) {
                    selectParentNode(node.id);
                } else {
                    selectNode(node.id);
                }
            });

        // ── Pan (drag) gesture ───────────────────────────────────────────────────
        const panGesture = Gesture.Pan()
            .runOnJS(true)
            .activateAfterLongPress(LONG_PRESS_TIME)
            .onStart(() => {
                // Fires the instant the long-press threshold is crossed and the
                // drag becomes active. A medium impact buzz tells the user the
                // node is "picked up" and ready to move.
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            })
            .onUpdate(event => {
                // Track visual drag position.
                translateX.value = event.translationX;
                translateY.value = event.translationY;

                // Ask the store which View currently contains the finger.
                // The returned id is cached locally so onEnd does not need to
                // recalculate the drop target from scratch.
                dropTargetRef.current = previewDropTarget(node.id, event.absoluteX, event.absoluteY);
            })
            .onEnd(event => {
                const target = dropTargetRef.current;

                // 1) Commit the drop if we ended over a valid parent.
                if (target !== null) {
                    dropNodeIntoParent(node.id, target, event.translationX, event.translationY);
                }

                // 2) Clear temporary drag/drop state.
                clearDropTarget();
                dropTargetRef.current = null;

                // 3) Reset the temporary visual translation.
                // If reparenting succeeded, the node will re-render in its new parent,
                // so this animation is effectively just cleanup.
                translateX.value = withTiming(0, { duration: 150 });
                translateY.value = withTiming(0, { duration: 150 });

                // Keep the moved node selected for immediate editing.
                selectNode(node.id);
            })
            .onFinalize(() => {
                // Runs if the gesture is cancelled mid-drag (e.g. incoming call).
                translateX.value = withTiming(0, { duration: 150 });
                translateY.value = withTiming(0, { duration: 150 });
                clearDropTarget();
                dropTargetRef.current = null;
            });

        // ── Exclusive: pan has priority, tap fires immediately if pan doesn't win ─
        //
        // Gesture.Exclusive(pan, tap):
        //   - Pan listed first → it has priority.
        //   - If the long-press threshold is met, pan activates and cancels the tap.
        //   - If the finger lifts before the threshold, the tap fires immediately
        //     with zero added latency (unlike Race which makes the tap wait).
        const gesture = Gesture.Exclusive(panGesture, tapGesture);

        // ── Animated style ───────────────────────────────────────────────────────
        const animatedStyle = useAnimatedStyle(() => ({
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        }));

        return {
            gesture,        // Pass to <GestureDetector gesture={gesture}>
            animatedStyle,  // Apply to the outermost <Animated.View>
            layoutRef,      // Attach as ref={layoutRef} to the inner native view
            reportLayout,   // Pass as onLayout={reportLayout}
        };
    }

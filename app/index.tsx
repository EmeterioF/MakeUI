import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useComponentNodeStore } from '@/editor/componentNodeStore';
import ComponentRenderer from '@/renderer/componentRenderer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@/components/bottomModal/bottomSheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export default function Index() {
    const componentTree = useComponentNodeStore((s) => s.componentTree);
    const canvasPositionMode = useComponentNodeStore((s) => s.canvasPositionMode);
    const canvasFlexStyle = useComponentNodeStore((s) => s.canvasFlexStyle);

    return (
        <GestureHandlerRootView style={styles.container}>
            <BottomSheetModalProvider>
                <View
                    style={[
                        styles.canvas,
                        canvasPositionMode === 'flow' && styles.canvasFlex,
                        canvasPositionMode === 'flow' && canvasFlexStyle,
                    ]}
                >
                    {componentTree.map((node) => (
                        <ComponentRenderer key={node.id} node={node} />
                    ))}
                </View>

                <BottomSheet />
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    canvas: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#ffffff',
    },
    canvasFlex: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
});

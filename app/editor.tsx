import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useComponentNodeStore } from '@/editor/componentNodeStore';
import ComponentRenderer from '@/renderer/componentRenderer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@/components/bottomModal/bottomSheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AiPreviewOverlay } from '@/components/ai/AiPreviewOverlay';
import { AiLoadingIndicator } from '@/components/ai/AiLoadingIndicator';
import { useAutoSave } from '@/components/editor/useAutoSave';
import { AiErrorToast } from '@/components/ai/AiErrorToast';
import { useAiSuggestionStore } from '@/editor/aiSuggestionStore';

export default function EditorScreen() {
    const componentTree = useComponentNodeStore((s) => s.componentTree);
    const canvasConfig = useComponentNodeStore((s) => s.canvasConfig);
    const { aiLoading, aiError } = useAiSuggestionStore();

    useAutoSave();

    return (
        <GestureHandlerRootView style={styles.container}>
            <BottomSheetModalProvider>
                <View
                    style={[
                        styles.canvas,
                        {
                            flexDirection: canvasConfig.style.flexDirection,
                            justifyContent: canvasConfig.style.justifyContent,
                            alignItems: canvasConfig.style.alignItems,
                            flexWrap: canvasConfig.style.flexWrap,
                            gap: canvasConfig.style.gap,
                            padding: canvasConfig.style.padding,
                            backgroundColor: canvasConfig.style.backgroundColor,
                        },
                    ]}
                >
                    {componentTree.map((node) => (
                        <ComponentRenderer key={node.id} node={node} />
                    ))}
                </View>

                <BottomSheet />
                <AiPreviewOverlay />
                <AiLoadingIndicator visible={aiLoading} />
                <AiErrorToast message={aiError} onDismiss={() => useAiSuggestionStore.setState({ aiError: null })} />
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
        backgroundColor: '#FFFFFF',
        marginBottom: '20%',
    },
});

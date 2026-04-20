import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useComponentNodeStore} from "@/editor/componentNodeStore";
import ComponentRenderer from "@/renderer/componentRenderer";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from "@/components/bottomModal/bottomSheet";
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet'

export default function Index() {
    const componentTree = useComponentNodeStore(s => s.componentTree);
    const canvasConfig = useComponentNodeStore(s => s.canvasConfig);


    return (
        <GestureHandlerRootView style={styles.container}>
            <BottomSheetModalProvider >
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
                        }
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
        backgroundColor: '#ffffff'
    },
    canvas: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        marginBottom:'20%'//makes room for the bottom-sheet
    },
    toolbar: {
        flexDirection: 'row',
        gap: 8,
        padding: 8,
        backgroundColor: '#ffffff',
    },
    btn: {
        flex: 1,
        backgroundColor: '#333',
        borderRadius: 6,
        paddingVertical: 10,
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontSize: 13,
    },
});

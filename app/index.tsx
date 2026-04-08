import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useComponentNodeStore } from '@/editor/componentNodeStore';
import ComponentRenderer from "@/renderer/componentRenderer";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import EditBottomSheet from "@/components/editBottomSheet";


export default function Index() {

    const selectedID= useComponentNodeStore(s => s.selectedID);

    const addNode= useComponentNodeStore(s => s.addNode);
    const deleteNode= useComponentNodeStore(s => s.deleteNode);

    const componentTree = useComponentNodeStore(s => s.componentTree);


    return (
        <GestureHandlerRootView style={styles.container}>
            {/* Canvas */}
            <View style={styles.canvas}>
                {componentTree.map((node) => (
                    <ComponentRenderer
                        key={node.id}
                        node={node}
                    />
                ))}
            </View>

            {/* BOTTOM SHEET - PROPERTIES AND ADD COMPONENTS PANEL */}
            <EditBottomSheet/>

        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    canvas: {
        flex: 1,
        position: 'relative',   // needed so absolute children position correctly
        backgroundColor: '#fff',
    },
    toolbar: {
        flexDirection: 'row',
        gap: 8,
        padding: 8,
        backgroundColor: '#f5f5f5',
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
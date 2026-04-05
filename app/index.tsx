import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useComponentNodeStore } from '@/editor/componentNodeStore';
import { ViewDefault, TextDefault, ButtonDefault, ImageDefault } from '@/editor/defaultNodes'
import ComponentRenderer from "@/renderer/componentRenderer";
import { nanoid } from 'nanoid/non-secure';

export default function Index() {

    const selectedID= useComponentNodeStore(s => s.selectedID);

    const addNode= useComponentNodeStore(s => s.addNode);
    const deleteNode= useComponentNodeStore(s => s.deleteNode);

    const componentTree = useComponentNodeStore(s => s.componentTree);

    return (
        <View style={styles.container}>

            {/* Canvas */}
            <View style={styles.canvas}>
                {componentTree.map((node) => (
                    <ComponentRenderer
                        key={node.id}
                        node={node}
                    />
                ))}
            </View>

            {/* Add buttons */}
            <View style={styles.toolbar}>
                <Pressable style={styles.btn} onPress={() => addNode({ ...ViewDefault,   id: nanoid() }, null)}>
                    <Text style={styles.btnText}>+ View</Text>
                </Pressable>
                <Pressable style={styles.btn} onPress={() => addNode({ ...ImageDefault,  id: nanoid() }, null)}>
                    <Text style={styles.btnText}>+ Image</Text>
                </Pressable>
                <Pressable style={styles.btn} onPress={() => addNode({ ...TextDefault,   id: nanoid() }, null)}>
                    <Text style={styles.btnText}>+ Text</Text>
                </Pressable>
                <Pressable style={styles.btn} onPress={() => addNode({ ...ButtonDefault, id: nanoid() }, null)}>
                    <Text style={styles.btnText}>+ Button</Text>
                </Pressable>

                <Pressable style={styles.btn} onPress={() => deleteNode(selectedID)}>
                    <Text style={styles.btnText}>+ Button</Text>
                </Pressable>
            </View>

        </View>
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
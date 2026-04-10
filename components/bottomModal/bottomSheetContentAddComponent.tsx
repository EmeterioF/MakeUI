import {View, StyleSheet, Text, Pressable} from 'react-native'
import {useComponentNodeStore} from "@/editor/componentNodeStore";
import {ViewDefault, TextDefault, ImageDefault, ButtonDefault} from "@/editor/defaultNodes";

export default function BottomSheetContentAddComponent() {

    const addNode= useComponentNodeStore(s => s.addNode);

    return (
        <View style={firstModal.container}>
            {[
                { label: 'VIEW',   action: () => addNode(ViewDefault) },
                { label: 'TEXT',   action: () => addNode(TextDefault) },
                { label: 'BUTTON', action: () => addNode(ButtonDefault) },
                { label: 'IMAGE',  action: () => addNode(ImageDefault) },
            ].map(({ label, action }) => (
                <Pressable
                    key={label}
                    style={({ pressed }) => [
                        firstModal.addButton,
                        pressed && firstModal.addButtonPressed
                    ]}
                    onPress={action}
                >
                    <Text style={firstModal.addButtonText} numberOfLines={1}  >
                        {label}
                    </Text>
                </Pressable>
            ))}
        </View>
    )
}

const firstModal = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
    },
    addButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 999,
        backgroundColor: '#1E1E1E',
        borderWidth: 1,
        borderColor: '#333',
    },
    addButtonPressed: {
        transform: [{ scale: 0.96 }],
        backgroundColor: '#5E35B1',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
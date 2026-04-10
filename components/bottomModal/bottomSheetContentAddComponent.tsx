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
                    <Text style={firstModal.addButtonText}  adjustsFontSizeToFit>
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
        paddingHorizontal: 12,
        gap: 8,
    },
    addButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#6200EE',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonPressed: {
        backgroundColor: '#3700B3',
        opacity: 0.9,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },

})
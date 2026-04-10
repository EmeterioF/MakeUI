import {View, StyleSheet, Text, Pressable} from 'react-native'

type Props = {
    onBack: () => void,
    onDelete: () => void
}

export default  function BottomSheetContentEditProperties({onBack, onDelete}:Props) {

    return (
        <>
            <View style={secondModal.actionContainer}>
                {[
                    { label: "BACK", action: onBack, variant: 'secondary' },
                    { label: "🗑️", action: onDelete, variant: 'danger' },
                ].map((button, index) => (
                    <Pressable
                        key={index}
                        onPress={button.action}
                        style={({ pressed }) => [
                            secondModal.button,
                            button.variant === 'secondary' && secondModal.buttonSecondary,
                            button.variant === 'danger' && secondModal.buttonDanger,
                            pressed && secondModal.buttonPressed,
                        ]}
                    >
                        <Text style={secondModal.buttonText}>
                            {button.label}
                        </Text>
                    </Pressable>
                ))}
            </View>
            <Text style={secondModal.propertiesLabel}>PROPERTIES</Text>
        </>
    )
}

const secondModal = StyleSheet.create({
    actionContainer: {
        flexDirection: 'row',
        gap: 150,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonSecondary: {
        backgroundColor: '#e1b85a',
        borderWidth: 1.5,
    },
    buttonDanger: {
        backgroundColor: '#B00020',
    },
    buttonPressed: {
        opacity: 0.75,
    },
    buttonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    propertiesLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        paddingBottom: 12,
        color: '#1a1a1a',
    },
});
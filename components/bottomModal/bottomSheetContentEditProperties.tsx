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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
        gap: 100
    },

    // Group left/right if needed later
    leftGroup: {
        flexDirection: 'row',
    },

    button: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999, // pill shape
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonSecondary: {
        backgroundColor: '#F2F2F2',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },

    buttonDanger: {
        backgroundColor: '#FFECEC',
        borderWidth: 1,
        borderColor: '#FFB3B3',
    },

    buttonPressed: {
        transform: [{ scale: 0.95 }],
    },

    buttonText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#333',
    },

    buttonTextDanger: {
        color: '#D32F2F',
    },

    propertiesLabel: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
        paddingHorizontal: 16,
        paddingBottom: 8,
        color: '#888',
    },
});
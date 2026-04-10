import { View, StyleSheet, Text, Pressable, TextInput } from 'react-native'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useState } from 'react'
import {properties} from "@/components/bottomModal/editProperties";

type Props = {
    onBack: () => void,
    onDelete: () => void
}

export default function BottomSheetContentEditProperties({ onBack, onDelete }: Props) {

    const [selectedHeader, setSelectedHeader] = useState(properties[0].header)

    // stores all edited values
    const [values, setValues] = useState<Record<string, any>>({})

    const activeSection = properties.find(p => p.header === selectedHeader)

    const handleChange = (key: string, value: string) => {
        setValues(prev => ({
            ...prev,
            [key]: value
        }))
    }

    return (
        <BottomSheetScrollView>

            {/* ACTION BUTTONS */}
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

            {/* HEADER TABS */}
            <View style={secondModal.headerTabs}>
                {properties.map((section) => (
                    <Pressable
                        key={section.header}
                        onPress={() => setSelectedHeader(section.header)}
                        style={[
                            secondModal.tabButton,
                            selectedHeader === section.header && secondModal.tabButtonActive
                        ]}
                    >
                        <Text style={[
                            secondModal.tabText,
                            selectedHeader === section.header && secondModal.tabTextActive
                        ]}>
                            {section.header}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* PROPERTIES */}
            <View>
                {activeSection?.styles.map((item) => (
                    <View key={item.key} style={secondModal.propertyRow}>

                        <Text style={secondModal.propertyLabel}>
                            {item.label}
                        </Text>

                        <TextInput
                            value={values[item.key] ?? ''}
                            onChangeText={(text) => handleChange(item.key, text)}
                            placeholder={item.key}
                            style={secondModal.input}
                        />
                    </View>
                ))}
            </View>

        </BottomSheetScrollView>
    )
}

const secondModal = StyleSheet.create({

    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        gap: 12,
        backgroundColor: '#fff',
    },

    button: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonSecondary: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    buttonDanger: {
        backgroundColor: '#FEE2E2',
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },

    buttonPressed: {
        transform: [{ scale: 0.96 }],
        opacity: 0.8,
    },

    buttonText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#111827',
    },

    buttonTextDanger: {
        color: '#B91C1C',
    },

    /* =========================
       HEADER TABS (IMPORTANT)
    ========================== */

    headerTabs: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        backgroundColor: '#fff',
    },

    tabButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: 'transparent',
    },

    tabButtonActive: {
        backgroundColor: '#111827',
        borderColor: '#111827',
    },

    tabText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
    },

    tabTextActive: {
        color: '#FFFFFF',
    },

    /* =========================
       PROPERTY LIST
    ========================== */

    propertiesLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 6,
        textTransform: 'uppercase',
    },

    propertyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        backgroundColor: '#FFFFFF',
    },

    propertyLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#111827',
        flex: 1,
    },

    input: {
        minWidth: 110,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        fontSize: 13,
        color: '#111827',
        backgroundColor: '#FAFAFA',
        textAlign: 'right',
    },
});
import { View, StyleSheet, Text, Pressable, TextInput, Modal } from 'react-native'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useState } from 'react'
import { useComponentNodeStore, findNode } from "@/editor/componentNodeStore"
import { properties } from "@/components/bottomModal/editProperties"
import ColorPicker, { Panel1, Swatches } from 'reanimated-color-picker'

type Props = {
    onBack: () => void,
    onDelete: () => void
}

// ==================== NUMERIC INPUT ====================
function NumericInput({ value, onChangeText, onStep }: { value: string; onChangeText: (t: string) => void; onStep: (delta: number) => void }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable onPress={() => onStep(-1)} style={secondModal.stepBtn}>
                <Text style={{ fontSize: 14, fontWeight: '600' }}>−</Text>
            </Pressable>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                style={secondModal.inputSmall}
                keyboardType="numeric"
            />
            <Pressable onPress={() => onStep(1)} style={secondModal.stepBtn}>
                <Text style={{ fontSize: 14, fontWeight: '600' }}>+</Text>
            </Pressable>
        </View>
    )
}

// ==================== COLOR PICKER ====================
function ColorPickerInput({ value, onChange }: { value: string; onChange: (color: string) => void }) {
    const [showPicker, setShowPicker] = useState(false)

    return (
        <>
            <Pressable
                onPress={() => setShowPicker(true)}
                style={[
                    secondModal.colorButton,
                    { backgroundColor: value || '#FFFFFF', borderColor: value ? '#333' : '#ddd' }
                ]}
            >
                <Text style={secondModal.colorValue}>{value || 'Pick'}</Text>
            </Pressable>

            <Modal
                visible={showPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPicker(false)}
            >
                <Pressable
                    style={secondModal.colorPickerOverlay}
                    onPress={() => setShowPicker(false)}
                >
                    <View style={secondModal.colorPickerContainer}>
                        <Pressable onPress={(e) => e.stopPropagation()}>
                            <View style={secondModal.colorPickerHeader}>
                                <Text style={secondModal.colorPickerTitle}>Pick a Color</Text>
                                <Pressable onPress={() => setShowPicker(false)}>
                                    <Text style={secondModal.colorPickerClose}>✕</Text>
                                </Pressable>
                            </View>

                            <ColorPicker
                                value={value || '#FFFFFF'}
                                onComplete={({ hex }) => {
                                    onChange(hex)
                                    setShowPicker(false)
                                }}
                            >
                                <Panel1 />
                                <Swatches />
                            </ColorPicker>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </>
    )
}

// ==================== DROPDOWN SELECT ====================
function SelectInput({ value, options, onChange }: { value: string; options: string[]; onChange: (val: string) => void }) {
    const [expanded, setExpanded] = useState(false)

    return (
        <View>
            <Pressable
                onPress={() => setExpanded(!expanded)}
                style={secondModal.selectButton}
            >
                <Text style={secondModal.selectButtonText}>{value || 'Select...'}</Text>
                <Text style={{ fontSize: 12 }}>▼</Text>
            </Pressable>

            {expanded && (
                <View style={secondModal.selectDropdown}>
                    {options.map(option => (
                        <Pressable
                            key={option}
                            onPress={() => {
                                onChange(option)
                                setExpanded(false)
                            }}
                            style={[
                                secondModal.selectOption,
                                value === option && secondModal.selectOptionActive
                            ]}
                        >
                            <Text style={[
                                secondModal.selectOptionText,
                                value === option && secondModal.selectOptionTextActive
                            ]}>
                                {option}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    )
}

// ==================== MAIN COMPONENT ====================
export default function BottomSheetContentEditProperties({ onBack, onDelete }: Props) {

    const { componentTree, selectedID, editNode } = useComponentNodeStore()

    const [selectedHeader, setSelectedHeader] = useState(properties[0].header)

    const selectedNode = findNode(componentTree, selectedID)

    const activeSection = properties.find(p => p.header === selectedHeader)

    const ROOT_KEYS = new Set(['content', 'x', 'y'])

    const getValue = (key: string) => {
        if (!selectedNode) return ''
        if (ROOT_KEYS.has(key)) return (selectedNode as any)[key] ?? ''
        return selectedNode.style?.[key as keyof typeof selectedNode.style] ?? ''
    }

    const handleChange = (key: string, value: string) => {
        if (!selectedNode) return

        const isRoot = ROOT_KEYS.has(key)

        editNode(selectedNode.id, isRoot
            ? { [key]: ['x', 'y'].includes(key) ? Number(value) : value }
            : {
                style: {
                    ...selectedNode.style,
                    [key]: isNaN(Number(value)) ? value : Number(value)
                }
            }
        )
    }

    const stepValue = (key: string, delta: number) => {
        const current = Number(getValue(key)) || 0
        handleChange(key, String(current + delta))
    }

    return (
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 40 }}>

            {/* ACTION BAR */}
            <View style={secondModal.actionContainer}>
                <Pressable onPress={onBack} style={secondModal.buttonSecondary}>
                    <Text style={secondModal.buttonText}>BACK</Text>
                </Pressable>
                <Pressable onPress={onDelete} style={secondModal.buttonDanger}>
                    <Text style={secondModal.buttonTextDanger}>🗑️</Text>
                </Pressable>
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

            {/* PROPERTY INPUTS */}
            {activeSection?.styles.map(item => (
                <View key={item.key} style={secondModal.propertyRow}>
                    <Text style={secondModal.propertyLabel}>{item.label}</Text>

                    {item.type === 'number' ? (
                        <NumericInput
                            value={String(getValue(item.key))}
                            onChangeText={(t) => handleChange(item.key, t)}
                            onStep={(delta) => stepValue(item.key, delta)}
                        />
                    ) : item.type === 'color' ? (
                        <ColorPickerInput
                            value={getValue(item.key)}
                            onChange={(color) => handleChange(item.key, color)}
                        />
                    ) : item.type === 'select' ? (
                        <SelectInput
                            value={getValue(item.key)}
                            options={(item as any).options}
                            onChange={(val) => handleChange(item.key, val)}
                        />
                    ) : (
                        <TextInput
                            value={String(getValue(item.key))}
                            onChangeText={(t) => handleChange(item.key, t)}
                            style={secondModal.input}
                            placeholder="Enter text..."
                            placeholderTextColor="#9CA3AF"
                        />
                    )}
                </View>
            ))}

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

    buttonSecondary: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
    },

    buttonDanger: {
        backgroundColor: '#FEE2E2',
        borderWidth: 1,
        borderColor: '#FCA5A5',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        alignItems: 'center',
    },

    buttonText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#111827',
    },

    buttonTextDanger: {
        fontSize: 16,
        color: '#B91C1C',
    },

    headerTabs: {
        justifyContent: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        backgroundColor: '#fff',
        gap: 10
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

    inputSmall: {
        width: 60,
        paddingVertical: 4,
        paddingHorizontal: 6,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 6,
        fontSize: 13,
        textAlign: 'center',
        backgroundColor: '#FAFAFA',
    },

    stepBtn: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    /* ========== COLOR PICKER ========== */
    colorPickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    colorPickerContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        width: '85%',
        maxWidth: 320,
    },

    colorPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },

    colorPickerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },

    colorPickerClose: {
        fontSize: 24,
        color: '#6B7280',
        padding: 4,
    },

    colorButton: {
        width: 60,
        height: 40,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },

    colorValue: {
        fontSize: 10,
        fontWeight: '600',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },

    /* ========== SELECT DROPDOWN ========== */
    selectButton: {
        minWidth: 110,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        backgroundColor: '#FAFAFA',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    selectButtonText: {
        fontSize: 13,
        color: '#111827',
        fontWeight: '500',
    },

    selectDropdown: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        marginTop: 4,
        overflow: 'hidden',
        maxHeight: 180,
    },

    selectOption: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },

    selectOptionActive: {
        backgroundColor: '#F3F4F6',
    },

    selectOptionText: {
        fontSize: 13,
        color: '#6B7280',
    },

    selectOptionTextActive: {
        color: '#111827',
        fontWeight: '600',
    },
});
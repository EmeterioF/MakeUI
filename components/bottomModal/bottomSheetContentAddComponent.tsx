import {View, StyleSheet, Text, Pressable} from 'react-native'
import {useComponentNodeStore} from "@/editor/componentNodeStore";
import {ViewDefault, TextDefault, ImageDefault, ButtonDefault} from "@/editor/defaultNodes";
import { useMemo, useState } from 'react';

function SelectChipRow({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string | undefined;
    options: string[];
    onChange: (next: string) => void;
}) {
    return (
        <View style={firstModal.settingsRow}>
            <Text style={firstModal.modeLabel}>{label}</Text>
            <View style={firstModal.chipsWrap}>
                {options.map((option) => (
                    <Pressable
                        key={`${label}-${option}`}
                        onPress={() => onChange(option)}
                        style={[firstModal.chipBtn, value === option && firstModal.chipBtnActive]}
                    >
                        <Text style={[firstModal.chipText, value === option && firstModal.chipTextActive]}>
                            {option}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

export default function BottomSheetContentAddComponent() {

    const addNode= useComponentNodeStore(s => s.addNode);
    const canvasPositionMode = useComponentNodeStore(s => s.canvasPositionMode);
    const setCanvasPositionMode = useComponentNodeStore(s => s.setCanvasPositionMode);
    const canvasFlexStyle = useComponentNodeStore(s => s.canvasFlexStyle);
    const setCanvasFlexStyle = useComponentNodeStore(s => s.setCanvasFlexStyle);

    const [viewLayoutMode, setViewLayoutMode] = useState<'absolute' | 'flex'>('absolute');

    const viewTemplate = useMemo(() => ({
        ...ViewDefault,
        layoutMode: viewLayoutMode,
    }), [viewLayoutMode]);

    return (
        <View style={firstModal.container}>
            <View style={firstModal.settingsCard}>
                <Text style={firstModal.cardTitle}>Canvas Layout</Text>
                <View style={firstModal.modeRow}>
                    <Text style={firstModal.modeLabel}>Mode</Text>
                    <View style={firstModal.modeToggle}>
                        <Pressable
                            onPress={() => setCanvasPositionMode('absolute')}
                            style={[firstModal.modeBtn, canvasPositionMode === 'absolute' && firstModal.modeBtnActive]}
                        >
                            <Text style={[firstModal.modeText, canvasPositionMode === 'absolute' && firstModal.modeTextActive]}>
                                ABS
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setCanvasPositionMode('flow')}
                            style={[firstModal.modeBtn, canvasPositionMode === 'flow' && firstModal.modeBtnActive]}
                        >
                            <Text style={[firstModal.modeText, canvasPositionMode === 'flow' && firstModal.modeTextActive]}>
                                FLEX
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {canvasPositionMode === 'flow' && (
                    <>
                        <SelectChipRow
                            label="Direction"
                            value={canvasFlexStyle.flexDirection}
                            options={['column', 'row', 'column-reverse', 'row-reverse']}
                            onChange={(v) => setCanvasFlexStyle({ flexDirection: v as any })}
                        />
                        <SelectChipRow
                            label="Justify"
                            value={canvasFlexStyle.justifyContent}
                            options={['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly']}
                            onChange={(v) => setCanvasFlexStyle({ justifyContent: v as any })}
                        />
                        <SelectChipRow
                            label="Align Items"
                            value={canvasFlexStyle.alignItems}
                            options={['stretch', 'flex-start', 'center', 'flex-end', 'baseline']}
                            onChange={(v) => setCanvasFlexStyle({ alignItems: v as any })}
                        />
                        <SelectChipRow
                            label="Wrap"
                            value={canvasFlexStyle.flexWrap}
                            options={['nowrap', 'wrap', 'wrap-reverse']}
                            onChange={(v) => setCanvasFlexStyle({ flexWrap: v as any })}
                        />
                        <SelectChipRow
                            label="Align Content"
                            value={canvasFlexStyle.alignContent}
                            options={['stretch', 'flex-start', 'center', 'flex-end', 'space-between', 'space-around']}
                            onChange={(v) => setCanvasFlexStyle({ alignContent: v as any })}
                        />
                    </>
                )}
            </View>

            <View style={firstModal.settingsCard}>
                <Text style={firstModal.cardTitle}>Add View</Text>
            <View style={firstModal.modeRow}>
                <Text style={firstModal.modeLabel}>View Layout</Text>
                <View style={firstModal.modeToggle}>
                    <Pressable
                        onPress={() => setViewLayoutMode('absolute')}
                        style={[firstModal.modeBtn, viewLayoutMode === 'absolute' && firstModal.modeBtnActive]}
                    >
                        <Text style={[firstModal.modeText, viewLayoutMode === 'absolute' && firstModal.modeTextActive]}>
                            ABS
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setViewLayoutMode('flex')}
                        style={[firstModal.modeBtn, viewLayoutMode === 'flex' && firstModal.modeBtnActive]}
                    >
                        <Text style={[firstModal.modeText, viewLayoutMode === 'flex' && firstModal.modeTextActive]}>
                            FLEX
                        </Text>
                    </Pressable>
                </View>
            </View>
            </View>

            {[
                { label: 'VIEW',   action: () => addNode(viewTemplate) },
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
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 12,
    },
    settingsCard: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 8,
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#0F172A',
    },
    modeRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingsRow: {
        width: '100%',
        gap: 6,
    },
    modeLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#111827',
    },
    chipsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    chipBtn: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        backgroundColor: '#FFFFFF',
    },
    chipBtnActive: {
        backgroundColor: '#0F172A',
        borderColor: '#0F172A',
    },
    chipText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#334155',
    },
    chipTextActive: {
        color: '#FFFFFF',
    },
    modeToggle: {
        flexDirection: 'row',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    modeBtn: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#F8FAFC',
    },
    modeBtnActive: {
        backgroundColor: '#111827',
    },
    modeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#334155',
    },
    modeTextActive: {
        color: '#FFFFFF',
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

import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useComponentNodeStore } from '@/editor/componentNodeStore';
import { ButtonDefault, ImageDefault, TextDefault, ViewDefault } from '@/editor/defaultNodes';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SegmentedControl } from '@/components/bottomModal/common/SegmentedControl';
import { generateSaveAndShareComponentCode } from '@/services/componentCodeShareService';

export default function BottomSheetContentAddComponent() {
    const addNode = useComponentNodeStore((s) => s.addNode);
    const componentTree = useComponentNodeStore((s) => s.componentTree);
    const canvasConfig = useComponentNodeStore((s) => s.canvasConfig);
    const updateCanvasConfig = useComponentNodeStore((s) => s.updateCanvasConfig);
    const [isSharing, setIsSharing] = useState(false);

    const addButtons = [
        { label: 'VIEW', action: () => addNode(ViewDefault) },
        { label: 'TEXT', action: () => addNode(TextDefault) },
        { label: 'BUTTON', action: () => addNode(ButtonDefault) },
        { label: 'IMAGE', action: () => addNode(ImageDefault) },
    ];

    const handleShare = async () => {
        if (isSharing) return;
        setIsSharing(true);
        try {
            await generateSaveAndShareComponentCode(componentTree, canvasConfig);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to share generated code.';
            Alert.alert('Share failed', message);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <BottomSheetScrollView style={styles.scroll} contentContainerStyle={styles.container}>
            <View style={styles.buttonRow}>
                {addButtons.map(({ label, action }) => (
                    <Pressable
                        key={label}
                        style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
                        onPress={action}
                    >
                        <Text style={styles.addButtonText} numberOfLines={1}>
                            {label}
                        </Text>
                    </Pressable>
                ))}
            </View>



            <View style={styles.canvasSection}>
                <Text style={styles.sectionTitle}>Canvas</Text>
                <SegmentedControl
                    title="Direction"
                    value={canvasConfig.style.flexDirection}
                    options={[
                        { label: 'Row', value: 'row' },
                        { label: 'Column', value: 'column' },
                    ]}
                    onChange={(flexDirection) => updateCanvasConfig({ style: { flexDirection } })}
                    rowStyle={styles.settingRow}
                    labelStyle={styles.settingLabel}
                    containerStyle={styles.segmentedContainer}
                    itemStyle={styles.segmentedItem}
                    activeItemStyle={styles.segmentedItemActive}
                    textStyle={styles.segmentedText}
                    activeTextStyle={styles.segmentedTextActive}
                />

                <SegmentedControl
                    title="Wrap"
                    value={canvasConfig.style.flexWrap}
                    options={[
                        { label: 'No Wrap', value: 'nowrap' },
                        { label: 'Wrap', value: 'wrap' },
                    ]}
                    onChange={(flexWrap) => updateCanvasConfig({ style: { flexWrap } })}
                    rowStyle={styles.settingRow}
                    labelStyle={styles.settingLabel}
                    containerStyle={styles.segmentedContainer}
                    itemStyle={styles.segmentedItem}
                    activeItemStyle={styles.segmentedItemActive}
                    textStyle={styles.segmentedText}
                    activeTextStyle={styles.segmentedTextActive}
                />

                <SegmentedControl
                    title="Align"
                    value={canvasConfig.style.alignItems}
                    options={[
                        { label: 'Start', value: 'flex-start' },
                        { label: 'Center', value: 'center' },
                        { label: 'End', value: 'flex-end' },
                        { label: 'Stretch', value: 'stretch' },
                    ]}
                    onChange={(alignItems) => updateCanvasConfig({ style: { alignItems } })}
                    rowStyle={styles.settingRow}
                    labelStyle={styles.settingLabel}
                    containerStyle={styles.segmentedContainer}
                    itemStyle={styles.segmentedItem}
                    activeItemStyle={styles.segmentedItemActive}
                    textStyle={styles.segmentedText}
                    activeTextStyle={styles.segmentedTextActive}
                />
            </View>


            <Pressable
                style={({ pressed }) => [
                    styles.shareButton,
                    pressed && styles.shareButtonPressed,
                    isSharing && styles.shareButtonDisabled,
                ]}
                onPress={handleShare}
                disabled={isSharing}
            >
                <Text style={styles.shareButtonText}>{isSharing ? 'SHARING...' : 'SHARE RN CODE'}</Text>
            </Pressable>
        </BottomSheetScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    container: {
        width: '100%',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
        gap: 14,
    },
    buttonRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center'
    },
    addButton: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#111827',
    },
    addButtonPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.97 }],
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.4,
    },
    shareButton: {
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#0EA5E9',
        backgroundColor: '#E0F2FE',
        alignItems: 'center',
    },
    shareButtonPressed: {
        opacity: 0.85,
    },
    shareButtonDisabled: {
        opacity: 0.65,
    },
    shareButtonText: {
        color: '#075985',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.6,
    },
    canvasSection: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        padding: 12,
        gap: 10,
        backgroundColor: '#FFFFFF',
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111827',
    },
    settingRow: {
        gap: 6,
    },
    settingLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
    },
    segmentedContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    segmentedItem: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 999,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    segmentedItemActive: {
        backgroundColor: '#111827',
        borderColor: '#111827',
    },
    segmentedText: {
        color: '#374151',
        fontSize: 11,
        fontWeight: '600',
    },
    segmentedTextActive: {
        color: '#FFFFFF',
    },
});

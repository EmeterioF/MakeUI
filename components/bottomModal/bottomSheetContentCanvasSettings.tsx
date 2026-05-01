import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SegmentedControl } from '@/components/bottomModal/common/SegmentedControl';
import { useComponentNodeStore } from '@/editor/componentNodeStore';

type Props = {
    onBack: () => void;
};

export default function BottomSheetContentCanvasSettings({ onBack }: Props) {
    const canvasConfig = useComponentNodeStore((s) => s.canvasConfig);
    const updateCanvasConfig = useComponentNodeStore((s) => s.updateCanvasConfig);

    return (
        <BottomSheetScrollView style={styles.scroll} contentContainerStyle={styles.container}>
            <View style={styles.headerRow}>
                <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.pressed]} onPress={onBack}>
                    <Text style={styles.backButtonText}>BACK</Text>
                </Pressable>
                <Text style={styles.title}>Canvas Settings</Text>
            </View>
            <View style={styles.canvasSection}>
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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    backButton: {
        minHeight: 40,
        minWidth: 76,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C4B5FD',
        backgroundColor: '#EDE9FE',
    },
    backButtonText: {
        color: '#5B21B6',
        fontSize: 11,
        fontWeight: '800',
    },
    title: {
        flex: 1,
        color: '#111827',
        fontSize: 16,
        fontWeight: '800',
    },
    canvasSection: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        gap: 12,
        backgroundColor: '#FFFFFF',
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
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    segmentedItemActive: {
        backgroundColor: '#FFEDD5',
        borderColor: '#FDBA74',
    },
    segmentedText: {
        color: '#374151',
        fontSize: 11,
        fontWeight: '600',
    },
    segmentedTextActive: {
        color: '#9A3412',
    },
    pressed: {
        opacity: 0.85,
        transform: [{ scale: 0.97 }],
    },
});

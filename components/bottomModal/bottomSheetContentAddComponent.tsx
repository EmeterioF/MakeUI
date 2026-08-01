import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useComponentNodeStore } from '@/editor/componentNodeStore';
import { ButtonDefault, ImageDefault, ScrollViewDefault, TextDefault, ViewDefault } from '@/editor/defaultNodes';
import { useEditorFileActions } from '@/components/editor/useEditorFileActions';
import { useAiSuggestionStore } from '@/editor/aiSuggestionStore';

type Props = {
    onOpenCanvasSettings: () => void;
    onOpenTutorial: () => void;
};

export default function BottomSheetContentAddComponent({ onOpenCanvasSettings, onOpenTutorial }: Props) {
    const addNode = useComponentNodeStore((s) => s.addNode);
    const currentFileName = useComponentNodeStore((s) => s.currentFileName);
    const setCurrentFileName = useComponentNodeStore((s) => s.setCurrentFileName);
    const { isSaving, saveAndGoHome, saveAndShare } = useEditorFileActions();
    const { fetchSuggestions, aiLoading } = useAiSuggestionStore();

    const addButtons = [
        { label: 'VIEW', action: () => { addNode(ViewDefault); } },
        { label: 'TEXT', action: () => { addNode(TextDefault); } },
        { label: 'BUTTON', action: () => { addNode(ButtonDefault); } },
        { label: 'IMAGE', action: () => { addNode(ImageDefault); } },
        { label: 'SCROLLVIEW', action: () => { addNode(ScrollViewDefault); } },
    ];

    return (
        <BottomSheetScrollView style={styles.scroll} contentContainerStyle={styles.container}>

            <View style={styles.addSection}>
                <Text style={styles.sectionLabel}>ADD COMPONENT</Text>
                <View style={styles.buttonGrid}>
                    {addButtons.map(({ label, action }) => (
                        <Pressable
                            key={label}
                            style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}
                            onPress={action}
                        >
                            <Text style={styles.addButtonText} numberOfLines={1}>
                                {label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            <View style={styles.fileRow}>
                <TextInput
                    value={currentFileName}
                    onChangeText={setCurrentFileName}
                    placeholder="File name"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.fileNameInput}
                />
            </View>

            <View style={styles.utilityRow}>
                <Pressable
                    style={({ pressed }) => [styles.utilityBtn, pressed && styles.buttonPressed]}
                    onPress={onOpenCanvasSettings}
                >
                    <Text style={styles.utilityBtnText} numberOfLines={1}>CANVAS SETTINGS</Text>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [styles.utilityBtn, pressed && styles.buttonPressed, isSaving && styles.disabled]}
                    onPress={saveAndShare}
                    disabled={isSaving}
                >
                    <Text style={styles.utilityBtnText} numberOfLines={1}>SHARE</Text>
                </Pressable>
            </View>

            <Pressable
                style={({ pressed }) => [styles.enhanceBtn, pressed && styles.buttonPressed, aiLoading && styles.enhanceBtnDisabled, isSaving && styles.disabled]}
                onPress={fetchSuggestions}
                disabled={aiLoading || isSaving}
            >
                <Text style={styles.enhanceBtnText}>
                    {aiLoading ? 'ENHANCING…' : 'ENHANCE LAYOUT'}
                </Text>
            </Pressable>

            <View style={styles.footerRow}>
                <Pressable
                    style={({ pressed }) => [styles.footerBack, pressed && styles.pressedFooter]}
                    onPress={saveAndGoHome}
                    disabled={isSaving}
                >
                    <Text style={styles.footerBackText}>BACK</Text>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [styles.footerHelp, pressed && styles.pressedFooter]}
                    onPress={onOpenTutorial}
                    accessibilityLabel="Open tutorial"
                >
                    <Text style={styles.footerHelpText}>?</Text>
                </Pressable>
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
        paddingTop: 10,
        paddingBottom: 24,
        gap: 14,
    },
    addSection: {
        gap: 10,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.8,
        color: '#9CA3AF',
    },
    buttonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    addButton: {
        flexGrow: 1,
        flexBasis: '30%',
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#111827',
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    fileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fileNameInput: {
        flex: 1,
        minWidth: 0,
        minHeight: 44,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        color: '#111827',
        fontSize: 14,
        fontWeight: '600',
        backgroundColor: '#FFFFFF',
    },
    utilityRow: {
        flexDirection: 'row',
        gap: 8,
    },
    utilityBtn: {
        flex: 1,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
    },
    utilityBtnText: {
        color: '#374151',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    enhanceBtn: {
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
    },
    enhanceBtnDisabled: {
        backgroundColor: '#94B8E6',
    },
    enhanceBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 0.5,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    footerBack: {
        minHeight: 32,
        paddingHorizontal: 4,
        justifyContent: 'center',
    },
    footerBackText: {
        color: '#6B7280',
        fontSize: 13,
        fontWeight: '600',
    },
    footerHelp: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    footerHelpText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '700',
    },
    buttonPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.97 }],
    },
    pressedFooter: {
        opacity: 0.7,
    },
    disabled: {
        opacity: 0.6,
    },
});
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
                <Text style={styles.sectionTitle}>Add Component</Text>
                <View style={styles.buttonRow}>
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
            <View style={styles.hr} />

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
                    style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed, isSaving && styles.disabled]}
                    onPress={saveAndGoHome}
                    disabled={isSaving}
                >
                    <Text style={styles.backButtonText}>BACK</Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [styles.canvasButton, pressed && styles.buttonPressed]}
                    onPress={onOpenCanvasSettings}
                >
                    <Text style={styles.canvasButtonText}>CANVAS SETTINGS</Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [styles.shareButton, pressed && styles.buttonPressed, isSaving && styles.disabled]}
                    onPress={saveAndShare}
                    disabled={isSaving}
                >
                    <Text style={styles.shareButtonText}>SHARE</Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [styles.helpButton, pressed && styles.buttonPressed]}
                    onPress={onOpenTutorial}
                >
                    <Text style={styles.helpButtonText}>?</Text>
                </Pressable>

            </View>

            <View style={styles.aiSection}>
                <Pressable
                    style={[styles.enhanceBtn, aiLoading && styles.enhanceBtnDisabled]}
                    onPress={fetchSuggestions}
                    disabled={aiLoading}
                >
                    <Text style={styles.enhanceBtnText}>
                        {aiLoading ? 'ENHANCING...' : 'ENHANCE LAYOUT'}
                    </Text>
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
        paddingTop: 8,
        paddingBottom: 12,
        gap: 14,
    },
    fileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    utilityRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    fileNameInput: {
        flex: 1,
        minWidth: 0,
        minHeight: 40,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        color: '#111827',
        fontSize: 14,
        fontWeight: '600',
        backgroundColor: '#FFFFFF',
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
        paddingHorizontal: 12,
    },
    backButtonText: {
        color: '#5B21B6',
        fontSize: 11,
        fontWeight: '800',
    },
    canvasButton: {
        minHeight: 40,
        minWidth: 76,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FDBA74',
        backgroundColor: '#FFEDD5',
        paddingHorizontal: 12,
    },
    canvasButtonText: {
        color: '#9A3412',
        fontSize: 11,
        fontWeight: '800',
    },
    shareButton: {
        minHeight: 40,
        minWidth: 76,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#93C5FD',
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 12,
    },
    shareButtonText: {
        color: '#1D4ED8',
        fontSize: 11,
        fontWeight: '800',
    },
    helpButton: {
        minHeight: 40,
        minWidth: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
    },
    helpButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '800',
    },
    addSection: {
        gap: 10,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111827',
    },
    buttonRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    addButton: {
        minHeight: 40,
        minWidth: 72,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#111827',
    },
    buttonPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.97 }],
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    disabled: {
        opacity: 0.6,
    },
    hr: {
        borderBottomColor: 'gray',
        borderBottomWidth: StyleSheet.hairlineWidth, // Creates a thin line based on screen density
        marginVertical: 10,
    },
    aiSection: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    enhanceBtn: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    enhanceBtnDisabled: {
        backgroundColor: '#ccc',
    },
    enhanceBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});

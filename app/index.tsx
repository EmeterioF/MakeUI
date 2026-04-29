import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ComponentFileListItem } from '@/components/home/ComponentFileListItem';
import { useHomeFileActions } from '@/components/home/useHomeFileActions';

export default function HomeScreen() {
    const { files, isLoading, handleCreate, handleOpen, handleShare, handleDelete } = useHomeFileActions();

    return (
        <View style={styles.safeArea}>
            <View style={styles.header}>
                <View style={styles.titleGroup}>
                    <Text style={styles.title}>MakeUI</Text>
                    <Text style={styles.subtitle}>Saved component files</Text>
                </View>
                <Pressable style={({ pressed }) => [styles.createButton, pressed && styles.pressed]} onPress={handleCreate}>
                    <Text style={styles.createButtonText}>NEW FILE</Text>
                </Pressable>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.list}>
                {files.map((file) => (
                    <ComponentFileListItem
                        key={file.id}
                        file={file}
                        onOpen={handleOpen}
                        onShare={handleShare}
                        onDelete={handleDelete}
                    />
                ))}

                {!isLoading && files.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>No files yet</Text>
                        <Text style={styles.emptyCopy}>Create a file, name it in the editor, then save it here.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    titleGroup: {
        flex: 1,
        minWidth: 0,
        gap: 2,
    },
    title: {
        color: '#111827',
        fontSize: 24,
        fontWeight: '900',
    },
    subtitle: {
        color: '#6B7280',
        fontSize: 12,
        fontWeight: '600',
    },
    createButton: {
        minHeight: 42,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#111827',
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '800',
    },
    pressed: {
        opacity: 0.84,
        transform: [{ scale: 0.98 }],
    },
    scroll: {
        flex: 1,
    },
    list: {
        padding: 16,
        gap: 10,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 220,
        gap: 8,
        paddingHorizontal: 24,
    },
    emptyTitle: {
        color: '#111827',
        fontSize: 18,
        fontWeight: '800',
    },
    emptyCopy: {
        color: '#6B7280',
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'center',
        fontWeight: '500',
    },
});

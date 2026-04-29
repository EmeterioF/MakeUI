import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ComponentFileListItem as ComponentFileListItemType } from '@/data/componentFileRepository';

type Props = {
    file: ComponentFileListItemType;
    onOpen: (id: number) => void;
    onShare: (id: number) => void;
    onDelete: (id: number) => void;
};

const formatDate = (value: string): string => {
    const date = new Date(value.replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export function ComponentFileListItem({ file, onOpen, onShare, onDelete }: Props) {
    return (
        <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={() => onOpen(file.id)}>
            <View style={styles.fileMark} />

            <View style={styles.details}>
                <Text style={styles.fileName} numberOfLines={1}>
                    {file.file_name}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                    Updated {formatDate(file.updated_at)}
                </Text>
            </View>

            <View style={styles.actions}>
                <Pressable
                    style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
                    onPress={(event) => {
                        event.stopPropagation();
                        onShare(file.id);
                    }}
                >
                    <Text style={styles.actionText}>SHARE</Text>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [styles.deleteButton, pressed && styles.actionPressed]}
                    onPress={(event) => {
                        event.stopPropagation();
                        onDelete(file.id);
                    }}
                >
                    <Text style={styles.deleteText}>DEL</Text>
                </Pressable>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 72,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    rowPressed: {
        opacity: 0.86,
        transform: [{ scale: 0.99 }],
    },
    fileMark: {
        width: 10,
        height: 42,
        borderRadius: 999,
        backgroundColor: '#111827',
    },
    details: {
        flex: 1,
        minWidth: 0,
        gap: 5,
    },
    fileName: {
        color: '#111827',
        fontSize: 15,
        fontWeight: '800',
    },
    meta: {
        color: '#6B7280',
        fontSize: 12,
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        minWidth: 58,
        minHeight: 34,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#0EA5E9',
        backgroundColor: '#E0F2FE',
    },
    deleteButton: {
        minWidth: 44,
        minHeight: 34,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
    },
    actionPressed: {
        opacity: 0.82,
    },
    actionText: {
        color: '#075985',
        fontSize: 10,
        fontWeight: '800',
    },
    deleteText: {
        color: '#B91C1C',
        fontSize: 10,
        fontWeight: '800',
    },
});

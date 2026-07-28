import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ComponentFileListItem } from '@/components/home/ComponentFileListItem';
import { useHomeFileActions } from '@/components/home/useHomeFileActions';
import { useProjectStore } from '@/editor/projectStore';
import type { ProjectListItem } from '@/data/componentFileRepository';

function ProjectListItem({ project, onOpen, onDelete }: {
    project: ProjectListItem;
    onOpen: (id: number) => void;
    onDelete: (id: number, name: string) => void;
}) {
    return (
        <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={() => onOpen(project.id)}>
            <View style={styles.projectIcon}>
                <Text style={styles.projectIconText}>📁</Text>
            </View>

            <View style={styles.details}>
                <Text style={styles.fileName} numberOfLines={2}>
                    {project.name}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                    {project.screen_count} screen{project.screen_count !== 1 ? 's' : ''}
                </Text>
            </View>

            <Pressable
                style={({ pressed }) => [styles.deleteButton, pressed && styles.actionPressed]}
                onPress={(event) => {
                    event.stopPropagation();
                    onDelete(project.id, project.name);
                }}
            >
                <Text style={styles.deleteText}>✕</Text>
            </Pressable>
        </Pressable>
    );
}

export default function HomeScreen() {
    const { files, isLoading, handleCreate, handleOpen, handleShare, handleDelete, handleCreateProject, handleDeleteProject, handleExportProject } = useHomeFileActions();
    const { projects, selectedProjectId, currentScreens, isLoading: projectsLoading, selectProject } = useProjectStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    const isProjectView = selectedProjectId === null;

    function renderProjectList() {
        if (projectsLoading) {
            return <Text style={styles.loadingText}>Loading...</Text>;
        }

        if (projects.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No projects yet</Text>
                    <Text style={styles.emptyCopy}>
                        Create a project to organize your screens.
                    </Text>
                </View>
            );
        }

        return projects.map((project) => (
            <ProjectListItem
                key={project.id}
                project={project}
                onOpen={(id) => selectProject(id)}
                onDelete={(id, name) => handleDeleteProject(id, name)}
            />
        ));
    }

    function renderScreenList() {
        if (currentScreens.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No screens yet</Text>
                    <Text style={styles.emptyCopy}>
                        Add screens to this project using the NEW SCREEN button.
                    </Text>
                </View>
            );
        }

        return currentScreens.map((screen) => (
            <ComponentFileListItem
                key={screen.id}
                file={screen}
                onOpen={handleOpen}
                onShare={handleShare}
                onDelete={handleDelete}
            />
        ));
    }

    return (
        <View style={styles.safeArea}>
            <View style={styles.header}>
                <View style={styles.titleGroup}>
                    {isProjectView ? (
                        <>
                            <Text style={styles.title}>Projects</Text>
                            <Text style={styles.subtitle}>{projects.length} project{projects.length !== 1 ? 's' : ''}</Text>
                        </>
                    ) : (
                        <Text style={styles.projectTitle} numberOfLines={1}>
                            {projects.find(p => p.id === selectedProjectId)?.name ?? ''}
                        </Text>
                    )}
                </View>

                {isProjectView ? (
                    <Pressable
                        style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
                        onPress={() => setShowCreateModal(true)}
                    >
                        <Text style={styles.createButtonText}>NEW PROJECT</Text>
                    </Pressable>
                ) : (
                    <View style={styles.headerActions}>
                        <Pressable
                            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                            onPress={() => selectProject(null)}
                        >
                            <Text style={styles.iconButtonText}>←</Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [styles.exportButton, pressed && styles.pressed]}
                            onPress={() => handleExportProject(selectedProjectId!)}
                        >
                            <Text style={styles.exportButtonText}>EXPORT</Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
                            onPress={() => handleCreate(selectedProjectId)}
                        >
                            <Text style={styles.createButtonText}>NEW SCREEN</Text>
                        </Pressable>
                    </View>
                )}
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.list}>
                {!isLoading && isProjectView
                    ? renderProjectList()
                    : renderScreenList()}
            </ScrollView>

            <Modal
                transparent
                visible={showCreateModal}
                onRequestClose={() => setShowCreateModal(false)}
                animationType="fade"
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <Pressable
                        style={styles.modalBackdrop}
                        onPress={() => setShowCreateModal(false)}
                    />
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>New Project</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Project name"
                            placeholderTextColor="#9CA3AF"
                            value={newProjectName}
                            onChangeText={setNewProjectName}
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <Pressable
                                style={({ pressed }) => [styles.modalButton, styles.modalCancelButton, pressed && styles.pressed]}
                                onPress={() => {
                                    setShowCreateModal(false);
                                    setNewProjectName('');
                                }}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={({ pressed }) => [styles.modalButton, styles.modalConfirmButton, pressed && styles.pressed]}
                                onPress={async () => {
                                    const name = newProjectName.trim();
                                    if (!name) return;
                                    await handleCreateProject(name);
                                    setShowCreateModal(false);
                                    setNewProjectName('');
                                }}
                            >
                                <Text style={styles.modalConfirmText}>Create</Text>
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    titleGroup: {
        flex: 1,
        minWidth: 0,
    },
    title: {
        color: '#111827',
        fontSize: 20,
        fontWeight: '800',
    },
    subtitle: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 1,
    },
    projectTitle: {
        color: '#111827',
        fontSize: 18,
        fontWeight: '700',
    },
    createButton: {
        minHeight: 36,
        paddingHorizontal: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#111827',
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    exportButton: {
        minHeight: 36,
        paddingHorizontal: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#0EA5E9',
    },
    exportButtonText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    pressed: {
        opacity: 0.84,
        transform: [{ scale: 0.98 }],
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        minWidth: 38,
        minHeight: 38,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    iconButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
    scroll: {
        flex: 1,
    },
    list: {
        padding: 14,
        gap: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        gap: 6,
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
    loadingText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 40,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    rowPressed: {
        opacity: 0.8,
    },
    projectIcon: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#F9FAFB',
    },
    projectIconText: {
        fontSize: 20,
    },
    details: {
        flex: 1,
        minWidth: 0,
        gap: 4,
    },
    fileName: {
        color: '#111827',
        fontSize: 15,
        fontWeight: '700',
        lineHeight: 20,
    },
    meta: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '500',
    },
    deleteButton: {
        minWidth: 32,
        minHeight: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    actionPressed: {
        opacity: 0.6,
    },
    deleteText: {
        color: '#D1D5DB',
        fontSize: 12,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modal: {
        width: '85%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        gap: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    modalTitle: {
        color: '#111827',
        fontSize: 20,
        fontWeight: '800',
    },
    modalInput: {
        height: 48,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#F9FAFB',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    modalButton: {
        minHeight: 42,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    modalCancelButton: {
        backgroundColor: '#F3F4F6',
    },
    modalCancelText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '700',
    },
    modalConfirmButton: {
        backgroundColor: '#111827',
    },
    modalConfirmText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
});

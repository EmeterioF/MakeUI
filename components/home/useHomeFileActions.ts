import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { deleteComponentFile, getComponentFileById, listComponentFiles } from '@/data/componentFileRepository';
import type { ComponentFileListItem } from '@/data/componentFileRepository';
import { useComponentNodeStore } from '@/editor/componentNodeStore';
import { useProjectStore } from '@/editor/projectStore';
import { shareComponentFileById } from '@/services/componentFileService';

export function useHomeFileActions() {
    const [files, setFiles] = useState<ComponentFileListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const startNewFile = useComponentNodeStore((s) => s.startNewFile);
    const loadFile = useComponentNodeStore((s) => s.loadFile);

    const refreshFiles = useCallback(async () => {
        setIsLoading(true);
        try {
            setFiles(await listComponentFiles());
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to load saved files.';
            Alert.alert('Load failed', message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // The home file-management hook is the single place that lists, opens,
    // shares, and deletes persisted component files for the Home screen.
    // Keeping this workflow here leaves app/index.tsx focused on rendering.
    useFocusEffect(
        useCallback(() => {
            void refreshFiles();
        }, [refreshFiles])
    );

    const handleCreate = useCallback(() => {
        startNewFile();
        router.push('./editor');
    }, [startNewFile]);

    const handleOpen = useCallback(
        async (id: number) => {
            try {
                const file = await getComponentFileById(id);
                if (!file) {
                    Alert.alert('File missing', 'This saved file could not be found.');
                    await refreshFiles();
                    return;
                }

                // Opening a file hydrates the editor store from the saved row.
                // Future editor saves reuse file.id so Home keeps the same list item.
                loadFile({
                    id: file.id,
                    fileName: file.file_name,
                    componentTree: file.component_tree,
                    canvasConfig: file.canvas_config,
                });
                router.push('./editor');
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unable to open this file.';
                Alert.alert('Open failed', message);
            }
        },
        [loadFile, refreshFiles]
    );

    const handleShare = useCallback(async (id: number) => {
        try {
            await shareComponentFileById(id);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to share this file.';
            Alert.alert('Share failed', message);
        }
    }, []);

    const handleDelete = useCallback(
        (id: number) => {
            Alert.alert('Delete file?', 'This removes the saved file from this device.', [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteComponentFile(id);
                            await refreshFiles();
                        } catch (error) {
                            const message = error instanceof Error ? error.message : 'Unable to delete this file.';
                            Alert.alert('Delete failed', message);
                        }
                    },
                },
            ]);
        },
        [refreshFiles]
    );

    const handleCreateProject = useCallback(async () => {
        const { createProject, selectProject, loadProjects } = useProjectStore.getState();
        const id = await createProject('New Project');
        if (id !== null) {
            await selectProject(id);
        }
    }, []);

    return {
        files,
        isLoading,
        handleCreate,
        handleOpen,
        handleShare,
        handleDelete,
        handleCreateProject,
    };
}

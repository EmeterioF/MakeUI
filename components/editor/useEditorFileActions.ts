import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useComponentNodeStore } from '@/editor/componentNodeStore';
import { useProjectStore } from '@/editor/projectStore';
import { saveComponentFile, shareComponentFileById } from '@/services/componentFileService';
import { useEditorSaveNoticeStore } from '@/components/editor/useEditorSaveNoticeStore';

export function useEditorFileActions() {
    const currentFileId = useComponentNodeStore((s) => s.currentFileId);
    const currentFileName = useComponentNodeStore((s) => s.currentFileName);
    const componentTree = useComponentNodeStore((s) => s.componentTree);
    const canvasConfig = useComponentNodeStore((s) => s.canvasConfig);
    const currentProjectId = useComponentNodeStore((s) => s.currentProjectId);
    const markFileSaved = useComponentNodeStore((s) => s.markFileSaved);
    const showSaveNotice = useEditorSaveNoticeStore((s) => s.showSaveNotice);
    const [isSaving, setIsSaving] = useState(false);
    const savingRef = useRef(false);

    const saveCurrentFile = useCallback(async () => {
        if (savingRef.current) return null;

        savingRef.current = true;
        setIsSaving(true);
        try {
            // Saving converts the current editor tree + canvas config into code,
            // then updates the current database row or creates a new one if this
            // is an unsaved file. markFileSaved stores that id for future saves.
            const savedFile = await saveComponentFile({
                id: currentFileId,
                fileName: currentFileName,
                componentTree,
                canvasConfig,
                projectId: currentProjectId ?? undefined,
            });
            markFileSaved(savedFile.id, savedFile.fileName);
            showSaveNotice('Saved');
            const { loadProjects, selectProject } = useProjectStore.getState();
            await Promise.all([
                loadProjects(),
                currentProjectId ? selectProject(currentProjectId) : Promise.resolve(),
            ]);
            return savedFile;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to save this file.';
            Alert.alert('Save failed', message);
            return null;
        } finally {
            savingRef.current = false;
            setIsSaving(false);
        }
    }, [canvasConfig, componentTree, currentFileId, currentFileName, currentProjectId, markFileSaved, showSaveNotice]);

    const saveAndGoHome = useCallback(async () => {
        const savedFile = await saveCurrentFile();
        if (savedFile) {
            router.replace('/');
        }
    }, [saveCurrentFile]);

    const saveAndShare = useCallback(async () => {
        const savedFile = await saveCurrentFile();
        if (!savedFile) return;

        try {
            await shareComponentFileById(savedFile.id);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to share this file.';
            Alert.alert('Share failed', message);
        }
    }, [saveCurrentFile]);

    return {
        isSaving,
        saveCurrentFile,
        saveAndGoHome,
        saveAndShare,
    };
}

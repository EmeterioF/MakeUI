import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { CanvasConfig, ComponentNode } from '@/editor/componentNodeTypes';
import { convertTreeToReactNativeCode } from '@/export/treeToReactNative';
import {
    createComponentFile,
    getComponentFileById,
    updateComponentFile,
} from '@/data/componentFileRepository';

type SaveComponentFileInput = {
    id: number | null;
    fileName: string;
    componentTree: ComponentNode[];
    canvasConfig: CanvasConfig;
};

const FALLBACK_FILE_NAME = 'Untitled Screen.tsx';

const cleanFileName = (fileName: string): string => {
    const trimmed = fileName.trim();
    const safeName = trimmed.length > 0 ? trimmed.replace(/[<>:"/\\|?*]+/g, '-') : FALLBACK_FILE_NAME;
    return safeName.toLowerCase().endsWith('.tsx') ? safeName : `${safeName}.tsx`;
};

const writeCodeToTempFile = async (code: string, fileName: string): Promise<string> => {
    const cacheDirectory = FileSystem.cacheDirectory;
    if (!cacheDirectory) {
        throw new Error('Unable to access cache directory.');
    }

    const fileUri = `${cacheDirectory}${cleanFileName(fileName)}`;
    await FileSystem.writeAsStringAsync(fileUri, code, {
        encoding: FileSystem.EncodingType.UTF8,
    });
    return fileUri;
};

export const saveComponentFile = async ({
    id,
    fileName,
    componentTree,
    canvasConfig,
}: SaveComponentFileInput): Promise<{ id: number; fileName: string; code: string }> => {
    const normalizedFileName = cleanFileName(fileName);
    // The file-management system stores both the editable editor state and the
    // generated React Native code. This keeps Home fast to list while letting
    // the editor reopen an exact tree/canvas snapshot later.
    const code = convertTreeToReactNativeCode(componentTree, canvasConfig);

    if (id) {
        // Existing files update in place so Home keeps the same row and share target.
        const existingFile = await getComponentFileById(id);
        if (existingFile) {
            await updateComponentFile(id, normalizedFileName, code, componentTree, canvasConfig);
            return { id, fileName: normalizedFileName, code };
        }
    }

    // Unsaved files, or files deleted while still open, get a new database row.
    const nextId = await createComponentFile(normalizedFileName, code, componentTree, canvasConfig);
    return { id: nextId, fileName: normalizedFileName, code };
};

export const shareComponentFileById = async (id: number): Promise<void> => {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
        throw new Error('Sharing is not available on this device.');
    }

    const record = await getComponentFileById(id);
    if (!record) {
        throw new Error('No saved file found to share.');
    }

    const fileUri = await writeCodeToTempFile(record.code, record.file_name);
    await Sharing.shareAsync(fileUri, {
        dialogTitle: 'Share React Native code',
        mimeType: 'text/plain',
        UTI: 'public.plain-text',
    });
};

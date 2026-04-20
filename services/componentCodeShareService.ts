import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { CanvasConfig, ComponentNode } from '@/editor/componentNodeTypes';
import { convertTreeToReactNativeCode } from '@/export/treeToReactNative';
import { getGeneratedCodeById, saveOrUpdateGeneratedCodeByFileName } from '@/data/generatedCodeRepository';

const GENERATED_FILE_NAME = 'generated-screen.tsx';

const writeCodeToTempFile = async (code: string, fileName: string): Promise<string> => {
    const cacheDirectory = FileSystem.cacheDirectory;
    if (!cacheDirectory) {
        throw new Error('Unable to access cache directory.');
    }

    const fileUri = `${cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, code, {
        encoding: FileSystem.EncodingType.UTF8,
    });
    return fileUri;
};

export const generateAndSaveComponentCode = async (
    componentTree: ComponentNode[],
    canvasConfig: CanvasConfig
): Promise<number> => {
    const code = convertTreeToReactNativeCode(componentTree, canvasConfig);
    return saveOrUpdateGeneratedCodeByFileName(GENERATED_FILE_NAME, code);
};

export const shareGeneratedCodeById = async (id: number): Promise<void> => {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
        throw new Error('Sharing is not available on this device.');
    }

    const record = await getGeneratedCodeById(id);
    if (!record) {
        throw new Error('No generated code found to share.');
    }

    const fileUri = await writeCodeToTempFile(record.code, record.file_name);
    await Sharing.shareAsync(fileUri, {
        dialogTitle: 'Share generated React Native code',
        mimeType: 'text/plain',
        UTI: 'public.plain-text',
    });
};

export const generateSaveAndShareComponentCode = async (
    componentTree: ComponentNode[],
    canvasConfig: CanvasConfig
): Promise<number> => {
    const id = await generateAndSaveComponentCode(componentTree, canvasConfig);
    await shareGeneratedCodeById(id);
    return id;
};

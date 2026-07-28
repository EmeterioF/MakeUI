import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import JSZip from 'jszip';
import {
    getProjectById,
    listScreensByProjectId,
} from '@/data/componentFileRepository';
import { getComponentFileById } from '@/data/componentFileRepository';
import { convertTreeToReactNativeCode } from '@/export/treeToReactNative';

const sanitizeFolderName = (name: string): string => {
    return name.replace(/[<>:"/\\|?*]+/g, '-').trim() || 'Untitled Project';
};

export const exportProjectAsZip = async (projectId: number): Promise<void> => {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
        throw new Error('Sharing is not available on this device.');
    }

    const project = await getProjectById(projectId);
    if (!project) {
        throw new Error('Project not found.');
    }

    const screens = await listScreensByProjectId(projectId);
    if (screens.length === 0) {
        throw new Error('This project has no screens to export.');
    }

    const zip = new JSZip();
    const folderName = sanitizeFolderName(project.name);
    const folder = zip.folder(folderName);
    if (!folder) {
        throw new Error('Failed to create zip folder.');
    }

    for (const screen of screens) {
        const fullRecord = await getComponentFileById(screen.id);
        if (!fullRecord) continue;

        const screenName = fullRecord.file_name.replace(/\.tsx$/i, '');
        const code = convertTreeToReactNativeCode(
            fullRecord.component_tree,
            fullRecord.canvas_config,
            screenName,
        );
        folder.file(fullRecord.file_name, code);
    }

    const base64 = await zip.generateAsync({ type: 'base64' });

    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) {
        throw new Error('Unable to access cache directory.');
    }

    const zipUri = `${cacheDir}${folderName}.zip`;
    await FileSystem.writeAsStringAsync(zipUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
    });

    await Sharing.shareAsync(zipUri, {
        dialogTitle: `Export ${project.name}`,
        mimeType: 'application/zip',
        UTI: 'com.pkware.zip-archive',
    });
};

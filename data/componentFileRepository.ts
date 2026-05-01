import * as SQLite from 'expo-sqlite';
import type { CanvasConfig, ComponentNode } from '@/editor/componentNodeTypes';

export type ComponentFileListItem = {
    id: number;
    file_name: string;
    updated_at: string;
};

export type ComponentFileRecord = ComponentFileListItem & {
    code: string;
    component_tree: ComponentNode[];
    canvas_config: CanvasConfig;
    created_at: string;
};

type ComponentFileRow = {
    id: number;
    file_name: string;
    code: string;
    component_tree_json: string;
    canvas_config_json: string;
    created_at: string;
    updated_at: string;
};

const dbPromise = SQLite.openDatabaseAsync('makeui.db');
let isInitialized = false;

const ensureTable = async (): Promise<SQLite.SQLiteDatabase> => {
    const db = await dbPromise;
    if (!isInitialized) {
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS component_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_name TEXT NOT NULL,
                code TEXT NOT NULL,
                component_tree_json TEXT NOT NULL,
                canvas_config_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);
        isInitialized = true;
    }
    return db;
};

const serialize = <T>(value: T): string => JSON.stringify(value);

// SQLite stores the editable tree/config as JSON strings; this keeps the public API typed.
const parseRow = (row: ComponentFileRow): ComponentFileRecord => ({
    id: row.id,
    file_name: row.file_name,
    code: row.code,
    component_tree: JSON.parse(row.component_tree_json) as ComponentNode[],
    canvas_config: JSON.parse(row.canvas_config_json) as CanvasConfig,
    created_at: row.created_at,
    updated_at: row.updated_at,
});

export const listComponentFiles = async (): Promise<ComponentFileListItem[]> => {
    const db = await ensureTable();
    return db.getAllAsync<ComponentFileListItem>(
        'SELECT id, file_name, updated_at FROM component_files ORDER BY updated_at DESC, id DESC;'
    );
};

export const getComponentFileById = async (id: number): Promise<ComponentFileRecord | null> => {
    const db = await ensureTable();
    const row = await db.getFirstAsync<ComponentFileRow>(
        `
            SELECT id, file_name, code, component_tree_json, canvas_config_json, created_at, updated_at
            FROM component_files
            WHERE id = ?;
        `,
        id
    );
    return row ? parseRow(row) : null;
};

export const createComponentFile = async (
    fileName: string,
    code: string,
    componentTree: ComponentNode[],
    canvasConfig: CanvasConfig
): Promise<number> => {
    const db = await ensureTable();
    const result = await db.runAsync(
        `
            INSERT INTO component_files (
                file_name,
                code,
                component_tree_json,
                canvas_config_json,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `,
        fileName,
        code,
        serialize(componentTree),
        serialize(canvasConfig)
    );
    return Number(result.lastInsertRowId);
};

export const updateComponentFile = async (
    id: number,
    fileName: string,
    code: string,
    componentTree: ComponentNode[],
    canvasConfig: CanvasConfig
): Promise<void> => {
    const db = await ensureTable();
    await db.runAsync(
        `
            UPDATE component_files
            SET
                file_name = ?,
                code = ?,
                component_tree_json = ?,
                canvas_config_json = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?;
        `,
        fileName,
        code,
        serialize(componentTree),
        serialize(canvasConfig),
        id
    );
};

export const deleteComponentFile = async (id: number): Promise<void> => {
    const db = await ensureTable();
    await db.runAsync('DELETE FROM component_files WHERE id = ?;', id);
};

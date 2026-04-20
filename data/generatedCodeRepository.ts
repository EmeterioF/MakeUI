import * as SQLite from 'expo-sqlite';

export type GeneratedCodeRecord = {
    id: number;
    file_name: string;
    code: string;
    created_at: string;
};

const dbPromise = SQLite.openDatabaseAsync('makeui.db');
let isInitialized = false;

const ensureTable = async (): Promise<SQLite.SQLiteDatabase> => {
    const db = await dbPromise;
    if (!isInitialized) {
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS generated_code (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_name TEXT NOT NULL,
                code TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(generated_code);');
        const hasFileName = columns.some((column) => column.name === 'file_name');
        if (!hasFileName) {
            await db.execAsync(`ALTER TABLE generated_code ADD COLUMN file_name TEXT NOT NULL DEFAULT 'generated-screen.tsx';`);
        }
        isInitialized = true;
    }
    return db;
};

export const saveGeneratedCode = async (fileName: string, code: string): Promise<number> => {
    const db = await ensureTable();
    const result = await db.runAsync('INSERT INTO generated_code (file_name, code) VALUES (?, ?);', fileName, code);
    return Number(result.lastInsertRowId);
};

export const saveOrUpdateGeneratedCodeByFileName = async (fileName: string, code: string): Promise<number> => {
    const db = await ensureTable();
    const existingRows = await db.getAllAsync<{ id: number }>(
        'SELECT id FROM generated_code WHERE file_name = ? ORDER BY id ASC;',
        fileName
    );

    if (existingRows.length === 0) {
        const inserted = await db.runAsync(
            'INSERT INTO generated_code (file_name, code, created_at) VALUES (?, ?, CURRENT_TIMESTAMP);',
            fileName,
            code
        );
        return Number(inserted.lastInsertRowId);
    }

    const keepId = existingRows[0].id;
    await db.runAsync(
        'UPDATE generated_code SET code = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?;',
        code,
        keepId
    );

    if (existingRows.length > 1) {
        const duplicateIds = existingRows.slice(1).map((row) => row.id);
        const placeholders = duplicateIds.map(() => '?').join(', ');
        await db.runAsync(`DELETE FROM generated_code WHERE id IN (${placeholders});`, ...duplicateIds);
    }

    return keepId;
};

export const getGeneratedCodeById = async (id: number): Promise<GeneratedCodeRecord | null> => {
    const db = await ensureTable();
    const row = await db.getFirstAsync<GeneratedCodeRecord>(
        'SELECT id, file_name, code, created_at FROM generated_code WHERE id = ?;',
        id
    );
    return row ?? null;
};

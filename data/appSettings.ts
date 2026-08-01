import * as SQLite from 'expo-sqlite';

const dbPromise = SQLite.openDatabaseAsync('makeui.db');
let isInitialized = false;

const ensureTable = async (): Promise<SQLite.SQLiteDatabase> => {
    const db = await dbPromise;
    if (!isInitialized) {
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
        `);
        isInitialized = true;
    }
    return db;
};

export const getSetting = async (key: string): Promise<string | null> => {
    const db = await ensureTable();
    const row = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM app_settings WHERE key = ?;',
        key
    );
    return row?.value ?? null;
};

export const setSetting = async (key: string, value: string): Promise<void> => {
    const db = await ensureTable();
    await db.runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);',
        key,
        value
    );
};

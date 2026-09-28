import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useComponentNodeStore } from '@/editor/componentNodeStore';
import { useEditorFileActions } from '@/components/editor/useEditorFileActions';

const DEBOUNCE_MS = 1500;

export function useAutoSave() {
    const { saveCurrentFile } = useEditorFileActions();
    const saveRef = useRef(saveCurrentFile);
    saveRef.current = saveCurrentFile;

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        const unsub = useComponentNodeStore.subscribe((state, prevState) => {
            if (
                state.componentTree !== prevState.componentTree ||
                state.canvasConfig !== prevState.canvasConfig ||
                state.currentFileName !== prevState.currentFileName
            ) {
                schedule();
            }
        });

        return () => {
            mountedRef.current = false;
            unsub();
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
                // Flush on exit: leaving the editor (system back, HOME button,
                // any navigation) must not drop a pending rename/edit.
                void saveRef.current();
            }
        };
    }, []);

    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state.match(/inactive|background/)) {
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                    timerRef.current = null;
                }
                saveRef.current();
            }
        });
        return () => sub.remove();
    }, []);

    function schedule() {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            if (!mountedRef.current) return;
            timerRef.current = null;
            saveRef.current();
        }, DEBOUNCE_MS);
    }
}

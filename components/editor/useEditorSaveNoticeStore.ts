import { create } from 'zustand';

type EditorSaveNoticeState = {
    isVisible: boolean;
    message: string;
    noticeId: number;
    showSaveNotice: (message?: string) => void;
    hideSaveNotice: () => void;
};

export const useEditorSaveNoticeStore = create<EditorSaveNoticeState>((set) => ({
    isVisible: false,
    message: 'Saved',
    noticeId: 0,
    showSaveNotice: (message = 'Saved') => {
        // A monotonically increasing id lets the toast restart its timer even
        // when the user saves repeatedly while the previous notice is visible.
        set((state) => ({
            isVisible: true,
            message,
            noticeId: state.noticeId + 1,
        }));
    },
    hideSaveNotice: () => set({ isVisible: false }),
}));

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetModalComponent } from '@/components/bottomModal/bottomSheetModalComponent';
import { useComponentNodeStore } from '@/editor/componentNodeStore';
import BottomSheetContentAddComponent from '@/components/bottomModal/bottomSheetContentAddComponent';
import BottomSheetContentCanvasSettings from '@/components/bottomModal/bottomSheetContentCanvasSettings';
import BottomSheetContentEditProperties from '@/components/bottomModal/bottomSheetContentEditProperties';

const SNAP_INDEX = { add: 5, canvasSettings: 5, edit: 8 } as const;

export default function BottomSheet({ onOpenTutorial }: { onOpenTutorial: () => void }) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const [activeSheet, setActiveSheet] = useState<'add' | 'canvasSettings'>('add');

    const selectedID = useComponentNodeStore((s) => s.selectedID);
    const selectNode = useComponentNodeStore((s) => s.selectNode);
    const deleteNode = useComponentNodeStore((s) => s.deleteNode);

    const view = selectedID ? 'edit' : activeSheet;
    const [contentView, setContentView] = useState<'add' | 'canvasSettings' | 'edit'>(view);
    const viewRef = useRef<'add' | 'canvasSettings' | 'edit'>(view);
    viewRef.current = view;

    useEffect(() => {
        sheetRef.current?.present();
    }, []);

    useEffect(() => {
        if (contentView !== view) {
            sheetRef.current?.dismiss();
        }
    }, [view]);

    const handleDismiss = useCallback(() => {
        const target = viewRef.current;
        setContentView(target);
        requestAnimationFrame(() => {
            sheetRef.current?.present();
            sheetRef.current?.snapToIndex(SNAP_INDEX[target]);
        });
    }, []);

    const handleBack = () => selectNode(null);
    const handleDelete = () => deleteNode(selectedID);
    const handleOpenCanvasSettings = () => setActiveSheet('canvasSettings');
    const handleCanvasSettingsBack = () => setActiveSheet('add');

    return (
        <View>
            <BottomSheetModalComponent ref={sheetRef} index={SNAP_INDEX[contentView]} onDismiss={handleDismiss}>
                {contentView === 'edit' && (
                    <BottomSheetContentEditProperties onBack={handleBack} onDelete={handleDelete} />
                )}
                {contentView === 'canvasSettings' && (
                    <BottomSheetContentCanvasSettings onBack={handleCanvasSettingsBack} />
                )}
                {contentView === 'add' && (
                    <BottomSheetContentAddComponent onOpenCanvasSettings={handleOpenCanvasSettings} onOpenTutorial={onOpenTutorial} />
                )}
            </BottomSheetModalComponent>
        </View>
    );
}

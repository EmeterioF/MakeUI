import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetModalComponent } from '@/components/bottomModal/bottomSheetModalComponent';
import { useComponentNodeStore } from '@/editor/componentNodeStore';
import BottomSheetContentAddComponent from '@/components/bottomModal/bottomSheetContentAddComponent';
import BottomSheetContentCanvasSettings from '@/components/bottomModal/bottomSheetContentCanvasSettings';
import BottomSheetContentEditProperties from '@/components/bottomModal/bottomSheetContentEditProperties';

export default function BottomSheet() {
    const addModalRef = useRef<BottomSheetModal>(null);
    const canvasSettingsModalRef = useRef<BottomSheetModal>(null);
    const editModalRef = useRef<BottomSheetModal>(null);
    const [activeSheet, setActiveSheet] = useState<'add' | 'canvasSettings'>('add');

    const selectedID = useComponentNodeStore((s) => s.selectedID);
    const selectNode = useComponentNodeStore((s) => s.selectNode);
    const deleteNode = useComponentNodeStore((s) => s.deleteNode);

    useEffect(() => {
        if (selectedID) {
            canvasSettingsModalRef.current?.dismiss();
            addModalRef.current?.dismiss();
            editModalRef.current?.present();
        } else if (activeSheet === 'canvasSettings') {
            // No selection, canvas settings requested
            editModalRef.current?.dismiss();
            addModalRef.current?.dismiss();
            canvasSettingsModalRef.current?.present();
        } else {
            canvasSettingsModalRef.current?.dismiss();
            addModalRef.current?.present();
        }
    console.log(selectedID)
}, [activeSheet, selectedID]);

    const handleBack = () => selectNode(null);
    const handleDelete = () => deleteNode(selectedID);
    const handleOpenCanvasSettings = () => {
        addModalRef.current?.dismiss();
        setActiveSheet('canvasSettings');
    };
    const handleCanvasSettingsBack = () => {
        canvasSettingsModalRef.current?.dismiss();
        setActiveSheet('add');
    };

    return (
        <View>
            <BottomSheetModalComponent ref={addModalRef} index={4}>
                <BottomSheetContentAddComponent onOpenCanvasSettings={handleOpenCanvasSettings} />
            </BottomSheetModalComponent>

            <BottomSheetModalComponent ref={canvasSettingsModalRef} index={5}>
                <BottomSheetContentCanvasSettings onBack={handleCanvasSettingsBack} />
            </BottomSheetModalComponent>

            <BottomSheetModalComponent ref={editModalRef} index={8}>
                <BottomSheetContentEditProperties onBack={handleBack} onDelete={handleDelete} />
            </BottomSheetModalComponent>
        </View>
    );
}
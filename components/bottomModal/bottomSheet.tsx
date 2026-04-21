import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetModalComponent } from '@/components/bottomModal/bottomSheetModalComponent';
import { useComponentNodeStore } from '@/editor/componentNodeStore';
import BottomSheetContentAddComponent from '@/components/bottomModal/bottomSheetContentAddComponent';
import BottomSheetContentEditProperties from '@/components/bottomModal/bottomSheetContentEditProperties';

export default function BottomSheet() {
    const addModalRef  = useRef<BottomSheetModal>(null);
    const editModalRef = useRef<BottomSheetModal>(null);

    const selectedID = useComponentNodeStore(s => s.selectedID);
    const selectNode = useComponentNodeStore(s => s.selectNode);
    const deleteNode = useComponentNodeStore(s => s.deleteNode);

    // Show the add modal on first render.
    useEffect(() => {
        addModalRef.current?.present();
    }, []);

    // When a node is selected → open the edit modal.
    // When deselected → dismiss the edit modal so its content is never visible
    // in a half-open state, then bring the add modal back into view.
    useEffect(() => {
        if (selectedID) {
            editModalRef.current?.present();
        } else {
            editModalRef.current?.dismiss();
            addModalRef.current?.present();
        }
    }, [selectedID]);

    // Clear selection and return to the add modal.
    const handleBack = () => selectNode(null);

    // Delete the selected node (store clears selectedID automatically,
    // which triggers the useEffect above to switch back to the add modal).
    const handleDelete = () => deleteNode(selectedID);

    return (
        <View>
            {/* Add components modal — visible when nothing is selected */}
            <BottomSheetModalComponent ref={addModalRef} index={2}>
                <BottomSheetContentAddComponent />
            </BottomSheetModalComponent>

            {/* Edit properties modal — visible only when a node is selected */}
            <BottomSheetModalComponent ref={editModalRef} index={8}>
                <BottomSheetContentEditProperties
                    onBack={handleBack}
                    onDelete={handleDelete}
                />
            </BottomSheetModalComponent>
        </View>
    );
}
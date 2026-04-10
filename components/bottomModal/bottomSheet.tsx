import React, {useEffect, useRef} from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetModal} from '@gorhom/bottom-sheet';
import { BottomSheetModalComponent } from '@/components/bottomModal/bottomSheetModalComponent';
import {useComponentNodeStore} from "@/editor/componentNodeStore";
import BottomSheetContentAddComponent from "@/components/bottomModal/bottomSheetContentAddComponent";
import BottomSheetContentEditProperties from "@/components/bottomModal/bottomSheetContentEditProperties";

export default function BottomSheet() {
    const firstModalRef = useRef<BottomSheetModal>(null);
    const secondModalRef = useRef<BottomSheetModal>(null);

    //CRUD OPERATIONS
    const selectedID= useComponentNodeStore(s => s.selectedID);
    const setSelectedID = useComponentNodeStore.setState
    const deleteNode= useComponentNodeStore(s => s.deleteNode);

    //SHOWS THE ADD NODES ON FIRST RENDER
    useEffect(() => {
        firstModalRef.current?.present();
    }, []);

    useEffect(() => {
        if(selectedID){
            secondModalRef.current?.present();
        }else{
            firstModalRef.current?.present();
        }
    }, [selectedID])

    const handleBackToFirstModal = () => {
        firstModalRef.current?.present()
        setSelectedID({ selectedID: null})
    }
    const handleDelete = () => deleteNode(selectedID)

    return (
            <View>
                {/* ADD COMPONENTS MODAL*/}
                <BottomSheetModalComponent ref={firstModalRef}>
                    <BottomSheetContentAddComponent/>
                </BottomSheetModalComponent>

                {/* PROPERTIES COMPONENTS MODAL*/}
                <BottomSheetModalComponent ref={secondModalRef} >
                    <BottomSheetContentEditProperties
                        onBack={handleBackToFirstModal}
                        onDelete={handleDelete}
                    />
                </BottomSheetModalComponent>
            </View>
    );
}




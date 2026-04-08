import React, {useEffect, useRef, useState} from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheetModalProvider,BottomSheetModal} from '@gorhom/bottom-sheet';
import { BottomSheetModalComponent } from '@/components/bottomSheetModalComponent';
import {useComponentNodeStore} from "@/editor/componentNodeStore";
import {ViewDefault, TextDefault, ImageDefault, ButtonDefault} from "@/editor/defaultNodes";

export default function EditBottomSheetStack() {
    const firstModalRef = useRef<BottomSheetModal>(null);
    const secondModalRef = useRef<BottomSheetModal>(null);

    //CRUD OPERATIONS
    const selectedID= useComponentNodeStore(s => s.selectedID);
    const setSelectedID = useComponentNodeStore.setState
    const deleteNode= useComponentNodeStore(s => s.deleteNode);
    const addNode= useComponentNodeStore(s => s.addNode);

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
        <BottomSheetModalProvider>
            <View style={canvas.container}>
                {/* ADD COMPONENTS MODAL*/}
                <BottomSheetModalComponent ref={firstModalRef}>
                    <View style={firstModal.container}>
                        {[
                            { label: 'VIEW',   action: () => addNode(ViewDefault) },
                            { label: 'TEXT',   action: () => addNode(TextDefault) },
                            { label: 'BUTTON', action: () => addNode(ButtonDefault) },
                            { label: 'IMAGE',  action: () => addNode(ImageDefault) },
                        ].map(({ label, action }) => (
                            <Pressable
                                key={label}
                                style={({ pressed }) => [
                                    firstModal.addButton,
                                    pressed && firstModal.addButtonPressed
                                ]}
                                onPress={action}
                            >
                                <Text style={firstModal.addButtonText}  adjustsFontSizeToFit>
                                    {label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </BottomSheetModalComponent>

                {/* PROPERTIES COMPONENTS MODAL*/}
                <BottomSheetModalComponent ref={secondModalRef}>
                    <View style={secondModal.actionContainer}>
                        {[
                            { label: "BACK", action: handleBackToFirstModal, variant: 'secondary' },
                            { label: "🗑️", action: handleDelete, variant: 'danger' },
                        ].map((button, index) => (
                            <Pressable
                                key={index}
                                onPress={button.action}
                                style={({ pressed }) => [
                                    secondModal.button,
                                    button.variant === 'secondary' && secondModal.buttonSecondary,
                                    button.variant === 'danger' && secondModal.buttonDanger,
                                    pressed && secondModal.buttonPressed,
                                ]}
                            >
                                <Text style={secondModal.buttonText}>
                                    {button.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                    <Text style={secondModal.propertiesLabel}>PROPERTIES</Text>
                </BottomSheetModalComponent>
            </View>
        </BottomSheetModalProvider>
    );
}

const canvas = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 18, fontWeight: 'bold' },
});

const firstModal = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        gap: 8,
    },
    addButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#6200EE',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonPressed: {
        backgroundColor: '#3700B3',
        opacity: 0.9,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },

})

const secondModal = StyleSheet.create({
    actionContainer: {
        flexDirection: 'row',
        gap: 150,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonSecondary: {
        backgroundColor: '#e1b85a',
        borderWidth: 1.5,
    },
    buttonDanger: {
        backgroundColor: '#B00020',
    },
    buttonPressed: {
        opacity: 0.75,
    },
    buttonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    propertiesLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        paddingBottom: 12,
        color: '#1a1a1a',
    },
});
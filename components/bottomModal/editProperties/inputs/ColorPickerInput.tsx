import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import ColorPicker, { Panel1, Swatches } from 'reanimated-color-picker';
import { editPropsStyles as styles } from '@/components/bottomModal/editProperties/styles';

type ColorPickerInputProps = {
    value: string;
    onChange: (color: string) => void;
};

export function ColorPickerInput({ value, onChange }: ColorPickerInputProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [draftColor, setDraftColor] = useState(value || '#FFFFFF');

    const openPicker = () => {
        setDraftColor(value || '#FFFFFF');
        setShowPicker(true);
    };

    return (
        <>
            <Pressable
                onPress={openPicker}
                style={[styles.colorButton, { backgroundColor: value || '#FFFFFF', borderColor: value ? '#333' : '#ddd' }]}
            >
                <Text style={styles.colorValue}>{value || 'Pick'}</Text>
            </Pressable>

            <Modal visible={showPicker} transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
                <Pressable style={styles.colorPickerOverlay} onPress={() => setShowPicker(false)}>
                    <Pressable style={styles.colorPickerContainer} onPress={() => {}}>
                        <View style={styles.colorPickerHeader}>
                            <Text style={styles.colorPickerTitle}>Pick a Color</Text>
                            <Pressable onPress={() => setShowPicker(false)}>
                                <Text style={styles.colorPickerClose}>X</Text>
                            </Pressable>
                        </View>

                        <ColorPicker
                            value={draftColor}
                            onChangeJS={({ hex }) => {
                                setDraftColor(hex);
                            }}
                        >
                            <Panel1 />
                            <Swatches />
                        </ColorPicker>

                        <View style={[styles.stepContainer, { justifyContent: 'flex-end', marginTop: 12 }]}>
                            <Pressable style={styles.buttonSecondary} onPress={() => setShowPicker(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={styles.buttonDanger}
                                onPress={() => {
                                    onChange(draftColor);
                                    setShowPicker(false);
                                }}
                            >
                                <Text style={styles.buttonText}>Apply</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

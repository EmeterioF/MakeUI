import { Pressable, Text, TextInput, View } from 'react-native';
import { editPropsStyles as styles } from '@/components/bottomModal/editProperties/styles';

type NumericInputProps = {
    value: string;
    onChangeText: (text: string) => void;
    onStep: (delta: number) => void;
};

export function NumericInput({ value, onChangeText, onStep }: NumericInputProps) {
    return (
        <View style={styles.stepContainer}>
            <Pressable onPress={() => onStep(-1)} style={styles.stepBtn}>
                <Text style={{ fontSize: 14, fontWeight: '600' }}>-</Text>
            </Pressable>
            <TextInput value={value} onChangeText={onChangeText} style={styles.inputSmall} keyboardType="numeric" />
            <Pressable onPress={() => onStep(1)} style={styles.stepBtn}>
                <Text style={{ fontSize: 14, fontWeight: '600' }}>+</Text>
            </Pressable>
        </View>
    );
}

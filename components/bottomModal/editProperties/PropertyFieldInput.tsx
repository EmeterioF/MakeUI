import { TextInput, View } from 'react-native';
import { PropertyField } from '@/components/bottomModal/editProperties';
import { NumericInput } from '@/components/bottomModal/editProperties/inputs/NumericInput';
import { ColorPickerInput } from '@/components/bottomModal/editProperties/inputs/ColorPickerInput';
import { SelectInput } from '@/components/bottomModal/editProperties/inputs/SelectInput';
import { editPropsStyles as styles } from '@/components/bottomModal/editProperties/styles';

type PropertyFieldInputProps = {
    item: PropertyField;
    value: string;
    onChange: (key: string, value: string, type: string) => void;
    onStep: (key: string, delta: number) => void;
};

export function PropertyFieldInput({ item, value, onChange, onStep }: PropertyFieldInputProps) {
    if (item.type === 'number') {
        return (
            <NumericInput
                value={value}
                onChangeText={(text) => onChange(item.key, text, item.type)}
                onStep={(delta) => onStep(item.key, delta)}
            />
        );
    }

    if (item.type === 'color') {
        return <ColorPickerInput value={value} onChange={(color) => onChange(item.key, color, item.type)} />;
    }

    if (item.type === 'select') {
        return (
            <SelectInput
                value={value}
                options={item.options ?? []}
                onChange={(nextValue) => onChange(item.key, nextValue, item.type)}
            />
        );
    }

    return (
        <View>
            <TextInput
                value={value}
                onChangeText={(text) => onChange(item.key, text, item.type)}
                style={styles.input}
                placeholder="Enter text..."
                placeholderTextColor="#9CA3AF"
            />
        </View>
    );
}

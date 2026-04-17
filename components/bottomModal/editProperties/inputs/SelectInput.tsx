import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { editPropsStyles as styles } from '@/components/bottomModal/editProperties/styles';

type SelectInputProps = {
    value: string;
    options: string[];
    onChange: (value: string) => void;
};

export function SelectInput({ value, options, onChange }: SelectInputProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <View>
            <Pressable onPress={() => setExpanded((prev) => !prev)} style={styles.selectButton}>
                <Text style={styles.selectButtonText}>{value || 'Select...'}</Text>
                <Text style={{ fontSize: 12 }}>v</Text>
            </Pressable>

            {expanded && (
                <View style={styles.selectDropdown}>
                    {options.map((option) => (
                        <Pressable
                            key={option}
                            onPress={() => {
                                onChange(option);
                                setExpanded(false);
                            }}
                            style={[styles.selectOption, value === option && styles.selectOptionActive]}
                        >
                            <Text style={[styles.selectOptionText, value === option && styles.selectOptionTextActive]}>
                                {option}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
}

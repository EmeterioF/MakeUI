import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { properties } from '@/components/bottomModal/editProperties';
import { editPropsStyles as styles } from '@/components/bottomModal/editProperties/styles';
import { usePropertyEditor } from '@/components/bottomModal/editProperties/usePropertyEditor';
import { PropertyFieldInput } from '@/components/bottomModal/editProperties/PropertyFieldInput';

type Props = {
    onBack: () => void;
    onDelete: () => void;
};

export default function BottomSheetContentEditProperties({ onBack, onDelete }: Props) {
    const [selectedHeader, setSelectedHeader] = useState(properties[0]?.header ?? 'Layout');
    const { selectedNode, getValue, handleChange, stepValue } = usePropertyEditor();

    const activeSection = useMemo(
        () => properties.find((section) => section.header === selectedHeader),
        [selectedHeader]
    );

    if (!selectedNode) {
        return (
            <View style={styles.actionContainer}>
                <Text style={styles.buttonText}>Select a component to edit properties.</Text>
            </View>
        );
    }

    return (
        <BottomSheetScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <View style={styles.actionContainer}>
                <Pressable onPress={onBack} style={styles.buttonSecondary}>
                    <Text style={styles.buttonText}>BACK</Text>
                </Pressable>
                <Pressable onPress={onDelete} style={styles.buttonDanger}>
                    <Text style={styles.buttonTextDanger}>DEL</Text>
                </Pressable>
            </View>

            <View style={styles.headerTabs}>
                {properties.map((section) => (
                    <Pressable
                        key={section.header}
                        onPress={() => setSelectedHeader(section.header)}
                        style={[styles.tabButton, selectedHeader === section.header && styles.tabButtonActive]}
                    >
                        <Text style={[styles.tabText, selectedHeader === section.header && styles.tabTextActive]}>
                            {section.header}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {activeSection?.styles.map((item) => (
                <View key={item.key} style={styles.propertyRow}>
                    <Text style={styles.propertyLabel}>{item.label}</Text>
                    <PropertyFieldInput
                        item={item}
                        value={getValue(item.key)}
                        onChange={handleChange}
                        onStep={stepValue}
                    />
                </View>
            ))}
        </BottomSheetScrollView>
    );
}

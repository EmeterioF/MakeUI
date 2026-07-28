import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { getPropertiesForComponent } from '@/components/bottomModal/editProperties';
import { editPropsStyles as styles } from '@/components/bottomModal/editProperties/styles';
import { usePropertyEditor } from '@/components/bottomModal/editProperties/usePropertyEditor';
import { PropertyFieldInput } from '@/components/bottomModal/editProperties/PropertyFieldInput';

type Props = {
    onBack: () => void;
    onDelete: () => void;
};

export default function BottomSheetContentEditProperties({ onBack, onDelete }: Props) {
    const [selectedHeader, setSelectedHeader] = useState('Layout');
    const { selectedNode, getValue, handleChange, stepValue } = usePropertyEditor();

    const visibleProperties = useMemo(
        () => (selectedNode ? getPropertiesForComponent(selectedNode.type) : []),
        [selectedNode]
    );

    useEffect(() => {
        if (!visibleProperties.length) return;
        const hasSelectedHeader = visibleProperties.some((section) => section.header === selectedHeader);
        if (!hasSelectedHeader) {
            setSelectedHeader(visibleProperties[0].header);
        }
    }, [visibleProperties, selectedHeader]);

    const activeSection = useMemo(
        () => visibleProperties.find((section) => section.header === selectedHeader),
        [visibleProperties, selectedHeader]
    );

    if (!selectedNode) return <View style={styles.scrollContent} />;

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
                {visibleProperties.map((section) => (
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

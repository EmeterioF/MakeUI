import { Pressable, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';

export type SegmentedOption<T extends string> = {
    label: string;
    value: T;
};

type SegmentedControlProps<T extends string> = {
    title: string;
    value: T;
    options: SegmentedOption<T>[];
    onChange: (next: T) => void;
    rowStyle?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    itemStyle?: StyleProp<ViewStyle>;
    activeItemStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    activeTextStyle?: StyleProp<TextStyle>;
};

export function SegmentedControl<T extends string>({
    title,
    value,
    options,
    onChange,
    rowStyle,
    labelStyle,
    containerStyle,
    itemStyle,
    activeItemStyle,
    textStyle,
    activeTextStyle,
}: SegmentedControlProps<T>) {
    return (
        <View style={rowStyle}>
            <Text style={labelStyle}>{title}</Text>
            <View style={containerStyle}>
                {options.map((option) => (
                    <Pressable
                        key={option.value}
                        onPress={() => onChange(option.value)}
                        style={[itemStyle, value === option.value && activeItemStyle]}
                    >
                        <Text style={[textStyle, value === option.value && activeTextStyle]}>{option.label}</Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

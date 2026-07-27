import * as ImagePicker from 'expo-image-picker';
import { Pressable, Text, View, Image } from 'react-native';

interface Props {
    value: string;
    onChange: (uri: string) => void;
}

export function ImagePickerInput({ value, onChange }: Props) {
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
        });
        if (!result.canceled && result.assets[0]) {
            onChange(result.assets[0].uri);
        }
    };

    return (
        <View style={{ marginTop: 8 }}>
            {value ? (
                <Image
                    source={{ uri: value }}
                    style={{ width: '100%', height: 120, borderRadius: 8, marginBottom: 8 }}
                    resizeMode="cover"
                />
            ) : null}
            <Pressable
                onPress={pickImage}
                style={{
                    padding: 12,
                    backgroundColor: '#E8E8E8',
                    borderRadius: 8,
                    alignItems: 'center',
                }}
            >
                <Text>{value ? 'Change Image' : 'Pick from Gallery'}</Text>
            </Pressable>
            {value ? <Text style={{ fontSize: 10, color: '#999', marginTop: 4 }}>{value.substring(0, 50)}...</Text> : null}
        </View>
    );
}

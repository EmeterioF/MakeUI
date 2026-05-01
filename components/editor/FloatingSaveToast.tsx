import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useEditorSaveNoticeStore } from '@/components/editor/useEditorSaveNoticeStore';

const DISPLAY_MS = 1400;

export function FloatingSaveToast() {
    const isVisible = useEditorSaveNoticeStore((s) => s.isVisible);
    const message = useEditorSaveNoticeStore((s) => s.message);
    const noticeId = useEditorSaveNoticeStore((s) => s.noticeId);
        const hideSaveNotice = useEditorSaveNoticeStore((s) => s.hideSaveNotice);
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(8)).current;

    useEffect(() => {
        if (!isVisible) {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 140,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 8,
                    duration: 140,
                    useNativeDriver: true,
                }),
            ]).start();
            return;
        }

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 160,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 160,
                useNativeDriver: true,
            }),
        ]).start();

        const timeoutId = setTimeout(hideSaveNotice, DISPLAY_MS);
        return () => clearTimeout(timeoutId);
    }, [hideSaveNotice, isVisible, noticeId, opacity, translateY]);

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.toast,
                {
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        top: 16,
        alignSelf: 'center',
        minHeight: 38,
        justifyContent: 'center',
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#86EFAC',
        backgroundColor: '#DCFCE7',
        shadowColor: '#000000',
        shadowOpacity: 0.14,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        zIndex: 20,
    },
    text: {
        color: '#166534',
        fontSize: 12,
        fontWeight: '800',
    },
});

import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Image, Dimensions } from 'react-native';
import { Carousel } from 'react-native-reanimated-carousel';
import type { CarouselRef } from 'react-native-reanimated-carousel';
import tutorialSteps from './tutorialSteps';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
    visible: boolean;
    onDismiss: () => void;
};

export default function TutorialOverlay({ visible, onDismiss }: Props) {
    const carouselRef = useRef<CarouselRef>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const totalSteps = tutorialSteps.length;
    const isLast = currentIndex === totalSteps - 1;

    const handleNext = () => {
        if (isLast) {
            onDismiss();
        } else {
            carouselRef.current?.next();
        }
    };

    if (!visible) return null;

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onDismiss}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <View />
                        <Pressable
                            onPress={onDismiss}
                            style={({ pressed }) => [styles.skipBtn, pressed && styles.buttonPressed]}
                        >
                            <Text style={styles.skipText}>Skip</Text>
                        </Pressable>
                    </View>

                    <View style={styles.carouselWrapper}>
                        <Carousel
                            ref={carouselRef}
                            data={tutorialSteps}
                            loop={false}
                            animation={{ type: 'timing', duration: 250 }}
                            onSnapToItem={setCurrentIndex}
                            style={{ width: '100%', height: '100%' }}
                            renderItem={({ item }) => (
                                <View style={styles.imageContainer}>
                                    <Image source={item} style={styles.image} resizeMode="contain" />
                                </View>
                            )}
                        />
                    </View>

                    <View style={styles.dotsRow}>
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <View
                                key={i}
                                style={[styles.dot, i === currentIndex && styles.dotActive]}
                            />
                        ))}
                    </View>

                    <Pressable
                        style={({ pressed }) => [styles.nextBtn, pressed && styles.buttonPressed]}
                        onPress={handleNext}
                    >
                        <Text style={styles.nextText}>{isLast ? 'Got it' : 'Next'}</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '92%',
        height: SCREEN_HEIGHT * 0.75,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 4,
    },
    skipBtn: {
        minHeight: 32,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    carouselWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D1D5DB',
    },
    dotActive: {
        backgroundColor: '#007AFF',
        width: 24,
        height: 8,
        borderRadius: 4,
    },
    nextBtn: {
        marginHorizontal: 16,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: '#111827',
    },
    nextText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.97 }],
    },
});

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Modal,
    Image,
    Dimensions,
    type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { runOnJS, useAnimatedReaction, useSharedValue } from 'react-native-reanimated';
import { Carousel, Pagination } from 'react-native-reanimated-carousel';
import type { CarouselRef } from 'react-native-reanimated-carousel';
import tutorialSteps from './tutorialSteps';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ANIMATION = { type: 'spring', stiffness: 220, damping: 28, mass: 0.7 } as const;

type Props = {
    visible: boolean;
    onDismiss: () => void;
};

export default function TutorialOverlay({ visible, onDismiss }: Props) {
    const carouselRef = useRef<CarouselRef>(null);
    const progress = useSharedValue(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [carouselSize, setCarouselSize] = useState({ width: 0, height: 0 });
    const totalSteps = tutorialSteps.length;
    const isLast = currentIndex === totalSteps - 1;

    // Drive currentIndex from the frame-accurate progress SharedValue so
    // the "Got it"/"Next" button text updates instantly during a swipe,
    // rather than waiting for the snap animation to settle.
    useAnimatedReaction(
        () => Math.round(progress.value),
        (current, previous) => {
            if (current !== previous) {
                runOnJS(setCurrentIndex)(current);
            }
        },
        []
    );

    useEffect(() => {
        if (visible) {
            setCurrentIndex(0);
            progress.value = 0;
        }
    }, [visible, progress]);

    const handleCarouselLayout = useCallback((event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setCarouselSize((prev) =>
            prev.width === width && prev.height === height ? prev : { width, height }
        );
    }, []);

    const handleNext = useCallback(() => {
        if (isLast) {
            onDismiss();
        } else {
            carouselRef.current?.next({ animated: true });
        }
    }, [isLast, onDismiss]);

    const handleSkip = useCallback(() => {
        onDismiss();
    }, [onDismiss]);

    const handleDotPress = useCallback((index: number) => {
        carouselRef.current?.scrollTo({ index, animated: true });
    }, []);

    const getDotAccessibilityLabel = useCallback(
        (index: number, count: number) => `Step ${index + 1} of ${count}`,
        []
    );

    if (!visible) return null;

    const isCarouselMeasured = carouselSize.width > 0 && carouselSize.height > 0;

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onDismiss}
            statusBarTranslucent
        >
            <SafeAreaView style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Tutorial</Text>
                        <Pressable
                            onPress={handleSkip}
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityLabel="Skip tutorial"
                            style={({ pressed }) => [styles.skipBtn, pressed && styles.buttonPressed]}
                        >
                            <Text style={styles.skipText}>Skip</Text>
                        </Pressable>
                    </View>

                    <View style={styles.carouselWrapper} onLayout={handleCarouselLayout}>
                        {isCarouselMeasured && (
                            <Carousel
                                ref={carouselRef}
                                data={tutorialSteps}
                                defaultIndex={0}
                                loop={false}
                                overscrollEnabled={false}
                                snapMode="page"
                                animation={ANIMATION}
                                progress={progress}
                                style={{
                                    width: carouselSize.width,
                                    height: carouselSize.height,
                                }}
                                renderItem={({ item }) => (
                                    <View style={styles.imageContainer}>
                                        <Image source={item} style={styles.image} resizeMode="contain" />
                                    </View>
                                )}
                            />
                        )}
                    </View>

                    <Pagination
                        progress={progress}
                        count={totalSteps}
                        onPress={handleDotPress}
                        getItemAccessibilityLabel={getDotAccessibilityLabel}
                        containerStyle={styles.dotsRow}
                        dotStyle={styles.dot}
                        activeDotStyle={styles.dotActive}
                    />

                    <Pressable
                        style={({ pressed }) => [styles.nextBtn, pressed && styles.buttonPressed]}
                        onPress={handleNext}
                        accessibilityRole="button"
                        accessibilityLabel={isLast ? 'Finish tutorial' : 'Next step'}
                    >
                        <Text style={styles.nextText}>{isLast ? 'Got it' : 'Next'}</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
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
        borderRadius: 20,
        overflow: 'hidden',
        paddingBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
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
        borderRadius: 12,
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
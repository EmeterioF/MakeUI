import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Modal,
    Image,
    Dimensions,
    FlatList,
    type LayoutChangeEvent,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tutorialSteps from './tutorialSteps';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
    visible: boolean;
    onDismiss: () => void;
};

export default function TutorialOverlay({ visible, onDismiss }: Props) {
    const listRef = useRef<FlatList<number>>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
    const totalSteps = tutorialSteps.length;
    const isLast = currentIndex === totalSteps - 1;

    useEffect(() => {
        if (visible) {
            setCurrentIndex(0);
            listRef.current?.scrollToOffset({ offset: 0, animated: false });
        }
    }, [visible]);

    const handlePagerLayout = useCallback((event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setPageSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    }, []);

    const handleMomentumScrollEnd = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (pageSize.width > 0) {
                const index = Math.round(event.nativeEvent.contentOffset.x / pageSize.width);
                setCurrentIndex(Math.max(0, Math.min(totalSteps - 1, index)));
            }
        },
        [pageSize.width, totalSteps]
    );

    // Continuous source of truth for the indicator: follows the real
    // scroll position every frame, so rapid swipes or Next taps can
    // never leave the dots showing a stale page.
    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (pageSize.width > 0) {
                const index = Math.round(event.nativeEvent.contentOffset.x / pageSize.width);
                const clamped = Math.max(0, Math.min(totalSteps - 1, index));
                setCurrentIndex((prev) => (prev === clamped ? prev : clamped));
            }
        },
        [pageSize.width, totalSteps]
    );

    const handleNext = useCallback(() => {
        if (isLast) {
            onDismiss();
        } else {
            listRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
        }
    }, [isLast, onDismiss, currentIndex]);

    const handleSkip = useCallback(() => {
        onDismiss();
    }, [onDismiss]);

    const handleDotPress = useCallback((index: number) => {
        listRef.current?.scrollToIndex({ index, animated: true });
    }, []);

    if (!visible) return null;

    const isPagerMeasured = pageSize.width > 0 && pageSize.height > 0;

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

                    <View style={styles.carouselWrapper} onLayout={handlePagerLayout}>
                        {isPagerMeasured && (
                            <FlatList
                                ref={listRef}
                                data={tutorialSteps}
                                keyExtractor={(_, index) => String(index)}
                                horizontal
                                pagingEnabled
                                disableIntervalMomentum
                                snapToInterval={pageSize.width}
                                snapToAlignment="center"
                                decelerationRate="fast"
                                showsHorizontalScrollIndicator={false}
                                bounces={false}
                                overScrollMode="never"
                                scrollEventThrottle={16}
                                onScroll={handleScroll}
                                onMomentumScrollEnd={handleMomentumScrollEnd}
                                getItemLayout={(_, index) => ({
                                    length: pageSize.width,
                                    offset: pageSize.width * index,
                                    index,
                                })}
                                renderItem={({ item }) => (
                                    <View
                                        style={[
                                            styles.imageContainer,
                                            { width: pageSize.width, height: pageSize.height },
                                        ]}
                                    >
                                        <Image
                                            source={item}
                                            style={styles.image}
                                            resizeMode="contain"
                                            fadeDuration={0}
                                        />
                                    </View>
                                )}
                            />
                        )}
                    </View>

                    <View style={styles.dotsRow}>
                        {Array.from({ length: totalSteps }).map((_, index) => (
                            <Pressable
                                key={index}
                                onPress={() => handleDotPress(index)}
                                hitSlop={8}
                                accessibilityRole="button"
                                accessibilityLabel={`Step ${index + 1} of ${totalSteps}`}
                            >
                                <View
                                    style={[
                                        styles.dot,
                                        index === currentIndex && styles.dotActive,
                                    ]}
                                />
                            </Pressable>
                        ))}
                    </View>

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

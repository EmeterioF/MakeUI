import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

const SETTLE_MS = 500;
const REVEAL_MS = 900;
const HOLD_MS = 600;
const FADE_DURATION_MS = 200;
const REDUCED_MOTION_HOLD_MS = 1000;
const REDUCED_MOTION_FADE_MS = 300;
const MIN_VISIBLE_MS = SETTLE_MS + REVEAL_MS + HOLD_MS + FADE_DURATION_MS;
const ROW_SHIFT = -70;
const LOGO_SIZE = 180;
const WORD_GAP = 16;
const WORD_FONT_SIZE = 40;
const WORD_FALLBACK_WIDTH = 200;
const WORD_SLIDE_DISTANCE = 24;
const WORD_SLIDE_DELAY_MS = 150;

type Props = {
    onDone: () => void;
};

export default function AnimatedSplash({ onDone }: Props) {
    const settle = useSharedValue(0);
    const reveal = useSharedValue(0);
    const wordIn = useSharedValue(0);
    const opacity = useSharedValue(1);
    const [wordWidth, setWordWidth] = useState(WORD_FALLBACK_WIDTH);
    const doneRef = useRef(false);
    const mountTimeRef = useRef(0);
    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;

    function complete() {
        if (doneRef.current) return;
        doneRef.current = true;
        onDoneRef.current();
    }

    function finish() {
        if (doneRef.current) return;
        const remaining = MIN_VISIBLE_MS - (Date.now() - mountTimeRef.current);
        if (remaining > 0) {
            setTimeout(complete, remaining);
        } else {
            complete();
        }
    }

    const fadeStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const rowStyle = useAnimatedStyle(() => ({
        opacity: settle.value,
        transform: [{ translateX: ROW_SHIFT * reveal.value }],
    }));

    const maskStyle = useAnimatedStyle(() => ({
        width: wordWidth * reveal.value,
    }));

    const wordStyle = useAnimatedStyle(() => ({
        opacity: wordIn.value,
        transform: [{ translateX: -WORD_SLIDE_DISTANCE * (1 - wordIn.value) }],
    }));

    useEffect(() => {
        mountTimeRef.current = Date.now();
        // Reveal this overlay immediately. The native splash sits on top of
        // all JS views, so the intro would otherwise play invisibly beneath it.
        void SplashScreen.hideAsync().catch(() => {});

        function fadeOutAndFinish(duration: number) {
            opacity.value = withTiming(0, { duration }, (finished) => {
                if (finished) runOnJS(finish)();
            });
        }

        function startReveal() {
            reveal.value = withTiming(
                1,
                { duration: REVEAL_MS, easing: Easing.out(Easing.cubic) },
                (revealFinished) => {
                    if (revealFinished) {
                        setTimeout(() => {
                            runOnJS(fadeOutAndFinish)(FADE_DURATION_MS);
                        }, HOLD_MS);
                    }
                }
            );
            // The word trails the mask wipe slightly so it drifts out
            // from behind the logo instead of just unclipping.
            setTimeout(() => {
                if (!cancelled && !doneRef.current) {
                    wordIn.value = withTiming(1, { duration: REVEAL_MS - WORD_SLIDE_DELAY_MS });
                }
            }, WORD_SLIDE_DELAY_MS);
        }

        function startIntro() {
            settle.value = withTiming(1, { duration: SETTLE_MS }, (finished) => {
                if (finished) runOnJS(startReveal)();
            });
        }

        function showStaticFinalFrame() {
            settle.value = 1;
            reveal.value = 1;
            wordIn.value = 1;
            setTimeout(() => {
                if (!doneRef.current) fadeOutAndFinish(REDUCED_MOTION_FADE_MS);
            }, REDUCED_MOTION_HOLD_MS);
        }

        let cancelled = false;
        void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
            if (cancelled || doneRef.current) return;
            if (reduced) {
                showStaticFinalFrame();
            } else {
                startIntro();
            }
        });

        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'background' && !doneRef.current) {
                complete();
            }
        });

        return () => {
            cancelled = true;
            subscription.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View style={styles.overlay}>
            <Animated.View style={[styles.fade, fadeStyle]}>
                <Animated.View style={[styles.row, rowStyle]}>
                    <Image
                        source={require('@/assets/logo.jpg')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Animated.View style={[styles.mask, maskStyle]}>
                        <Animated.View style={[styles.wordSlide, wordStyle]}>
                            <Text
                                style={styles.word}
                                numberOfLines={1}
                                onLayout={(event) => {
                                    const { width } = event.nativeEvent.layout;
                                    if (width > 0) setWordWidth(width);
                                }}
                            >
                                MakeUI
                            </Text>
                        </Animated.View>
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        zIndex: 100,
        elevation: 100,
    },
    fade: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        borderRadius: 20,
    },
    mask: {
        overflow: 'hidden',
        marginLeft: WORD_GAP,
    },
    wordSlide: {
        justifyContent: 'center',
    },
    word: {
        fontSize: WORD_FONT_SIZE,
        fontWeight: '800',
        letterSpacing: 0.5,
        color: '#111111',
    },
});
